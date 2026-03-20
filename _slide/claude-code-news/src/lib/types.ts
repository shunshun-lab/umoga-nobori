export interface DigestFrontmatter {
  date: string;
  title: string;
  itemCount: number;
}

export interface NewsItem {
  title: string;
  url: string;
  date: string;
  summary: string;
  source: string;
}

export interface Digest {
  date: string;
  title: string;
  itemCount: number;
  items: NewsItem[];
}
