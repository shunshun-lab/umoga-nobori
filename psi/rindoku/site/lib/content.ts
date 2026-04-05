import fs from "fs";
import path from "node:path";

/** ローカル: 親の `notes/`。Vercel: `prebuild` で同期した `_content/`（親はアップロードされないため） */
function contentRoot(): string {
  const cwd = process.cwd();
  const bundled = path.join(cwd, "_content");
  if (fs.existsSync(path.join(bundled, "notes"))) {
    return bundled;
  }
  return path.join(cwd, "..");
}

const REPO_ROOT = contentRoot();

export type DocRef = {
  section: "notes" | "notebook" | "problemsets";
  slug: string;
  title: string;
  href: string;
};

function extractTitle(md: string, fallback: string): string {
  const m = md.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : fallback;
}

function listMarkdown(subdir: "notes" | "notebook" | "problemsets"): DocRef[] {
  const full = path.join(REPO_ROOT, subdir);
  if (!fs.existsSync(full)) return [];
  const out: DocRef[] = [];
  for (const f of fs.readdirSync(full)) {
    if (!f.endsWith(".md")) continue;
    const slug = f.replace(/\.md$/, "");
    if (slug.startsWith("_")) continue;
    const filePath = path.join(full, f);
    const raw = fs.readFileSync(filePath, "utf8");
    out.push({
      section: subdir,
      slug,
      title: extractTitle(raw, slug),
      href: `/docs/${subdir}/${slug}`,
    });
  }
  out.sort((a, b) => a.slug.localeCompare(b.slug, "ja"));
  return out;
}

export function getAllDocs(): DocRef[] {
  return [
    ...listMarkdown("notes"),
    ...listMarkdown("notebook"),
    ...listMarkdown("problemsets"),
  ];
}

export function getDoc(
  section: string,
  slug: string
): { content: string; title: string } | null {
  if (section !== "notes" && section !== "notebook" && section !== "problemsets")
    return null;
  if (!/^[-\w.]+$/.test(slug)) return null;
  const filePath = path.join(REPO_ROOT, section, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, "utf8");
  return { content, title: extractTitle(content, slug) };
}

export function getAllDocSlugs(): { slug: string[] }[] {
  return getAllDocs().map((d) => ({ slug: [d.section, d.slug] }));
}

/** problemsets のファイルを章ごとにグループ化 */
export type ProblemSetGroup = {
  chapter: number;
  label: string;
  selected: DocRef | null; // chX.md (選定問題)
  answers: DocRef[];       // chX_answers.md, chX_psYZ_answers.md
};

export function getProblemSetGroups(): ProblemSetGroup[] {
  const all = listMarkdown("problemsets");
  const groups = new Map<number, ProblemSetGroup>();

  for (const doc of all) {
    if (doc.slug === "README") continue;
    const chMatch = doc.slug.match(/^ch(\d+)/);
    if (!chMatch) continue;
    const ch = parseInt(chMatch[1], 10);
    if (!groups.has(ch)) {
      groups.set(ch, {
        chapter: ch,
        label: `Chapter ${ch}`,
        selected: null,
        answers: [],
      });
    }
    const g = groups.get(ch)!;
    if (doc.slug === `ch${ch}`) {
      g.selected = doc;
      g.label = doc.title.replace(/^Chapter \d+[:\s]*/, "Ch" + ch + ": ");
    } else {
      g.answers.push(doc);
    }
  }

  return Array.from(groups.values()).sort((a, b) => a.chapter - b.chapter);
}
