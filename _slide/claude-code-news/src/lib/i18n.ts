export type Locale = "en" | "ja";

const dict = {
  // Header
  "header.subtitle": { en: "Daily Auto-Collected", ja: "毎日自動収集" },

  // Home
  "home.title": { en: "Latest Claude Code News", ja: "最新 Claude Code ニュース" },
  "home.desc": {
    en: "Auto-collected daily from Anthropic Blog / GitHub Releases / Hacker News / Reddit / Dev.to.",
    ja: "Anthropic Blog / GitHub Releases / Hacker News / Reddit / Dev.to から毎朝自動収集。",
  },
  "home.digests": { en: "digests", ja: "件のダイジェスト" },
  "home.totalItems": { en: "total items", ja: "件の記事" },
  "home.noDigests": { en: "No digests yet", ja: "まだダイジェストがありません" },
  "home.runCollect": {
    en: "Run {cmd} to fetch the latest news.",
    ja: "{cmd} を実行してニュースを取得してください。",
  },
  "home.items": { en: "items", ja: "件" },
  "home.more": { en: "more...", ja: "件以上..." },

  // Digest
  "digest.back": { en: "All digests", ja: "一覧に戻る" },
  "digest.itemsFrom": { en: "items from", ja: "件 ソース:" },
  "digest.items": { en: "items", ja: "件" },
  "digest.clear": { en: "Clear", ja: "解除" },

  // Newsletter
  "nl.title": { en: "Daily Newsletter", ja: "デイリーニュースレター" },
  "nl.subtitle": {
    en: "Your daily briefing on Claude Code ecosystem",
    ja: "Claude Code エコシステムの日次ブリーフィング",
  },
  "nl.highlights": { en: "Today's Highlights", ja: "本日のハイライト" },
  "nl.releases": { en: "Release Updates", ja: "リリース情報" },
  "nl.community": { en: "Community & Blog Posts", ja: "コミュニティ & ブログ記事" },
  "nl.allLinks": { en: "All Links", ja: "全リンク一覧" },
  "nl.readMore": { en: "Read more", ja: "続きを読む" },
  "nl.backToDigest": { en: "Back to digest", ja: "ダイジェストに戻る" },
  "nl.viewNewsletter": { en: "Newsletter", ja: "ニュースレター" },
  "nl.noHighlights": { en: "No highlights for today.", ja: "本日のハイライトはありません。" },
} as const;

type Key = keyof typeof dict;

export function t(key: Key, locale: Locale): string {
  return dict[key]?.[locale] ?? key;
}
