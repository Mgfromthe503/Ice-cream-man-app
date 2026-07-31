/**
 * EAS Build pre-install / local guard.
 *
 * brace-expansion@5.x CJS builds set __esModule and only export named `expand`.
 * minimatch@9.x still does:
 *   (0, require('brace-expansion').default)(...)
 * which throws TypeError and fails:
 *   :react-native-gesture-handler:generateCodegenSchemaFromJavaScript
 *
 * See: https://github.com/expo/eas-cli/issues/3695
 *
 * This script runs via package.json "eas-build-pre-install" on EAS workers
 * and can be run locally before Android builds. Post-install patch is required
 * even when the version pin is correct (5.0.5 has no .default export).
 */
"use strict";

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const SAFE_5 = "5.0.5";

function log(msg) {
  console.log(`[ensure-brace-expansion] ${msg}`);
}

function tryRequireExpand() {
  try {
    const be = require("brace-expansion");
    // Match minimatch / TypeScript __importDefault path
    const imported = be && be.__esModule ? be : { default: be };
    const expand =
      typeof imported.default === "function"
        ? imported.default
        : typeof be === "function"
          ? be
          : be && typeof be.expand === "function"
            ? be.expand
            : null;
    if (typeof expand !== "function") {
      return {
        ok: false,
        reason:
          "no callable default (minimatch interop path). " +
          `typeof=${typeof be}, hasExpand=${!!(be && be.expand)}, hasDefault=${!!(be && be.default)}`,
      };
    }
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
  log(`Forcing brace-expansion@${SAFE_5} ...`);
  try {
    execSync(`pnpm add brace-expansion@${SAFE_5} --save-exact`, {
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

  const nm = path.join(root, "node_modules", "brace-expansion");
  if (!fs.existsSync(nm)) {
    log(
      `node_modules/brace-expansion not present yet (expected on eas-build-pre-install). ` +
        `Overrides pin ${SAFE_5}; post-install patch adds .default for minimatch.`
    );
    return;
  }

  const check = tryRequireExpand();
  if (check.ok) {
    log("brace-expansion is CJS-safe for minimatch interop. OK.");
    return;
  }

  log(`Broken brace-expansion detected: ${check.reason}`);
  forceInstall();

  // After force install, patch must still run (post-install). Soft-fail here so
  // post-install patch can finish the interop repair.
  const recheck = tryRequireExpand();
  if (!recheck.ok) {
    log(
      `Still missing .default after force install (${recheck.reason}). ` +
        `Expected: postinstall / eas-build-post-install patch will inject exports.default.`
    );
    return;
  }
  log("Repaired brace-expansion successfully.");
}

main();
