#!/usr/bin/env node
/**
 * Reads the JSON emitted by `eas build --json --wait` and prints GitHub Actions
 * outputs for the exact completed Android build. It handles the Android-only
 * result array emitted by EAS and intentionally exports no credential values.
 */
"use strict";

const fs = require("fs");

const [inputPath] = process.argv.slice(2);

function fail(message) {
  console.error(`[export-eas-build-metadata] ${message}`);
  process.exit(1);
}

if (!inputPath) {
  fail(
    "Usage: node scripts/export-eas-build-metadata.cjs <eas-build-output.json>",
  );
}

let parsed;
try {
  parsed = JSON.parse(fs.readFileSync(inputPath, "utf8"));
} catch (error) {
  fail(`Unable to parse EAS build JSON: ${error.message}`);
}

const builds = Array.isArray(parsed) ? parsed : [parsed];
if (builds.length !== 1 || !builds[0] || typeof builds[0] !== "object") {
  fail(`Expected one Android build result, received ${builds.length}.`);
}

const build = builds[0];
if (build.status !== "FINISHED") {
  fail(
    `EAS build did not finish successfully (status: ${build.status || "unknown"}).`,
  );
}

const versionCode = String(build.appBuildVersion || "");
if (!/^\d+$/.test(versionCode)) {
  fail(
    `EAS did not return a numeric Android version code (received: ${versionCode || "empty"}).`,
  );
}

const buildId = String(build.id || "");
if (!buildId) {
  fail("EAS did not return a build ID.");
}

const buildArtifactsUrl = String(build.artifacts?.buildArtifactsUrl || "");
if (!/^https:\/\//.test(buildArtifactsUrl)) {
  fail(
    "EAS did not return a secure build-artifacts archive URL for the R8 mapping file.",
  );
}

console.log(`build_id=${buildId}`);
console.log(`version_code=${versionCode}`);
console.log(`build_artifacts_url=${buildArtifactsUrl}`);
