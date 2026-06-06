import type { DeckData } from "@/components/slides/types";

export const skillBridge: DeckData = {
  slug: "skill-bridge",
  title: "Skill Bridge",
  description:
    "地域の暗黙知をデジタル化し、世代間でスキルを橋渡しするプラットフォーム",
  date: "2025-11",
  tags: ["skills", "local", "knowledge"],
  theme: {
    brand: "#16a34a",
    accent: "#facc15",
    background: "#052e16",
    foreground: "#f0fdf4",
    muted: "#6b7280",
  },
  slides: [
    {
      type: "title",
      title: "Skill Bridge",
      subtitle:
        "地域の暗黙知をデジタル化し、世代間でスキルを橋渡しする",
      badge: "Community Tech",
    },
    {
      type: "section",
      title: "背景",
      subtitle: "地域のスキルは「人」に閉じている",
    },
    {
      type: "twoColumn",
      title: "課題の構造",
      leftLabel: "スキル保有者",
      left: [
        "高齢化で引退が迫る",
        "教える場がない",
        "デジタルでの共有が難しい",
      ],
      rightLabel: "学びたい人",
      right: [
        "誰が何を知っているか見えない",
        "移住しないと学べない",
        "体系的なカリキュラムがない",
      ],
    },
    {
      type: "diagram",
      title: "プラットフォーム構成",
      flow: "cycle",
      nodes: [
        { id: "capture", label: "暗黙知を記録", sub: "動画・手順・対話ログ" },
        { id: "structure", label: "体系化", sub: "AI でカリキュラム生成" },
        { id: "learn", label: "学習", sub: "オンライン+現地体験" },
        { id: "practice", label: "実践・継承", sub: "地域で活用" },
      ],
    },
    {
      type: "kpiList",
      title: "ターゲット指標",
      items: [
        { label: "登録スキル", value: "100+", note: "農業・工芸・料理など" },
        { label: "コンテンツ時間", value: "500h+", note: "動画・テキスト" },
        { label: "学習者", value: "300+", note: "月間アクティブ" },
        { label: "連携地域", value: "5自治体", note: "初年度" },
      ],
    },
    {
      type: "timeline",
      title: "展開計画",
      events: [
        { date: "Phase 1", label: "パイロット", detail: "1地域で暗黙知記録" },
        { date: "Phase 2", label: "AI 構造化", detail: "カリキュラム自動生成" },
        { date: "Phase 3", label: "マッチング", detail: "学び手と職人を接続" },
        { date: "Phase 4", label: "横展開", detail: "他地域テンプレート化" },
      ],
    },
    {
      type: "comparison",
      title: "従来 vs Skill Bridge",
      before: {
        label: "従来の技能伝承",
        items: [
          "徒弟制・マンツーマン",
          "暗黙知のまま消失",
          "地理的制約",
          "スケールしない",
        ],
      },
      after: {
        label: "Skill Bridge",
        items: [
          "構造化されたコンテンツ",
          "AI 支援で体系化",
          "オンライン+現地ハイブリッド",
          "テンプレートで横展開",
        ],
      },
    },
  ],
};
