#!/usr/bin/env node
/**
 * Confirms that the default remote Android keystore in EAS matches the upload
 * certificate currently registered in Google Play. This script requests only
 * public certificate metadata; it never downloads a keystore or accesses a
 * keystore password, service-account key, or other private credential.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const CONFIG_PATH = "config/google-play-signing.json";
const GRAPHQL_URL =
  process.env.EXPO_GRAPHQL_URL || "https://api.expo.dev/graphql";
const errors = [];

function log(message) {
  console.log(`[verify-eas-play-signing] ${message}`);
}

function fail(message) {
  errors.push(message);
}

function readText(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) {
    fail(`${relativePath} is missing.`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function readJson(relativePath) {
  const contents = readText(relativePath);
  if (!contents) return null;

  try {
    return JSON.parse(contents);
  } catch (error) {
    fail(`${relativePath} is not valid JSON: ${error.message}`);
    return null;
  }
}

function normalizeSha1(value) {
  const hex = String(value || "")
    .replace(/[^a-f0-9]/gi, "")
    .toUpperCase();

  if (!/^[A-F0-9]{40}$/.test(hex)) {
    return null;
  }

  return hex.match(/.{2}/g).join(":");
}

function expectIdentity(identitySource, name, value) {
  const pattern = new RegExp(
    `export const ${name} = ["']${value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'];`,
  );

  if (!pattern.test(identitySource)) {
    fail(`config/app-identity.js must export ${name}=${value}.`);
  }
}

function validateConfiguration() {
  const contract = readJson(CONFIG_PATH);
  const identitySource = readText("config/app-identity.js");
  const easConfig = readJson("eas.json");

  if (!contract) return null;

  const expo = contract.expo || {};
  const android = contract.android || {};
  const googlePlay = contract.googlePlay || {};
  const expectedSha1 = normalizeSha1(googlePlay.expectedUploadCertificateSha1);

  if (!expo.owner || !expo.slug || !expo.projectId) {
    fail(`${CONFIG_PATH} must define Expo owner, slug, and projectId.`);
  }
  if (!android.packageName) {
    fail(`${CONFIG_PATH} must define android.packageName.`);
  }
  if (android.credentialsSource !== "remote") {
    fail(`${CONFIG_PATH} must require android.credentialsSource="remote".`);
  }
  if (!expectedSha1) {
    fail(
      `${CONFIG_PATH} must contain a complete SHA-1 upload-certificate fingerprint.`,
    );
  }

  expectIdentity(identitySource, "EXPO_OWNER", expo.owner);
  expectIdentity(identitySource, "APP_SLUG", expo.slug);
  expectIdentity(identitySource, "EAS_PROJECT_ID", expo.projectId);
  expectIdentity(identitySource, "APP_BUNDLE_ID", android.packageName);

  const productionAndroid = easConfig?.build?.production?.android;
  if (!productionAndroid || productionAndroid.credentialsSource !== "remote") {
    fail("eas.json production.android must set credentialsSource to remote.");
  }

  return { expo, android, expectedSha1 };
}

async function fetchEasCertificate(contract) {
  if (!process.env.EXPO_TOKEN) {
    fail(
      "EXPO_TOKEN is required to read public EAS Android certificate metadata.",
    );
    return null;
  }

  const query = `
    query ProductionAndroidSigningMetadata(
      $projectFullName: String!
      $applicationIdentifier: String!
    ) {
      app {
        byFullName(fullName: $projectFullName) {
          id
          androidAppCredentials(
            filter: {
              applicationIdentifier: $applicationIdentifier
              legacyOnly: false
            }
          ) {
            applicationIdentifier
            androidAppBuildCredentialsList {
              name
              isDefault
              androidKeystore {
                sha1CertificateFingerprint
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.EXPO_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables: {
        projectFullName: `@${contract.expo.owner}/${contract.expo.slug}`,
        applicationIdentifier: contract.android.packageName,
      },
    }),
  });

  let payload;
  try {
    payload = await response.json();
  } catch {
    fail(
      `EAS credential metadata request returned HTTP ${response.status} without JSON.`,
    );
    return null;
  }

  if (!response.ok || payload.errors?.length) {
    const details = payload.errors
      ?.map((error) => error.message)
      .filter(Boolean)
      .join("; ");
    fail(
      `Unable to read public EAS credential metadata (HTTP ${response.status})${details ? `: ${details}` : "."}`,
    );
    return null;
  }

  const credentials = payload.data?.app?.byFullName?.androidAppCredentials;
  if (!Array.isArray(credentials) || credentials.length !== 1) {
    fail(
      `Expected exactly one EAS Android credential record for ${contract.android.packageName}; found ${Array.isArray(credentials) ? credentials.length : 0}.`,
    );
    return null;
  }

  const buildCredentials = credentials[0].androidAppBuildCredentialsList;
  const defaults = Array.isArray(buildCredentials)
    ? buildCredentials.filter((credential) => credential.isDefault)
    : [];

  if (defaults.length !== 1) {
    fail(
      `Expected exactly one default EAS Android build credential; found ${defaults.length}.`,
    );
    return null;
  }

  const foundSha1 = normalizeSha1(
    defaults[0].androidKeystore?.sha1CertificateFingerprint,
  );
  if (!foundSha1) {
    fail(
      "EAS did not return a complete SHA-1 for the default Android keystore.",
    );
    return null;
  }

  return { foundSha1, credentialName: defaults[0].name || "default" };
}

async function main() {
  const contract = validateConfiguration();

  if (errors.length === 0 && contract) {
    const easCredential = await fetchEasCertificate(contract);

    if (easCredential && easCredential.foundSha1 !== contract.expectedSha1) {
      fail(
        [
          "Google Play upload-certificate mismatch.",
          `Found in EAS: ${easCredential.foundSha1} (${easCredential.credentialName}).`,
          `Expected by Google Play: ${contract.expectedSha1}.`,
          "Do not build or submit until the original upload key is restored or Google Play activates an upload-key reset.",
        ].join(" "),
      );
    }
  }

  if (errors.length > 0) {
    console.error(
      `[verify-eas-play-signing] FAILED\n\n${errors.join("\n\n")}\n`,
    );
    process.exit(1);
  }

  log("OK — the default EAS Android upload certificate matches Google Play.");
}

main().catch((error) => {
  console.error(`[verify-eas-play-signing] FAILED\n\n${error.message}\n`);
  process.exit(1);
});
