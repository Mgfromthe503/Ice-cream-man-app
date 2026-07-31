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
 *      docs/triage-eas-android-codegen.md
 *
 * Strategy
 * --------
 * After package install (eas-build-post-install / local postinstall), walk every
 * installed brace-expansion package (hoisted + pnpm virtual store) and ensure
 * its CJS entry exposes:
 *   - module.exports = expandFn
 *   - module.exports.default = expandFn
 *   - module.exports.expand = expandFn
 *
 * Also normalizes package.json `main` / `exports` so require() cannot bypass
 * the wrapper via a nested path Gradle's node process might resolve.
 *
 * Prefer removing this once minimatch / RN codegen consume the named ESM export,
 * or once brace-expansion restores a dual-package default for CJS consumers.
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
    if (depth > 12) return;
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
      if (name === ".bin") continue;
      if (name.startsWith(".") && name !== ".pnpm") continue;
      if (name === "node_modules" || name === ".pnpm") {
        walk(full, depth + 1);
        continue;
      }
      const nested = path.join(full, "node_modules");
      if (fs.existsSync(nested)) walk(nested, depth + 1);
    }
  }

  walk(nm, 0);

  // Explicit pnpm virtual store: node_modules/.pnpm/*/node_modules/brace-expansion
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
  if (pkg.exports) {
    const exp = pkg.exports;
    if (typeof exp === "string") candidates.push(path.join(pkgRoot, exp));
    else if (exp && typeof exp === "object") {
      const def = exp["."] || exp;
      if (typeof def === "string") candidates.push(path.join(pkgRoot, def));
      else if (def && typeof def === "object") {
        for (const key of ["require", "default", "import", "node"]) {
          const v = def[key];
          if (typeof v === "string") candidates.push(path.join(pkgRoot, v));
        }
      }
    }
  }
  candidates.push(path.join(pkgRoot, "index.js"));
  candidates.push(path.join(pkgRoot, "dist", "index.js"));
  candidates.push(path.join(pkgRoot, "dist", "cjs", "index.js"));
  candidates.push(path.join(pkgRoot, "dist", "index.cjs"));

  for (const c of candidates) {
    try {
      if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
    } catch {
      /* ignore */
    }
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

function normalizePackageJson(pkgRoot, entryRel) {
  const pkgJsonPath = path.join(pkgRoot, "package.json");
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
    let changed = false;
    if (pkg.main !== entryRel) {
      pkg.main = entryRel;
      changed = true;
    }
    // Prefer a simple CJS main; leave type alone so we do not break ESM importers.
    if (pkg.exports && typeof pkg.exports === "object") {
      // Point require at the wrapper; keep import if present for ESM consumers.
      const exp = pkg.exports;
      if (exp["."] && typeof exp["."] === "object") {
        if (exp["."].require !== "./" + entryRel.replace(/^\.\//, "")) {
          exp["."].require = "./" + entryRel.replace(/^\.\//, "");
          changed = true;
        }
      }
    }
    if (changed) {
      fs.writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");
      log(`normalized package.json main/exports: ${pkgRoot}`);
    }
  } catch {
    /* ignore */
  }
}

function patchPackage(pkgRoot) {
  const entry = resolveExpandSource(pkgRoot);
  if (!entry) {
    log(`skip (no entry): ${pkgRoot}`);
    return false;
  }

  if (alreadyPatched(entry)) {
    log(`already patched: ${pkgRoot}`);
    return true;
  }

  const dir = path.dirname(entry);
  const base = path.basename(entry);
  const backupName = base.replace(/\.js$/, ".original.js").replace(/\.cjs$/, ".original.cjs");
  const backupPath = path.join(dir, backupName);

  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(entry, backupPath);
  }

  writeInteropWrapper(entry, backupName);

  const entryRel = path.relative(pkgRoot, entry).split(path.sep).join("/");
  normalizePackageJson(pkgRoot, entryRel.startsWith(".") ? entryRel : "./" + entryRel);

  log(`patched: ${pkgRoot}`);
  return true;
}

function verifyRequire() {
  try {
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
