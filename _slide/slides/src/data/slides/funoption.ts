import type { DeckData } from "@/components/slides/types";

export const funoption: DeckData = {
  slug: "funoption",
  title: "FunOption",
  description:
    "「楽しさ」を軸にした地域イベント発見・参加プラットフォーム",
  date: "2025-10",
  tags: ["events", "local", "discovery"],
  theme: {
    brand: "#e11d48",
    accent: "#f97316",
    background: "#1c1917",
    foreground: "#fafaf9",
    muted: "#78716c",
  },
  slides: [
    {
      type: "title",
      title: "FunOption",
      subtitle:
        "「楽しさ」を軸にした地域イベント発見・参加プラットフォーム",
      badge: "Local x Fun",
    },
    {
      type: "section",
      title: "Why",
      subtitle: "地域の「楽しい」は、見つけにくく、伝わりにくい",
    },
    {
      type: "twoColumn",
      title: "現状の課題",
      leftLabel: "主催者",
      left: [
        "集客チャネルが限られる",
        "SNS 運用のノウハウ不足",
        "リピーター獲得が難しい",
      ],
      rightLabel: "参加者",
      right: [
        "地域イベント情報がバラバラ",
        "自分に合うものが見つからない",
        "参加後のつながりが途切れる",
      ],
    },
    {
      type: "diagram",
      title: "FunOption のサイクル",
      flow: "cycle",
      nodes: [
        { id: "discover", label: "発見", sub: "好みに基づくレコメンド" },
        { id: "join", label: "参加", sub: "ワンタップ予約" },
        { id: "experience", label: "体験", sub: "チェックイン・交流" },
        { id: "share", label: "共有", sub: "レビュー・SNS 連携" },
      ],
    },
    {
      type: "kpiList",
      title: "成長指標",
      items: [
        { label: "掲載イベント", value: "300+/月" },
        { label: "MAU", value: "2,000+", note: "6ヶ月目標" },
        { label: "リピート率", value: "40%+", note: "月次" },
        { label: "主催者NPS", value: "50+", note: "満足度" },
      ],
    },
    {
      type: "timeline",
      title: "ローンチ計画",
      events: [
        { date: "M1-2", label: "MVP 開発", detail: "イベント掲載・検索・予約" },
        { date: "M3-4", label: "レコメンド", detail: "嗜好学習・パーソナライズ" },
        { date: "M5-6", label: "コミュニティ", detail: "主催者ツール・フォロー" },
        { date: "M7+", label: "収益化", detail: "プレミアム枠・チケット手数料" },
      ],
    },
    {
      type: "comparison",
      title: "既存サービスとの違い",
      before: {
        label: "既存イベントサイト",
        items: [
          "ビジネス・セミナー中心",
          "カテゴリ検索のみ",
          "参加して終わり",
          "主催者負担が大きい",
        ],
      },
      after: {
        label: "FunOption",
        items: [
          "「楽しさ」が軸",
          "AI レコメンド",
          "参加後もつながる",
          "主催者支援ツール込み",
        ],
      },
    },
  ],
};
