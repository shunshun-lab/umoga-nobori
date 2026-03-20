import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import type { Digest, DigestFrontmatter } from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content");

export function getAllDates(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""))
    .sort((a, b) => b.localeCompare(a));
}

export async function getDigestByDate(date: string): Promise<Digest | null> {
  const filePath = path.join(CONTENT_DIR, `${date}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const fm = data as DigestFrontmatter;

  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content);

  return {
    date: fm.date,
    title: fm.title,
    itemCount: fm.itemCount,
    content,
    html: String(result),
  };
}

export async function getAllDigests(): Promise<Digest[]> {
  const dates = getAllDates();
  const digests = await Promise.all(dates.map(getDigestByDate));
  return digests.filter((d): d is Digest => d !== null);
}
