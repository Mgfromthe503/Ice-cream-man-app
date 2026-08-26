#!/usr/bin/env node
/**
 * Uploads an R8/ProGuard mapping file to Google Play for one Android version
 * code. Credentials are supplied by a temporary, permission-restricted JSON
 * file created by CI and are never printed or persisted by this script.
 */
"use strict";

const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");

const ROOT = path.resolve(__dirname, "..");
const ANDROID_PUBLISHER_SCOPE =
  "https://www.googleapis.com/auth/androidpublisher";

function fail(message) {
  console.error(`[upload-play-deobfuscation] ${message}`);
  process.exit(1);
}

function parseArguments(argv) {
  const values = {};

  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index];
    const value = argv[index + 1];

    if (!flag?.startsWith("--") || !value) {
      fail(
        "Usage: --keyfile <path> --version-code <number> --mapping-file <path>",
      );
    }

    values[flag.slice(2)] = value;
  }

  for (const requiredFlag of ["keyfile", "version-code", "mapping-file"]) {
    if (!values[requiredFlag]) {
      fail(
        "Usage: --keyfile <path> --version-code <number> --mapping-file <path>",
      );
    }
  }

  return values;
}

function readPackageName() {
  const contractPath = path.join(ROOT, "config/google-play-signing.json");

  try {
    const contract = JSON.parse(fs.readFileSync(contractPath, "utf8"));
    const packageName = contract.android?.packageName;

    if (!packageName || typeof packageName !== "string") {
      fail("config/google-play-signing.json must define android.packageName.");
    }

    return packageName;
  } catch (error) {
    fail(`Unable to read config/google-play-signing.json: ${error.message}`);
  }
}

async function main() {
  const {
    keyfile,
    "version-code": versionCode,
    "mapping-file": mappingFile,
  } = parseArguments(process.argv.slice(2));

  if (!fs.existsSync(keyfile)) {
    fail("The temporary Google Play service-account file does not exist.");
  }
  if (!fs.existsSync(mappingFile)) {
    fail("The extracted R8 mapping file does not exist.");
  }
  if (!/^\d+$/.test(String(versionCode))) {
    fail("--version-code must be a positive integer.");
  }

  const packageName = readPackageName();
  const auth = new google.auth.GoogleAuth({
    keyFile: keyfile,
    scopes: [ANDROID_PUBLISHER_SCOPE],
  });
  const publisher = google.androidpublisher({ version: "v3", auth });
  const edit = await publisher.edits.insert({ packageName, requestBody: {} });
  const editId = edit.data.id;

  if (!editId) {
    fail("Google Play did not create an edit for the deobfuscation upload.");
  }

  try {
    await publisher.edits.deobfuscationfiles.upload({
      packageName,
      editId,
      apkVersionCode: Number(versionCode),
      deobfuscationFileType: "proguard",
      media: {
        mimeType: "text/plain",
        body: fs.createReadStream(mappingFile),
      },
    });

    await publisher.edits.commit({ packageName, editId });
  } catch (error) {
    try {
      await publisher.edits.delete({ packageName, editId });
    } catch {
      // The original error is more actionable than cleanup failure.
    }
    throw error;
  }

  console.log(
    `[upload-play-deobfuscation] Uploaded R8 mapping for ${packageName} version code ${versionCode}.`,
  );
}

main().catch((error) => {
  const message = error?.response?.data?.error?.message || error.message;
  console.error(`[upload-play-deobfuscation] ${message}`);
  process.exit(1);
});
