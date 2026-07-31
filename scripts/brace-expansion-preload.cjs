/**
 * Node preload: force brace-expansion to satisfy minimatch's CJS interop.
 *
 * minimatch@9 (used by @react-native/codegen / Gradle codegen) does:
 *   const brace_expansion_1 = __importDefault(require("brace-expansion"));
 *   brace_expansion_1.default(...)
 *
 * TypeScript __importDefault returns `mod` unchanged when mod.__esModule === true.
 * brace-expansion 2.1+ / 5.x ship named `expand` only → .default is undefined →
 * TypeError in :react-native-gesture-handler:generateCodegenSchemaFromJavaScript.
 *
 * Loaded via NODE_OPTIONS=--require on EAS so EVERY node process (including
 * Gradle-spawned codegen) gets a callable default, regardless of which
 * physical copy of brace-expansion is resolved.
 *
 * See: https://github.com/expo/eas-cli/issues/3695
 *      docs/triage-eas-android-codegen.md
 */
"use strict";

const Module = require("module");
const path = require("path");

const HOOK_FLAG = Symbol.for("ice-cream-man.brace-expansion-preload");
if (global[HOOK_FLAG]) {
  // Already installed (nested requires / double NODE_OPTIONS)
  module.exports = {};
} else {
  global[HOOK_FLAG] = true;

  const originalLoad = Module._load;

  function coerceExpand(mod) {
    if (typeof mod === "function") return mod;
    if (mod && typeof mod.default === "function") return mod.default;
    if (mod && typeof mod.expand === "function") return mod.expand;
    return null;
  }

  function wrapModule(mod) {
    const expand = coerceExpand(mod);
    if (typeof expand !== "function") return mod;

    // Pure function export (2.0.2): __importDefault wraps as { default: fn }
    if (typeof mod === "function") {
      if (typeof mod.default !== "function") mod.default = mod;
      if (typeof mod.expand !== "function") mod.expand = mod;
      return mod;
    }

    // Object export with __esModule / named expand only (5.x)
    if (mod && typeof mod === "object") {
      if (typeof mod.default !== "function") {
        try {
          mod.default = expand;
        } catch {
          // frozen export object — return a fresh interop facade
          const facade = function braceExpansionFacade() {
            return expand.apply(this, arguments);
          };
          facade.default = expand;
          facade.expand = expand;
          facade.__esModule = true;
          return facade;
        }
      }
      if (typeof mod.expand !== "function") {
        try {
          mod.expand = expand;
        } catch {
          /* ignore */
        }
      }
    }
    return mod;
  }

  Module._load = function patchedLoad(request, parent, isMain) {
    const result = originalLoad.apply(this, arguments);
    // Match bare and deep requires of the package name only
    if (request === "brace-expansion") {
      return wrapModule(result);
    }
    // Also catch absolute paths into a brace-expansion package root entry
    if (
      typeof request === "string" &&
      (request.endsWith(`${path.sep}brace-expansion`) ||
        request.endsWith(`${path.sep}brace-expansion${path.sep}index.js`) ||
        /[\\/]brace-expansion[\\/](index\.(js|cjs)|dist[\\/].*)$/.test(request))
    ) {
      return wrapModule(result);
    }
    return result;
  };

  module.exports = {};
}
