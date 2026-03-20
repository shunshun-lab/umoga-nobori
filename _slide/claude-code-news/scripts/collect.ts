import Parser from "rss-parser";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";

const parser = new Parser({ timeout: 10_000 });

interface Source {
  name: string;
  type: "rss" | "github-releases";
  url?: string;
  repo?: string;
  filter?: string;
  maxItems?: number;
}

interface NewsItem {
  title: string;
  link: string;
  date: Date;
  source: string;
  summary?: string;
}

const FETCH_RETRIES = 2;
const FETCH_RETRY_DELAY_MS = 2_000;
const CONTENT_DIR = join(process.cwd(), "content");
const SEEN_FILE = join(CONTENT_DIR, ".seen-urls.json");

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function loadSeenUrls(): Set<string> {
  if (!existsSync(SEEN_FILE)) return new Set();
  try {
    const data = JSON.parse(readFileSync(SEEN_FILE, "utf-8"));
    return new Set(data);
  } catch {
    return new Set();
  }
}

function saveSeenUrls(urls: Set<string>): void {
  writeFileSync(SEEN_FILE, JSON.stringify([...urls], null, 2), "utf-8");
}

async function fetchRSS(source: Source): Promise<NewsItem[]> {
  if (!source.url) return [];
  for (let attempt = 0; attempt <= FETCH_RETRIES; attempt++) {
    try {
      const feed = await parser.parseURL(source.url);
      const max = source.maxItems ?? 10;
      let items = (feed.items ?? []).slice(0, max).map((item) => ({
        title: item.title ?? "(no title)",
        link: item.link ?? "",
        date: item.pubDate ? new Date(item.pubDate) : new Date(0),
        source: source.name,
        summary: item.contentSnippet?.slice(0, 200) || "",
      }));

      if (source.filter) {
        const kw = source.filter.toLowerCase();
        items = items.filter(
          (i) =>
            i.title.toLowerCase().includes(kw) ||
            (i.summary?.toLowerCase().includes(kw) ?? false)
        );
      }

      return items;
    } catch (e) {
      if (attempt < FETCH_RETRIES) {
        console.warn(
          `[${source.name}] attempt ${attempt + 1} failed, retrying...`
        );
        await sleep(FETCH_RETRY_DELAY_MS);
      } else {
        console.error(
          `[${source.name}] fetch error after ${FETCH_RETRIES + 1} attempts:`,
          e instanceof Error ? e.message : e
        );
        return [];
      }
    }
  }
  return [];
}

async function fetchGitHubReleases(source: Source): Promise<NewsItem[]> {
  if (!source.repo) return [];
  const url = `https://api.github.com/repos/${source.repo}/releases?per_page=${source.maxItems ?? 5}`;

  for (let attempt = 0; attempt <= FETCH_RETRIES; attempt++) {
    try {
      const headers: Record<string, string> = {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "claude-code-news-collector",
      };
      if (process.env.GITHUB_TOKEN) {
        headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
      }

      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`GitHub API ${res.status}: ${res.statusText}`);
      const releases = (await res.json()) as Array<{
        name: string;
        html_url: string;
        published_at: string;
        body?: string;
      }>;

      return releases.map((r) => ({
        title: `[Release] ${r.name || "New Release"}`,
        link: r.html_url,
        date: new Date(r.published_at),
        source: source.name,
        summary: r.body?.slice(0, 200) || "",
      }));
    } catch (e) {
      if (attempt < FETCH_RETRIES) {
        console.warn(
          `[${source.name}] attempt ${attempt + 1} failed, retrying...`
        );
        await sleep(FETCH_RETRY_DELAY_MS);
      } else {
        console.error(
          `[${source.name}] fetch error after ${FETCH_RETRIES + 1} attempts:`,
          e instanceof Error ? e.message : e
        );
        return [];
      }
    }
  }
  return [];
}

async function fetchSource(source: Source): Promise<NewsItem[]> {
  switch (source.type) {
    case "rss":
      return fetchRSS(source);
    case "github-releases":
      return fetchGitHubReleases(source);
    default:
      console.warn(`Unknown source type: ${source.type}`);
      return [];
  }
}

function toMarkdown(items: NewsItem[], date: string): string {
  const lines: string[] = [
    "---",
    `date: "${date}"`,
    `title: "Claude Code News - ${date}"`,
    `itemCount: ${items.length}`,
    "---",
    "",
    `# Claude Code News - ${date}`,
    "",
    `${items.length} items collected from ${new Set(items.map((i) => i.source)).size} sources.`,
    "",
    "---",
    "",
  ];

  const bySource = new Map<string, NewsItem[]>();
  for (const item of items) {
    const list = bySource.get(item.source) ?? [];
    list.push(item);
    bySource.set(item.source, list);
  }

  for (const [source, sourceItems] of bySource) {
    lines.push(`## ${source}`);
    lines.push("");
    for (const item of sourceItems) {
      lines.push(`### ${item.title}`);
      lines.push("");
      lines.push(`- **URL**: ${item.link}`);
      lines.push(
        `- **Date**: ${item.date.toISOString().slice(0, 10)}`
      );
      if (item.summary) {
        lines.push(`- **Summary**: ${item.summary}`);
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}

async function main() {
  const configPath = join(process.cwd(), "config", "sources.json");
  const config = JSON.parse(readFileSync(configPath, "utf-8")) as {
    sources: Source[];
  };

  console.log(`Fetching from ${config.sources.length} sources...`);

  const seenUrls = loadSeenUrls();
  const all: NewsItem[] = [];

  for (const source of config.sources) {
    const items = await fetchSource(source);
    const newItems = items.filter((i) => i.link && !seenUrls.has(i.link));
    console.log(
      `  [${source.name}] ${items.length} fetched, ${newItems.length} new`
    );
    all.push(...newItems);
  }

  all.sort((a, b) => b.date.getTime() - a.date.getTime());

  const dateStr = new Date().toISOString().slice(0, 10);

  if (!existsSync(CONTENT_DIR)) mkdirSync(CONTENT_DIR, { recursive: true });

  if (all.length === 0) {
    console.log("No new items found. Skipping write.");
    return;
  }

  const outPath = join(CONTENT_DIR, `${dateStr}.md`);
  const markdown = toMarkdown(all, dateStr);
  writeFileSync(outPath, markdown, "utf-8");
  console.log(`Wrote ${outPath} (${all.length} items)`);

  for (const item of all) {
    if (item.link) seenUrls.add(item.link);
  }
  saveSeenUrls(seenUrls);
  console.log(`Updated seen URLs (${seenUrls.size} total)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
