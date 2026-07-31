/**
 * Post-install CJS interop repair for brace-expansion.
 *
 * Context
 * -------
 * minimatch@9.x (used by @react-native/codegen and related Gradle codegen tasks)
 * still does the TypeScript CJS interop pattern:
 *
 *   const brace_expansion_1 = __importDefault(require("brace-expansion"));
 *   brace_expansion_1.default(...)
 *
 * brace-expansion@>=5.0.6 and @>=2.1.0 ship as ESM-only (named `expand` export,
 * no default). That makes `.default` undefined and fails:
 *
 *   :react-native-gesture-handler:generateCodegenSchemaFromJavaScript
 *
 * See: https://github.com/expo/eas-cli/issues/3695
 *
 * Strategy
 * --------
 * After package install (eas-build-post-install / local postinstall), walk every
 * installed brace-expansion package and ensure its CJS entry exposes:
 *   - module.exports = expandFn
 *   - module.exports.default = expandFn
 *   - module.exports.expand = expandFn
 *
 * This is a surgical interop shim. Prefer removing it once minimatch / RN codegen
 * consume the named ESM export correctly, or once brace-expansion restores a
 * dual-package default for CJS consumers.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const MARKER = "/* ice-cream-man-app: brace-expansion CJS interop */";

function log(msg) {
  console.log(`[patch-brace-expansion-cjs] ${msg}`);
}

function findBraceExpansionRoots(root) {
  const results = [];
  const nm = path.join(root, "node_modules");
  if (!fs.existsSync(nm)) return results;

  function walk(dir, depth) {
    if (depth > 8) return;
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      if (!ent.isDirectory()) continue;
      const name = ent.name;
      const full = path.join(dir, name);
      if (name === "brace-expansion") {
        results.push(full);
        continue;
      }
      if (name === ".bin" || name === ".pnpm") continue;
      if (name.startsWith(".")) continue;
      // pnpm virtual store: node_modules/.pnpm/*/node_modules/brace-expansion
      if (name === "node_modules") {
        walk(full, depth + 1);
        continue;
      }
      const nested = path.join(full, "node_modules");
      if (fs.existsSync(nested)) walk(nested, depth + 1);
    }
  }

  // Hoisted layout
  walk(nm, 0);

  // pnpm store layout
  const pnpm = path.join(nm, ".pnpm");
  if (fs.existsSync(pnpm)) {
    let storeEntries;
    try {
      storeEntries = fs.readdirSync(pnpm, { withFileTypes: true });
    } catch {
      storeEntries = [];
    }
    for (const ent of storeEntries) {
      if (!ent.isDirectory()) continue;
      const candidate = path.join(pnpm, ent.name, "node_modules", "brace-expansion");
      if (fs.existsSync(candidate)) results.push(candidate);
    }
  }

  return [...new Set(results)];
}

function resolveExpandSource(pkgRoot) {
  const pkgJsonPath = path.join(pkgRoot, "package.json");
  if (!fs.existsSync(pkgJsonPath)) return null;
  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
  } catch {
    return null;
  }

  const candidates = [];
  if (pkg.main) candidates.push(path.join(pkgRoot, pkg.main));
  candidates.push(path.join(pkgRoot, "index.js"));
  candidates.push(path.join(pkgRoot, "dist", "index.js"));
  candidates.push(path.join(pkgRoot, "dist", "cjs", "index.js"));

  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  }
  return null;
}

function alreadyPatched(filePath) {
  try {
    const text = fs.readFileSync(filePath, "utf8");
    return text.includes(MARKER);
  } catch {
    return false;
  }
}

function writeInteropWrapper(targetPath, originalRel) {
  // Wrapper that loads the original module and normalizes exports for CJS consumers.
  const content = `${MARKER}
"use strict";
// Professional interop shim: make brace-expansion callable under CJS default interop.
const original = require(${JSON.stringify("./" + originalRel)});
function resolveExpand(mod) {
  if (typeof mod === "function") return mod;
  if (mod && typeof mod.expand === "function") return mod.expand;
  if (mod && typeof mod.default === "function") return mod.default;
  if (mod && mod.default && typeof mod.default.expand === "function") {
    return mod.default.expand;
  }
  throw new Error(
    "brace-expansion CJS interop: could not resolve expand() from " +
      ${JSON.stringify(originalRel)}
  );
}
const expand = resolveExpand(original);
module.exports = expand;
module.exports.default = expand;
module.exports.expand = expand;
module.exports.__esModule = true;
`;
  fs.writeFileSync(targetPath, content, "utf8");
}

function patchPackage(pkgRoot) {
  const entry = resolveExpandSource(pkgRoot);
  if (!entry) {
    log(`skip (no entry): ${pkgRoot}`);
    return false;
  }

  // If entry is already our wrapper, done.
  if (alreadyPatched(entry)) {
    log(`already patched: ${pkgRoot}`);
    return true;
  }

  const dir = path.dirname(entry);
  const base = path.basename(entry);
  const backupName = base.replace(/\.js$/, ".original.js");
  const backupPath = path.join(dir, backupName);

  // Move original aside once
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(entry, backupPath);
  }

  // Point package main at wrapper if needed; always rewrite entry as wrapper.
  writeInteropWrapper(entry, backupName);

  // Also ensure package.json main points at the (now wrapped) entry.
  const pkgJsonPath = path.join(pkgRoot, "package.json");
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
    // Leave package.json as-is; we overwrote the file package.main already points to.
    void pkg;
  } catch {
    /* ignore */
  }

  log(`patched: ${pkgRoot}`);
  return true;
}

function verifyRequire() {
  try {
    // Clear cache so we load the patched copy
    Object.keys(require.cache).forEach((k) => {
      if (k.includes(`${path.sep}brace-expansion${path.sep}`) || k.endsWith(`${path.sep}brace-expansion`)) {
        delete require.cache[k];
      }
    });
    const be = require("brace-expansion");
    const expand = typeof be === "function" ? be : be && (be.default || be.expand);
    if (typeof expand !== "function") {
      return { ok: false, reason: "export is not a function" };
    }
    const sample = expand("{a,b}");
    if (!Array.isArray(sample) || sample.length < 2) {
      return { ok: false, reason: "expand() returned unexpected value" };
    }
    // Also verify the .default path minimatch uses
    const viaDefault =
      typeof be === "function"
        ? be
        : be && typeof be.default === "function"
          ? be.default
          : null;
    if (typeof viaDefault !== "function") {
      return { ok: false, reason: ".default is not a function (minimatch interop path)" };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: String(err && err.message ? err.message : err) };
  }
}

function main() {
  const root = process.cwd();
  const roots = findBraceExpansionRoots(root);
  if (roots.length === 0) {
    log("no brace-expansion installs found yet (ok during pre-install)");
    return;
  }
  log(`found ${roots.length} brace-expansion install(s)`);
  let patched = 0;
  for (const r of roots) {
    if (patchPackage(r)) patched += 1;
  }
  log(`patched ${patched}/${roots.length}`);

  const check = verifyRequire();
  if (!check.ok) {
    console.error(`[patch-brace-expansion-cjs] VERIFY FAILED: ${check.reason}`);
    process.exitCode = 1;
    return;
  }
  log("verify OK — require('brace-expansion') is CJS-safe for minimatch/codegen");
}

main();
