import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const read = (relativePath: string) =>
  readFileSync(join(ROOT, relativePath), "utf8");

const pkg = JSON.parse(read("package.json")) as {
  packageManager: string;
  pnpm?: unknown;
};
const workspace = read("pnpm-workspace.yaml");

describe("pnpm override configuration", () => {
  it("uses the supported pnpm 11 toolchain", () => {
    expect(pkg.packageManager).toMatch(/^pnpm@11\.\d+\.\d+$/);
  });

  it("declares overrides in pnpm-workspace.yaml, where pnpm 11 reads them", () => {
    expect(workspace).toMatch(/^overrides:\s*$/m);
    expect(workspace).toMatch(/^\s+axios:\s*["']?\^1\.18\.1["']?$/m);
  });

  it("does not retain the package.json pnpm field that pnpm 11 ignores", () => {
    expect(pkg.pnpm).toBeUndefined();
  });

  it("pins brace-expansion to the patched 2.x release", () => {
    expect(workspace).toMatch(/^\s+brace-expansion:\s*["']?2\.1\.4["']?$/m);
  });

  it("keeps the lockfile and release environments aligned", () => {
    expect(() =>
      execFileSync("node", ["scripts/verify-pnpm-overrides.cjs"], {
        cwd: ROOT,
      }),
    ).not.toThrow();
  });
});
