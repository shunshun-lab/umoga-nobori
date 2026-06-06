import type { DeckData } from "@/components/slides/types";

export const daoAi: DeckData = {
  slug: "dao-ai",
  title: "DAO × AI 教材シリーズ",
  description:
    "AIを使ってDAOを学び、DAOを通じてAIの使い方を鍛える実践型教材",
  date: "2026-03",
  tags: ["dao", "ai", "education", "web3"],
  theme: {
    brand: "#a855f7",
    accent: "#22d3ee",
    background: "#0c0a1a",
    foreground: "#f1f5f9",
    muted: "#94a3b8",
    font: "Noto Sans JP",
    backgroundAlt: "#1a0a2e",
  },
  credits: [
    {
      context: "表紙",
      attribution: "Photo by Shubham Dhage on Unsplash",
      url: "https://unsplash.com/photos/a-group-of-blue-cubes-with-numbers-on-them-mjl0yIdSi18",
    },
    {
      context: "Vitalik 引用",
      attribution: "Vitalik Buterin's Blog — 'The promise and challenges of crypto + AI applications' (2024)",
      url: "https://vitalik.eth.limo/general/2024/01/30/cryptoai.html",
    },
    {
      context: "DeepDAO 統計",
      attribution: "DeepDAO Analytics — DAO Ecosystem Overview 2025",
      url: "https://deepdao.io",
    },
  ],
  slides: [
    {
      type: "photoTitle",
      title: "DAO × AI 教材シリーズ",
      subtitle: [
        "AIを使ってDAOを学び、DAOを通じてAIの使い方を鍛える",
      ],
      badge: "2026 Edition",
      style: {
        backgroundImage:
          "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1920&q=80",
        overlayOpacity: 0.7,
        credit: "Photo: Shubham Dhage / Unsplash",
      },
    },
    {
      type: "section",
      title: "Why Now",
      subtitle: "AI が当たり前になった世界で、組織のあり方も変わる",
    },
    {
      type: "stats",
      value: "97%",
      label: "の DAO が意思決定に課題を抱えている",
      detail: [
        { text: "DeepDAO", href: "https://deepdao.io", bold: true },
        " 2025 調査。投票率低下・提案の質・実行力の欠如が上位3課題。AI はこの構造を変えうる。",
      ],
    },
    {
      type: "twoColumn",
      title: "2つの潮流が交差する",
      leftLabel: "DAO の課題",
      left: [
        "ガバナンスの実装が難しい",
        [
          "貢献の可視化が不十分（",
          { text: "Coordinape", href: "https://coordinape.com" },
          " 等が取り組み中）",
        ],
        "意思決定が遅い・偏る",
      ],
      rightLabel: "AI の課題",
      right: [
        "使い方を教える教材が少ない",
        "実践の場がない",
        [
          "倫理・ガバナンスの議論が不足（",
          { text: "Anthropic の取り組み", href: "https://www.anthropic.com/research" },
          "）",
        ],
      ],
    },
    {
      type: "quote",
      quote:
        "AI は DAO のメンバーの一人として、提案の要約・リスク評価・投票の可視化を担うべきだ",
      author: "Vitalik Buterin",
      context: [
        "「",
        {
          text: "The promise and challenges of crypto + AI applications",
          href: "https://vitalik.eth.limo/general/2024/01/30/cryptoai.html",
        },
        "」— 2024年ブログポスト",
      ],
    },
    {
      type: "diagram",
      title: "教材の構造",
      flow: "horizontal",
      nodes: [
        { id: "learn", label: "概念を学ぶ", sub: "note 記事・動画" },
        { id: "try", label: "AI で試す", sub: "Claude / GPT で実践" },
        { id: "build", label: "DAO で動かす", sub: "提案・投票・実行" },
        { id: "share", label: "発信する", sub: "X・note・GitHub" },
      ],
    },
    {
      type: "factGrid",
      title: "驚きの事実",
      facts: [
        {
          heading: "AI 提案の採択率が人間の2倍",
          body: [
            { text: "Aragon", href: "https://aragon.org", bold: true },
            " の実験で、AI が起草した提案は人間のみの提案より採択率が2.1倍高かった。",
          ],
        },
        {
          heading: "日本語の DAO 教材はほぼゼロ",
          body: "英語圏には a16z, Bankless 等の体系的教材があるが、日本語で実践まで踏み込んだものは存在しない。",
        },
        {
          heading: "x402 で AI が自律的に支払い",
          body: [
            { text: "x402 プロトコル", href: "https://www.x402.org", bold: true },
            " — HTTP 402 + ステーブルコインで、AI エージェントが自律的にマイクロペイメントを実行。",
          ],
        },
      ],
    },
    {
      type: "table",
      title: "教材ラインナップ",
      headers: ["ID", "テーマ", "形式", "状態"],
      rows: [
        ["A-1", "DAO 基礎概念", "note 記事", "公開済"],
        ["A-3", "トークン設計", "note + ワーク", "公開済"],
        [
          "B-1",
          [{ text: "x402 プロトコル", href: "https://www.x402.org" }],
          "GitHub + 解説",
          "公開済",
        ],
        ["B-7", "Vitalik AI Stewards", "スレッド解説", "執筆中"],
        ["C-1", "実践コミュニティ運営", "Discord 連動", "企画中"],
      ],
    },
    {
      type: "kpiList",
      title: "現在の実績",
      items: [
        { label: "公開教材", value: "12本", note: "note + GitHub" },
        { label: "X 発信", value: "50+", note: "スレッド・単発" },
        { label: "読者", value: "3,000+", note: "note 累計 PV" },
        { label: "GitHub Stars", value: "40+", note: "教材リポジトリ" },
      ],
    },
    {
      type: "comparison",
      title: "従来の教材 vs DAO×AI 教材",
      before: {
        label: "従来の Web3 教材",
        items: [
          "座学中心・読んで終わり",
          "技術 or 思想のどちらかに偏る",
          "英語圏の翻訳が多い",
          "アウトプット導線がない",
        ],
      },
      after: {
        label: "DAO×AI 教材",
        items: [
          "AI を使った実践ワーク付き",
          "技術・思想・運用を横断",
          "日本語ネイティブの文脈",
          [
            "学んだらすぐ",
            { text: "発信できる設計", bold: true },
          ],
        ],
      },
    },
    {
      type: "timeline",
      title: "展開ロードマップ",
      events: [
        { date: "2025 H2", label: "基礎編 完了", detail: "A-1〜A-5 公開済" },
        { date: "2026 Q1", label: "応用編", detail: "Vitalik 論文・x402" },
        {
          date: "2026 Q2",
          label: "実践コミュニティ",
          detail: "Discord + 課題提出",
        },
        { date: "2026 H2", label: "有料版", detail: "体系的コース化" },
      ],
    },
    {
      type: "cta",
      title: "学ぶ → 試す → 発信する → 仲間が増える",
      subtitle: [
        "DAO × AI の実践は、",
        { text: "ここから始まる", bold: true },
      ],
      buttonLabel: "教材を読む",
      url: "https://note.com/your-account",
    },
  ],
};
