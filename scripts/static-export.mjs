/**
 * Static export (APK): API route va middleware vaqtincha olib tashlanadi,
 * chunki Next.js output: "export" ularni qo'llab-quvvatlamaydi.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const stashDir = path.join(root, ".static-build-stash");

const moves = [
  { from: path.join(root, "app", "api"), to: path.join(stashDir, "app-api") },
  {
    from: path.join(root, "middleware.ts"),
    to: path.join(stashDir, "middleware.ts"),
  },
];

function stash() {
  fs.mkdirSync(stashDir, { recursive: true });
  for (const { from, to } of moves) {
    if (!fs.existsSync(from)) continue;
    if (fs.existsSync(to)) {
      throw new Error(`Stash allaqachon mavjud: ${to}`);
    }
    fs.renameSync(from, to);
    console.log(`[static] stash: ${path.relative(root, from)}`);
  }
}

function restore() {
  for (const { from, to } of moves) {
    if (!fs.existsSync(to)) continue;
    fs.mkdirSync(path.dirname(from), { recursive: true });
    fs.renameSync(to, from);
    console.log(`[static] restore: ${path.relative(root, from)}`);
  }
  if (fs.existsSync(stashDir) && fs.readdirSync(stashDir).length === 0) {
    fs.rmdirSync(stashDir);
  }
}

function runBuild() {
  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
  const result = spawnSync(npmCmd, ["run", "build:static-inner"], {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, BUILD_STATIC: "1" },
    shell: process.platform === "win32",
  });
  return result.status ?? 1;
}

stash();
let exitCode = 1;
try {
  exitCode = runBuild();
} finally {
  restore();
}
process.exit(exitCode);
