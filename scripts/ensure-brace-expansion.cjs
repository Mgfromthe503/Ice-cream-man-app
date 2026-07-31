/**
 * EAS Build pre-install / local guard.
 *
 * brace-expansion@5.0.6+ and @2.1.0+ are ESM-only (no default export).
 * minimatch@9.x (used by @react-native/codegen and @expo/fingerprint) still does:
 *   (0, require('brace-expansion').default)(...)
 * which throws TypeError and fails:
 *   :react-native-gesture-handler:generateCodegenSchemaFromJavaScript
 *
 * See: https://github.com/expo/eas-cli/issues/3695
 *
 * This script runs via package.json "eas-build-pre-install" on EAS workers
 * and can be run locally before Android builds.
 */
"use strict";

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const SAFE_5 = "5.0.5";
const SAFE_2 = "2.0.2";

function log(msg) {
  console.log(`[ensure-brace-expansion] ${msg}`);
}

function tryRequireExpand() {
  try {
    // CJS path used by minimatch / RN codegen
    const be = require("brace-expansion");
    const expand = typeof be === "function" ? be : be && be.default;
    if (typeof expand !== "function") {
      return { ok: false, reason: "no callable default/function export" };
    }
    // smoke: expand a simple brace pattern
    const out = expand("{a,b}");
    if (!Array.isArray(out) || out.length < 2) {
      return { ok: false, reason: "expand() did not return expected array" };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: String(err && err.message ? err.message : err) };
  }
}

function forceInstall() {
  log(`Forcing brace-expansion@${SAFE_5} (CJS-compatible) ...`);
  try {
    // Prefer pnpm (packageManager field); fall back to npm
    execSync(`pnpm add -D brace-expansion@${SAFE_5} --save-exact`, {
      stdio: "inherit",
      env: process.env,
    });
  } catch {
    try {
      execSync(`npm install brace-expansion@${SAFE_5} --save-exact --no-save`, {
        stdio: "inherit",
        env: process.env,
      });
    } catch (e) {
      log(`WARN: could not force-install: ${e.message}`);
    }
  }
}

function main() {
  const root = process.cwd();
  const pkgPath = path.join(root, "package.json");
  if (!fs.existsSync(pkgPath)) {
    log("No package.json in cwd — skipping");
    return;
  }

  // If node_modules is missing (pre-install phase), install is not done yet.
  // Still log intent; EAS will install after this script with overrides applied.
  const nm = path.join(root, "node_modules", "brace-expansion");
  if (!fs.existsSync(nm)) {
    log(
      `node_modules/brace-expansion not present yet (expected on eas-build-pre-install). ` +
        `Overrides in package.json will pin ${SAFE_5} / ${SAFE_2} during install.`
    );
    return;
  }

  const check = tryRequireExpand();
  if (check.ok) {
    log("brace-expansion is CJS-safe (callable). OK.");
    return;
  }

  log(`Broken brace-expansion detected: ${check.reason}`);
  forceInstall();

  const recheck = tryRequireExpand();
  if (!recheck.ok) {
    console.error(
      `[ensure-brace-expansion] FATAL: still broken after force install (${recheck.reason}). ` +
        `Pin brace-expansion to ${SAFE_5} in package.json overrides and regenerate the lockfile.`
    );
    process.exitCode = 1;
    return;
  }
  log("Repaired brace-expansion successfully.");
}

main();
