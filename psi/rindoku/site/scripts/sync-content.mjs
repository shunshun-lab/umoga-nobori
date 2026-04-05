#!/usr/bin/env node
/**
 * Vercel はデプロイ時に `site/` 配下だけをアップロードするため、
 * ビルド前に親の notes/・notebook/ を site/_content/ にコピーする。
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.join(__dirname, "..");
const repoRoot = path.join(siteDir, "..");
const destRoot = path.join(siteDir, "_content");

for (const name of ["notes", "notebook", "problemsets"]) {
  const src = path.join(repoRoot, name);
  const dst = path.join(destRoot, name);
  if (!fs.existsSync(src)) {
    console.warn(`sync-content: skip (missing): ${src}`);
    continue;
  }
  fs.rmSync(dst, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.cpSync(src, dst, { recursive: true });
}

console.log("sync-content: notes/ & notebook/ & problemsets/ → _content/");
