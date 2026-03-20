import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Digest, DigestFrontmatter, NewsItem } from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content");

export function getAllDates(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""))
    .sort((a, b) => b.localeCompare(a));
}

function parseItems(content: string): NewsItem[] {
  const items: NewsItem[] = [];
  let currentSource = "";
  let currentTitle = "";
  let currentUrl = "";
  let currentDate = "";
  let summaryLines: string[] = [];

  const flushItem = () => {
    if (currentTitle && currentUrl) {
      items.push({
        title: currentTitle,
        url: currentUrl,
        date: currentDate,
        summary: summaryLines.join(" ").trim(),
        source: currentSource,
      });
    }
    currentTitle = "";
    currentUrl = "";
    currentDate = "";
    summaryLines = [];
  };

  for (const line of content.split("\n")) {
    if (line.startsWith("## ") && !line.startsWith("### ")) {
      flushItem();
      currentSource = line.slice(3).trim();
    } else if (line.startsWith("### ")) {
      flushItem();
      currentTitle = line.slice(4).trim();
    } else if (line.startsWith("- **URL**: ")) {
      currentUrl = line.slice(11).trim();
    } else if (line.startsWith("- **Date**: ")) {
      currentDate = line.slice(12).trim();
    } else if (line.startsWith("- **Summary**: ")) {
      summaryLines = [line.slice(15).trim()];
    } else if (line.trim() && currentTitle && currentUrl && summaryLines.length > 0) {
      summaryLines.push(line.trim());
    }
  }
  flushItem();

  return items;
}

export async function getDigestByDate(date: string): Promise<Digest | null> {
  const filePath = path.join(CONTENT_DIR, `${date}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const fm = data as DigestFrontmatter;

  return {
    date: fm.date,
    title: fm.title,
    itemCount: fm.itemCount,
    items: parseItems(content),
  };
}

export async function getAllDigests(): Promise<Digest[]> {
  const dates = getAllDates();
  const digests = await Promise.all(dates.map(getDigestByDate));
  return digests.filter((d): d is Digest => d !== null);
}
