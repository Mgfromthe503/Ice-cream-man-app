import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const read = (relativePath: string) => readFileSync(join(ROOT, relativePath), "utf8");

function runIsolated(script: string): void {
  execFileSync(process.execPath, ["--eval", script], {
    cwd: ROOT,
    stdio: "pipe",
    timeout: 1_500,
  });
}

describe("image-size denial-of-service patch", () => {
  it("is committed as a pnpm patched dependency", () => {
    const workspace = read("pnpm-workspace.yaml");
    const patch = read("patches/image-size@1.2.1.patch");

    expect(workspace).toContain(
      "image-size@1.2.1: patches/image-size@1.2.1.patch",
    );
    expect(patch).toContain("Invalid ICNS entry length");
    expect(patch).toContain("jxlpBox.size > 0 ? jxlpBox.size : 8");
  });

  it("rejects a zero-length ICNS entry without blocking the event loop", () => {
    runIsolated(`
      const imageSize = require("image-size");
      const maliciousIcns = Uint8Array.from([
        0x69, 0x63, 0x6e, 0x73,
        0x00, 0x00, 0x00, 0x10,
        0x69, 0x73, 0x33, 0x32,
        0x00, 0x00, 0x00, 0x00,
      ]);

      try {
        imageSize(maliciousIcns);
        process.exit(2);
      } catch (error) {
        if (!String(error).includes("Invalid ICNS entry length")) {
          console.error(error);
          process.exit(3);
        }
      }
    `);
  });

  it("advances past a zero-sized JXLP box without blocking the event loop", () => {
    runIsolated(`
      const imageSize = require("image-size");
      const maliciousJxl = Uint8Array.from([
        0x00, 0x00, 0x00, 0x0c,
        0x4a, 0x58, 0x4c, 0x20,
        0x0d, 0x0a, 0x87, 0x0a,
        0x00, 0x00, 0x00, 0x14,
        0x66, 0x74, 0x79, 0x70,
        0x6a, 0x78, 0x6c, 0x20,
        0x00, 0x00, 0x00, 0x00,
        0x6a, 0x78, 0x6c, 0x20,
        0x00, 0x00, 0x00, 0x00,
        0x6a, 0x78, 0x6c, 0x70,
      ]);

      try {
        imageSize(maliciousJxl);
      } catch {
        // Parsing may fail after the patched loop advances; termination is the assertion.
      }
    `);
  });
});
