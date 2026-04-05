import { getDoc } from "./content";
import fs from "fs";
import path from "path";

function contentRoot(): string {
  const cwd = process.cwd();
  const bundled = path.join(cwd, "_content");
  if (fs.existsSync(path.join(bundled, "notes"))) return bundled;
  return path.join(cwd, "..");
}

export type ChapterInfo = { chapter: number; title: string };

const CHAPTER_TITLES: Record<number, string> = {
  1: "Applied Linear Algebra",
  2: "A Framework for Applied Mathematics",
  3: "Boundary Value Problems",
  4: "Fourier Series and Integrals",
  5: "Analytic Functions",
  6: "Initial Value Problems",
  7: "Solving Large Systems",
  8: "Optimization and Minimum Principles",
};

export function getAvailableChapters(): ChapterInfo[] {
  return Object.entries(CHAPTER_TITLES).map(([ch, title]) => ({
    chapter: parseInt(ch, 10),
    title,
  }));
}

export function getChapterContext(chapter: number): string {
  const parts: string[] = [];

  // Notes
  const notes = getDoc("notes", `Chapter${chapter}`);
  if (notes) {
    parts.push(`## 章ノート\n\n${notes.content}`);
  }

  // Selected problems
  const selected = getDoc("problemsets", `ch${chapter}`);
  if (selected) {
    parts.push(`## 選定問題と回答\n\n${selected.content}`);
  }

  // Full answers (truncate to ~40KB to stay within token budget)
  const answers = getDoc("problemsets", `ch${chapter}_answers`);
  if (answers) {
    const content =
      answers.content.length > 40000
        ? answers.content.slice(0, 40000) + "\n\n(... 残りは省略 ...)"
        : answers.content;
    parts.push(`## 全問解答\n\n${content}`);
  }

  // Additional PS-specific answer files
  const root = contentRoot();
  const psDir = path.join(root, "problemsets");
  if (fs.existsSync(psDir)) {
    const prefix = `ch${chapter}_ps`;
    for (const f of fs.readdirSync(psDir)) {
      if (f.startsWith(prefix) && f.endsWith("_answers.md")) {
        const slug = f.replace(/\.md$/, "");
        const extra = getDoc("problemsets", slug);
        if (extra) {
          const content =
            extra.content.length > 20000
              ? extra.content.slice(0, 20000) + "\n\n(... 残りは省略 ...)"
              : extra.content;
          parts.push(`## 追加解答（${slug}）\n\n${content}`);
        }
      }
    }
  }

  if (parts.length === 0) {
    return `Chapter ${chapter}: ${CHAPTER_TITLES[chapter] ?? "Unknown"}\n\n（コンテンツが見つかりません）`;
  }

  return parts.join("\n\n---\n\n");
}

export function getGeneralContext(): string {
  const parts: string[] = [];

  // Load cross-chapter notes if available
  for (const slug of ["00_index", "algorithm_map", "cross_notes"]) {
    const doc = getDoc("notes", slug);
    if (doc) {
      parts.push(`## ${doc.title}\n\n${doc.content.slice(0, 10000)}`);
    }
  }

  if (parts.length === 0) {
    return "CSE（Gilbert Strang）の輪読ノートです。章を選択するとより詳しい回答ができます。";
  }

  return parts.join("\n\n---\n\n");
}
