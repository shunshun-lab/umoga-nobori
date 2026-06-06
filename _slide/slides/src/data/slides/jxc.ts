import type { DeckData } from "@/components/slides/types";

export const jxc: DeckData = {
  slug: "jxc",
  title: "Japan X College",
  description:
    "若者の挑戦を可視化し、機会を循環させる分散型メディア",
  date: "2025-12",
  tags: ["education", "media", "community"],
  theme: {
    brand: "#2563eb",
    accent: "#06b6d4",
    background: "#0f172a",
    foreground: "#f8fafc",
    muted: "#64748b",
  },
  slides: [
    {
      type: "title",
      title: "Japan X College",
      subtitle:
        "若者の挑戦を可視化し、機会を循環させる分散型メディア",
      badge: "JXC 2025",
    },
    {
      type: "section",
      title: "Problem",
      subtitle: "挑戦が見えない、届かない、循環しない",
    },
    {
      type: "twoColumn",
      title: "何が起きているか",
      leftLabel: "若者側",
      left: [
        "アウトプットが散逸しやすい",
        "実績がポートフォリオにならない",
        "フィードバック機会が少ない",
      ],
      rightLabel: "社会側",
      right: [
        "若者の活動実態が見えにくい",
        "支援のマッチングが属人的",
        "ロールモデルが伝播しない",
      ],
    },
    {
      type: "diagram",
      title: "JXC のアーキテクチャ",
      flow: "horizontal",
      nodes: [
        { id: "create", label: "挑戦を投稿", sub: "活動レポート / 成果物" },
        { id: "verify", label: "VC 発行", sub: "実績を証明可能に" },
        { id: "discover", label: "発見・共有", sub: "メディアとして流通" },
        { id: "connect", label: "機会接続", sub: "支援者・企業とマッチ" },
      ],
    },
    {
      type: "kpiList",
      title: "目標 KPI（1年目）",
      items: [
        { label: "登録ユーザー", value: "500+", note: "大学生・高校生中心" },
        { label: "月間投稿数", value: "200+", note: "活動レポート" },
        { label: "VC 発行数", value: "1,000+", note: "Verifiable Credentials" },
        { label: "連携企業", value: "10社", note: "インターン・支援枠" },
      ],
    },
    {
      type: "timeline",
      title: "ロードマップ",
      events: [
        { date: "2025 Q1", label: "MVP リリース", detail: "投稿・閲覧・VC 基盤" },
        { date: "2025 Q2", label: "コミュニティ機能", detail: "グループ・メンター制" },
        { date: "2025 Q3", label: "企業連携", detail: "マッチング・推薦" },
        { date: "2026 Q1", label: "スケール", detail: "他大学展開・API 公開" },
      ],
    },
    {
      type: "comparison",
      title: "既存サービスとの違い",
      before: {
        label: "既存 SNS / ポートフォリオ",
        items: [
          "自己申告ベース",
          "検証不可能",
          "プラットフォーム依存",
          "流れて消える",
        ],
      },
      after: {
        label: "JXC",
        items: [
          "第三者検証済み VC",
          "ポータブルな実績",
          "分散型データ所有",
          "蓄積して価値が増す",
        ],
      },
    },
  ],
};
