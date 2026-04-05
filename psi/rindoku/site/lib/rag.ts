import fs from "fs";
import path from "path";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Chunk = {
  id: string;
  source: string; // e.g. "Chapter1"
  section: string; // e.g. "定義"
  text: string;
};

// ---------------------------------------------------------------------------
// Content root (same logic as content.ts)
// ---------------------------------------------------------------------------

function contentRoot(): string {
  const cwd = process.cwd();
  const bundled = path.join(cwd, "_content");
  if (fs.existsSync(path.join(bundled, "notes"))) return bundled;
  return path.join(cwd, "..");
}

// ---------------------------------------------------------------------------
// Build chunks — split each note by ## headings
// ---------------------------------------------------------------------------

function buildChunks(): Chunk[] {
  const root = contentRoot();
  const notesDir = path.join(root, "notes");
  if (!fs.existsSync(notesDir)) return [];

  const chunks: Chunk[] = [];

  for (const file of fs.readdirSync(notesDir)) {
    if (!file.endsWith(".md") || file.startsWith("_")) continue;
    const slug = file.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(notesDir, file), "utf8");

    // Split on ## headings; keep heading as part of chunk
    const parts = raw.split(/(?=^## )/m);

    for (let i = 0; i < parts.length; i++) {
      const text = parts[i].trim();
      if (!text || text.length < 30) continue;

      // Extract section title from ## heading, or use "冒頭" for preamble
      const headingMatch = text.match(/^##\s+(.+)$/m);
      const section = headingMatch ? headingMatch[1].trim() : "冒頭";

      chunks.push({
        id: `${slug}__${i}`,
        source: slug,
        section,
        text,
      });
    }
  }

  return chunks;
}

// ---------------------------------------------------------------------------
// Tokeniser (simple bigram + unigram for Japanese + ASCII words)
// ---------------------------------------------------------------------------

function tokenize(text: string): string[] {
  // Remove LaTeX / markdown noise
  const cleaned = text
    .replace(/\$\$[\s\S]*?\$\$/g, " MATH ")
    .replace(/\$[^$]+\$/g, " MATH ")
    .replace(/[#*_`|>\[\](){}]/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .toLowerCase();

  const tokens: string[] = [];

  // ASCII words
  for (const m of cleaned.matchAll(/[a-z][a-z0-9]{1,}/g)) {
    tokens.push(m[0]);
  }

  // Japanese: character bigrams (covers hiragana, katakana, kanji)
  const jp = cleaned.replace(/[^\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/g, "");
  for (let i = 0; i < jp.length - 1; i++) {
    tokens.push(jp.slice(i, i + 2));
  }

  return tokens;
}

// ---------------------------------------------------------------------------
// TF-IDF index
// ---------------------------------------------------------------------------

type Index = {
  chunks: Chunk[];
  tfs: Map<string, number>[]; // per-chunk term frequencies
  idf: Map<string, number>;
  norms: number[]; // L2 norms of TF-IDF vectors
};

function buildIndex(chunks: Chunk[]): Index {
  const N = chunks.length;
  const tfs: Map<string, number>[] = [];
  const df = new Map<string, number>();

  for (const chunk of chunks) {
    const tokens = tokenize(chunk.text);
    const tf = new Map<string, number>();
    for (const t of tokens) {
      tf.set(t, (tf.get(t) ?? 0) + 1);
    }
    // Normalize TF by max freq
    const maxFreq = Math.max(...tf.values(), 1);
    for (const [k, v] of tf) {
      tf.set(k, v / maxFreq);
    }
    tfs.push(tf);

    // Document frequency
    for (const t of tf.keys()) {
      df.set(t, (df.get(t) ?? 0) + 1);
    }
  }

  // IDF
  const idf = new Map<string, number>();
  for (const [t, d] of df) {
    idf.set(t, Math.log((N + 1) / (d + 1)) + 1);
  }

  // Pre-compute L2 norms
  const norms: number[] = [];
  for (const tf of tfs) {
    let sum = 0;
    for (const [t, v] of tf) {
      const w = v * (idf.get(t) ?? 0);
      sum += w * w;
    }
    norms.push(Math.sqrt(sum) || 1);
  }

  return { chunks, tfs, idf, norms };
}

// ---------------------------------------------------------------------------
// Singleton — built once per process
// ---------------------------------------------------------------------------

let _index: Index | null = null;

function getIndex(): Index {
  if (!_index) {
    _index = buildIndex(buildChunks());
  }
  return _index;
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export function searchChunks(query: string, topK = 5): Chunk[] {
  const idx = getIndex();
  if (idx.chunks.length === 0) return [];

  const qTokens = tokenize(query);
  const qtf = new Map<string, number>();
  for (const t of qTokens) {
    qtf.set(t, (qtf.get(t) ?? 0) + 1);
  }
  const qMaxFreq = Math.max(...qtf.values(), 1);

  // Query TF-IDF vector (sparse — only compute for query terms)
  const qWeights = new Map<string, number>();
  let qNorm = 0;
  for (const [t, f] of qtf) {
    const w = (f / qMaxFreq) * (idx.idf.get(t) ?? 0);
    if (w > 0) qWeights.set(t, w);
    qNorm += w * w;
  }
  qNorm = Math.sqrt(qNorm) || 1;

  // Cosine similarity
  const scores: { i: number; score: number }[] = [];
  for (let i = 0; i < idx.chunks.length; i++) {
    let dot = 0;
    for (const [t, qw] of qWeights) {
      const dw = (idx.tfs[i].get(t) ?? 0) * (idx.idf.get(t) ?? 0);
      dot += qw * dw;
    }
    const score = dot / (qNorm * idx.norms[i]);
    if (score > 0) scores.push({ i, score });
  }

  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, topK).map((s) => idx.chunks[s.i]);
}
