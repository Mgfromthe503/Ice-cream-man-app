#!/usr/bin/env node

const token = process.env.EXPO_TOKEN;
if (!token) {
  console.error("EXPO_TOKEN is required for the read-only EAS credential metadata audit.");
  process.exit(1);
}

const query = `
  query AndroidCredentialMetadata {
    app {
      byFullName(fullName: "@mgfromthe503/the-ice-cream-man-app") {
        id
        androidAppCredentials(filter: {
          applicationIdentifier: "com.icecreamman.app"
          legacyOnly: false
        }) {
          id
          applicationIdentifier
          isLegacy
          androidAppBuildCredentialsList {
            id
            name
            isDefault
            isLegacy
            androidKeystore {
              id
              type
              keyAlias
              md5CertificateFingerprint
              sha1CertificateFingerprint
              sha256CertificateFingerprint
              createdAt
              updatedAt
            }
          }
        }
      }
    }
  }
`;

async function main() {
  const response = await fetch("https://api.expo.dev/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(`Expo credential metadata request failed with HTTP ${response.status}.`);
  }

  const result = await response.json();
  if (result.errors?.length) {
    throw new Error(`Expo credential metadata query failed: ${result.errors.map(({ message }) => message).join("; ")}`);
  }

  const app = result.data?.app?.byFullName;
  if (!app) {
    throw new Error("The configured EAS project was not found.");
  }

  const credentials = (app.androidAppCredentials ?? []).map((credential) => ({
    id: credential.id,
    applicationIdentifier: credential.applicationIdentifier,
    isLegacy: credential.isLegacy,
    buildCredentials: (credential.androidAppBuildCredentialsList ?? []).map((buildCredential) => ({
      id: buildCredential.id,
      name: buildCredential.name,
      isDefault: buildCredential.isDefault,
      isLegacy: buildCredential.isLegacy,
      keystore: buildCredential.androidKeystore
        ? {
            id: buildCredential.androidKeystore.id,
            type: buildCredential.androidKeystore.type,
            keyAlias: buildCredential.androidKeystore.keyAlias,
            md5CertificateFingerprint: buildCredential.androidKeystore.md5CertificateFingerprint,
            sha1CertificateFingerprint: buildCredential.androidKeystore.sha1CertificateFingerprint,
            sha256CertificateFingerprint: buildCredential.androidKeystore.sha256CertificateFingerprint,
            createdAt: buildCredential.androidKeystore.createdAt,
            updatedAt: buildCredential.androidKeystore.updatedAt,
          }
        : null,
    })),
  }));

  console.log(JSON.stringify({ appId: app.id, credentials }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
