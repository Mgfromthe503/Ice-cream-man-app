/**
 * Guards dependency and toolchain drift that otherwise appears only on CI/EAS:
 *
 * 1. `pnpm-workspace.yaml` is the pnpm 11 source of truth for resolver settings.
 * 2. `pnpm-lock.yaml` must record the exact same override map.
 * 3. Local, CI, and EAS builds must use the pinned pnpm release.
 *
 * Dependency-free on purpose: this runs before node_modules is available.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const BRACE_EXPANSION_PIN = "2.1.4";
const REQUIRED_PNPM_MAJOR = 11;
const errors = [];

function fail(message) {
  errors.push(message);
}

function log(message) {
  console.log(`[verify-pnpm-overrides] ${message}`);
}

function readFile(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  return fs.existsSync(absolutePath)
    ? fs.readFileSync(absolutePath, "utf8")
    : null;
}

function readJson(relativePath) {
  const contents = readFile(relativePath);
  if (!contents) {
    fail(`${relativePath} is missing.`);
    return {};
  }

  try {
    return JSON.parse(contents);
  } catch (error) {
    fail(`${relativePath} is not valid JSON: ${error.message}`);
    return {};
  }
}

function unquote(value) {
  const trimmed = value.trim();
  const quoted =
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'));
  return quoted ? trimmed.slice(1, -1) : trimmed;
}

/**
 * Read a flat top-level `overrides:` map from pnpm YAML without adding a YAML
 * dependency to this pre-install guard.
 */
function parseOverridesBlock(yaml) {
  const lines = yaml.split("\n");
  const start = lines.findIndex((line) => /^overrides:\s*$/.test(line));
  if (start === -1) return null;

  const overrides = {};
  for (const line of lines.slice(start + 1)) {
    if (line.trim() === "" || line.trim().startsWith("#")) continue;
    if (!/^\s/.test(line)) break;
    const separator = line.lastIndexOf(": ");
    if (separator === -1) continue;
    overrides[unquote(line.slice(0, separator))] = unquote(
      line.slice(separator + 2),
    );
  }
  return overrides;
}

function parsePackageManager(packageManager) {
  const match = /^pnpm@(\d+)\.(\d+)\.(\d+)$/.exec(packageManager || "");
  if (!match) return null;
  return {
    version: `${match[1]}.${match[2]}.${match[3]}`,
    major: Number(match[1]),
  };
}

function diffOverrides(expected, actual) {
  const keys = [
    ...new Set([...Object.keys(expected), ...Object.keys(actual)]),
  ].sort();
  return keys
    .filter((key) => expected[key] !== actual[key])
    .map(
      (key) =>
        `  ${key}: pnpm-workspace.yaml=${expected[key] ?? "(absent)"} ` +
        `lockfile=${actual[key] ?? "(absent)"}`,
    );
}

function checkToolchainAlignment(rootPackage) {
  const packageManager = parsePackageManager(rootPackage.packageManager);
  if (!packageManager) {
    fail(
      'package.json must pin an exact "packageManager": "pnpm@x.y.z" value.',
    );
    return;
  }
  if (packageManager.major !== REQUIRED_PNPM_MAJOR) {
    fail(
      `package.json uses pnpm ${packageManager.major}; pnpm ${REQUIRED_PNPM_MAJOR}.x is required.`,
    );
  }
  if (rootPackage.pnpm) {
    fail(
      'package.json still has a legacy "pnpm" settings field; pnpm 11 ignores it.',
    );
  }

  const eas = readJson("eas.json");
  const easVersion = eas.build?.base?.pnpm;
  if (easVersion !== packageManager.version) {
    fail(
      `eas.json uses pnpm ${easVersion ?? "(absent)"}; expected ${packageManager.version}.`,
    );
  }

  return packageManager;
}

function checkLockfileInSync(expected) {
  const lockfile = readFile("pnpm-lock.yaml");
  if (!lockfile) {
    fail("pnpm-lock.yaml is missing.");
    return;
  }

  const lockOverrides = parseOverridesBlock(lockfile) ?? {};
  const differences = diffOverrides(expected, lockOverrides);
  if (differences.length > 0) {
    fail(
      "pnpm-lock.yaml overrides are out of sync with pnpm-workspace.yaml. " +
        "Run `pnpm install --lockfile-only` with the pinned pnpm version and commit the lockfile.\n" +
        differences.join("\n"),
    );
  }
}

function checkBraceExpansionPin(expected) {
  if (expected["brace-expansion"] !== BRACE_EXPANSION_PIN) {
    fail(
      `pnpm-workspace.yaml pins brace-expansion to ` +
        `${expected["brace-expansion"] ?? "(absent)"}; expected ${BRACE_EXPANSION_PIN}.`,
    );
  }

  const installed = path.join(
    ROOT,
    "node_modules",
    "brace-expansion",
    "package.json",
  );
  if (!fs.existsSync(installed)) {
    log(
      "node_modules/brace-expansion absent — skipping resolved-version check.",
    );
    return;
  }

  const version = JSON.parse(fs.readFileSync(installed, "utf8")).version;
  if (version !== BRACE_EXPANSION_PIN) {
    fail(
      `Resolved brace-expansion is ${version}; expected ${BRACE_EXPANSION_PIN}.`,
    );
  }
}

function main() {
  const rootPackage = readJson("package.json");
  const packageManager = checkToolchainAlignment(rootPackage);
  const workspace = readFile("pnpm-workspace.yaml");
  const expected = workspace ? (parseOverridesBlock(workspace) ?? {}) : {};

  if (Object.keys(expected).length === 0) {
    fail('pnpm-workspace.yaml has no top-level "overrides" map.');
  }

  checkLockfileInSync(expected);
  checkBraceExpansionPin(expected);

  if (errors.length > 0) {
    console.error(`[verify-pnpm-overrides] FAILED\n\n${errors.join("\n\n")}\n`);
    process.exit(1);
  }

  log(
    `OK — pnpm ${packageManager.version}; ${Object.keys(expected).length} overrides in sync.`,
  );
}

main();
