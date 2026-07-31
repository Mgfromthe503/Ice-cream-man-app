/**
 * Post-install CJS interop repair for brace-expansion.
 *
 * Context
 * -------
 * minimatch@9.x (used by @react-native/codegen and Gradle codegen tasks) does:
 *
 *   const brace_expansion_1 = __importDefault(require("brace-expansion"));
 *   brace_expansion_1.default(...)
 *
 * TypeScript __importDefault returns `mod` unchanged when mod.__esModule === true.
 *
 * brace-expansion@5.0.5 (and 5.0.6+) ship a CJS build that only does:
 *   Object.defineProperty(exports, "__esModule", { value: true });
 *   exports.expand = expand;
 * with NO exports.default. So .default is undefined and RN codegen fails:
 *
 *   :react-native-gesture-handler:generateCodegenSchemaFromJavaScript
 *   TypeError: (0 , brace_expansion_1.default) is not a function
 *
 * See: https://github.com/expo/eas-cli/issues/3695
 *      docs/triage-eas-android-codegen.md
 *
 * Strategy (EAS / pnpm / Gradle-safe)
 * ------------------------------------
 * 1. Walk every installed brace-expansion (hoisted + pnpm virtual store).
 * 2. In-place append on the real CJS entry so exports.default is the expand fn.
 * 3. Also drop a root interop.cjs and point package.json main + exports.require
 *    at it (.cjs is always CommonJS even when package.json has "type": "module").
 * 4. Verify with the exact minimatch interop shape before exiting 0.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const MARKER = "/* ice-cream-man-app: brace-expansion CJS interop */";
const INTEROP_CJS = "interop.cjs";

function log(msg) {
  console.log(`[patch-brace-expansion-cjs] ${msg}`);
}

function findBraceExpansionRoots(root) {
  const results = [];
  const nm = path.join(root, "node_modules");
  if (!fs.existsSync(nm)) return results;

  function walk(dir, depth) {
    if (depth > 14) return;
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

function resolveCjsEntry(pkgRoot) {
  const pkgJsonPath = path.join(pkgRoot, "package.json");
  if (!fs.existsSync(pkgJsonPath)) return null;
  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
  } catch {
    return null;
  }

  const candidates = [];

  // Prefer the require/export path (real CJS build)
  if (pkg.exports && typeof pkg.exports === "object") {
    const exp = pkg.exports["."] || pkg.exports;
    if (exp && typeof exp === "object") {
      const req = exp.require;
      if (typeof req === "string") candidates.push(path.join(pkgRoot, req));
      else if (req && typeof req === "object" && typeof req.default === "string") {
        candidates.push(path.join(pkgRoot, req.default));
      }
    }
  }
  if (pkg.main) candidates.push(path.join(pkgRoot, pkg.main));
  candidates.push(path.join(pkgRoot, "dist", "commonjs", "index.js"));
  candidates.push(path.join(pkgRoot, "dist", "cjs", "index.js"));
  candidates.push(path.join(pkgRoot, "dist", "index.cjs"));
  candidates.push(path.join(pkgRoot, "index.js"));

  for (const c of candidates) {
    try {
      if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
    } catch {
      /* ignore */
    }
  }
  return null;
}

function injectDefaultExport(entryPath) {
  let text;
  try {
    text = fs.readFileSync(entryPath, "utf8");
  } catch {
    return false;
  }
  if (text.includes(MARKER)) return true;

  // Append interop so both shapes work:
  // - module.exports is a function (legacy 2.x)
  // - module.exports.expand is a function (5.x named)
  // - module.exports.default is always the callable expand
  const appendix = `
${MARKER}
;(function () {
  "use strict";
  var exp =
    (typeof module.exports === "function" && module.exports) ||
    (module.exports && typeof module.exports.expand === "function" && module.exports.expand) ||
    (module.exports && typeof module.exports.default === "function" && module.exports.default);
  if (typeof exp === "function") {
    if (typeof module.exports === "function") {
      module.exports.default = module.exports;
      if (typeof module.exports.expand !== "function") module.exports.expand = module.exports;
    } else if (module.exports && typeof module.exports === "object") {
      module.exports.default = exp;
      if (typeof module.exports.expand !== "function") module.exports.expand = exp;
    }
  }
})();
`;
  fs.writeFileSync(entryPath, text + appendix, "utf8");
  return true;
}

function writeRootInteropCjs(pkgRoot, entryRelFromRoot) {
  const interopPath = path.join(pkgRoot, INTEROP_CJS);
  // Use a relative require of the (patched) CJS entry. .cjs is always CommonJS.
  const content = `${MARKER}
"use strict";
// Root interop entry: always CJS (.cjs) so Gradle/node never hit type:module .js.
var mod = require(${JSON.stringify("./" + entryRelFromRoot.replace(/^\.\//, ""))});
var expand =
  typeof mod === "function"
    ? mod
    : mod && typeof mod.default === "function"
      ? mod.default
      : mod && typeof mod.expand === "function"
        ? mod.expand
        : null;
if (typeof expand !== "function") {
  throw new Error("brace-expansion interop: expand is not a function");
}
module.exports = expand;
module.exports.default = expand;
module.exports.expand = expand;
module.exports.__esModule = true;
`;
  fs.writeFileSync(interopPath, content, "utf8");
  return INTEROP_CJS;
}

function normalizePackageJson(pkgRoot, interopRel) {
  const pkgJsonPath = path.join(pkgRoot, "package.json");
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
    let changed = false;
    const mainTarget = "./" + interopRel.replace(/^\.\//, "");

    if (pkg.main !== mainTarget) {
      pkg.main = mainTarget;
      changed = true;
    }

    // Ensure require() condition points at the .cjs interop.
    if (!pkg.exports || typeof pkg.exports !== "object") {
      pkg.exports = { ".": { require: mainTarget, default: mainTarget } };
      changed = true;
    } else {
      const exp = pkg.exports;
      if (typeof exp["."] === "string") {
        exp["."] = { require: mainTarget, default: exp["."] };
        changed = true;
      } else if (exp["."] && typeof exp["."] === "object") {
        const dot = exp["."];
        if (dot.require !== mainTarget) {
          // Keep nested require.default shape if present, else set string.
          if (dot.require && typeof dot.require === "object") {
            if (dot.require.default !== mainTarget) {
              dot.require.default = mainTarget;
              changed = true;
            }
          } else {
            dot.require = mainTarget;
            changed = true;
          }
        }
      } else if (!exp["."]) {
        exp["."] = { require: mainTarget, default: mainTarget };
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");
      log(`normalized package.json main/exports.require → ${mainTarget}`);
    }
  } catch (err) {
    log(`WARN: could not normalize package.json: ${err.message}`);
  }
}

function patchPackage(pkgRoot) {
  const entry = resolveCjsEntry(pkgRoot);
  if (!entry) {
    log(`skip (no CJS entry): ${pkgRoot}`);
    return false;
  }

  const injected = injectDefaultExport(entry);
  if (!injected) {
    log(`skip (inject failed): ${pkgRoot}`);
    return false;
  }

  const entryRel = path.relative(pkgRoot, entry).split(path.sep).join("/");
  writeRootInteropCjs(pkgRoot, entryRel);
  normalizePackageJson(pkgRoot, INTEROP_CJS);

  log(`patched: ${pkgRoot} (entry=${entryRel})`);
  return true;
}

/** Simulate TypeScript __importDefault + minimatch call site. */
function minimatchInteropOk(mod) {
  // __importDefault: if mod && mod.__esModule then return mod; else return { default: mod }
  const imported =
    mod && mod.__esModule ? mod : { default: mod };
  const fn = imported.default;
  return typeof fn === "function";
}

function verifyRequire() {
  try {
    Object.keys(require.cache).forEach((k) => {
      if (
        k.includes(`${path.sep}brace-expansion${path.sep}`) ||
        k.endsWith(`${path.sep}brace-expansion`) ||
        k.endsWith(`${path.sep}interop.cjs`)
      ) {
        delete require.cache[k];
      }
    });

    const be = require("brace-expansion");

    if (!minimatchInteropOk(be)) {
      return {
        ok: false,
        reason:
          "minimatch interop path failed: require('brace-expansion').default is not a function " +
          `(typeof=${typeof be}, keys=${be && typeof be === "object" ? Object.keys(be).join(",") : "n/a"})`,
      };
    }

    const expand =
      typeof be === "function" ? be : be.default || be.expand;
    const sample = expand("{a,b}");
    if (!Array.isArray(sample) || sample.length < 2) {
      return { ok: false, reason: "expand('{a,b}') returned unexpected value" };
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
  log("verify OK — minimatch-style require('brace-expansion').default is callable");
}

main();
