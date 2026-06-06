import type { DeckData } from "@/components/slides/types";

export const iseVol4: DeckData = {
  slug: "ise-vol4",
  title: "伊勢の祭りと年中行事",
  description:
    "神嘗祭・新嘗祭・朔日参りから夏至祭まで。伊勢の祭事暦を通じて日本人の「暮らしのリズム」を学ぶ。伊勢神宮基礎講座 第四弾",
  date: "2026-04",
  tags: ["伊勢神宮", "神嘗祭", "夏至祭", "常磐会", "年中行事"],
  theme: {
    brand: "#b8860b",
    accent: "#d4a838",
    background: "#1a0a00",
    foreground: "#faf8f5",
    muted: "#a09080",
    font: "Noto Serif JP",
    backgroundAlt: "#1a1a2e",
  },
  credits: [
    { context: "タイトル・宇治橋", attribution: "Wikimedia Commons / CC BY-SA 3.0" },
    { context: "夫婦岩", attribution: "Wikimedia Commons / CC BY-SA 3.0" },
    { context: "外宮正宮", attribution: "Wikimedia Commons / CC BY-SA 3.0" },
    { context: "森林・自然", attribution: "Unsplash License" },
  ],
  slides: [
    // ── 1. タイトル ──
    {
      type: "photoTitle",
      title: "伊勢の祭りと\n年中行事",
      subtitle: "神嘗祭・新嘗祭・朔日参りから夏至祭まで\n日本人の「暮らしのリズム」を取り戻す",
      badge: "伊勢神宮基礎講座 第四弾",
      style: {
        backgroundImage: "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=1920&q=80",
        overlayOpacity: 0.7,
        credit: "Photo: Unsplash",
      },
    },
    // ── 2. 流れ ──
    {
      type: "section",
      title: "今日の流れ",
      subtitle: "第一部: 伊勢神宮の祭事暦 — 年に1,500回以上の祭り\n第二部: 四大祭事 — 神嘗祭・新嘗祭・祈年祭・月次祭\n第三部: 体験できる祭り — 夏至祭・朔日参り・初穂曳\n第四部: 暮らしのリズムと常磐会",
    },
    // ── 第一部: 祭事暦 ──
    {
      type: "stats",
      value: "1,500+",
      label: "伊勢神宮で年間に行われる祭りの数",
      detail: "毎日欠かさず行われる日別朝夕大御饌祭をはじめ、年間を通じて1,500回以上の祭事が執り行われている。一般の参拝者が見ることのできない祭りも多い",
    },
    {
      type: "factGrid",
      title: "毎日行われる祭り",
      facts: [
        {
          heading: "日別朝夕大御饌祭",
          body: [
            { text: "毎日、朝と夕の2回", bold: true },
            "、天照大御神にお食事（神饌）をお供えする祭り。1,500年以上一度も途切れたことがない",
          ],
        },
        {
          heading: "御饌（みけ）の内容",
          body: "米・酒・餅・海の幸・山の幸・塩・水。すべて伊勢の地で調達。火は「忌火」で起こす",
        },
        {
          heading: "なぜ「食」なのか",
          body: [
            "外宮の豊受大御神は「食」の神。",
            { text: "「食べること＝生きること」への感謝が伊勢の祈りの根幹", bold: true },
          ],
        },
      ],
    },
    // ── 第二部: 四大祭事 ──
    {
      type: "section",
      title: "四大祭事",
      subtitle: "伊勢神宮の一年を貫く4つの柱",
    },
    {
      type: "kpiList",
      title: "神嘗祭（かんなめさい）",
      items: [
        { label: "時期", value: "10月15〜17日", note: "年間最重要の祭事" },
        { label: "意味", value: "新米を天照大御神に捧げる", note: "「神の嘗（な）め」" },
        { label: "由来", value: "天照大御神が高天原で稲を育てた神話" },
        { label: "規模", value: "外宮→内宮の順に3日間", note: "勅使が天皇の幣帛を捧げる" },
      ],
      style: {
        backgroundImage: "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=1920&q=80",
        overlayOpacity: 0.8,
      },
    },
    {
      type: "table",
      title: "四大祭事一覧",
      headers: ["祭事", "時期", "意味"],
      rows: [
        [
          [{ text: "神嘗祭", bold: true }],
          [{ text: "10月15-17日", bold: true }],
          "新米を天照大御神に。年間最重要",
        ],
        [
          [{ text: "新嘗祭", bold: true }],
          "11月23-24日",
          "天皇が新穀を神々に捧げ、自らも食す",
        ],
        [
          "祈年祭",
          "2月17日",
          "五穀豊穣を祈る春の祭り",
        ],
        [
          "月次祭",
          "6月・12月（15-17日）",
          "神嘗祭と同格の祭り。年に2回",
        ],
      ],
    },
    {
      type: "quote",
      quote: "日本人にとって「祭り」とは、神様と人が食を共にすること。新米を捧げ、共に食べる。それが1,500年前から変わらない伊勢の祈りの形",
      author: "神嘗祭 — 日本版の「感謝祭」",
    },
    // ── 第三部: 体験できる祭り ──
    {
      type: "section",
      title: "体験できる祭り",
      subtitle: "見るだけでなく、自分の身体で参加できる行事",
    },
    {
      type: "twoColumn",
      title: "夏至祭（二見興玉神社）",
      leftLabel: "概要",
      left: [
        [{ text: "2026年は6月20-21日（土日）", bold: true }],
        "二見興玉神社・夫婦岩の前で",
        "朝日を浴びながら海での禊を体験",
        "鎮魂行法 → 未明3:30〜 禊",
      ],
      rightLabel: "夫婦岩の秘密",
      right: [
        [{ text: "夫婦岩の先 約200kmに富士山", bold: true }],
        "夏至前後、富士山の山頂付近から日の出",
        "夫婦岩・日の出・富士山が一直線",
        "古来「お伊勢参りは二見から」",
      ],
      style: {
        backgroundImage: "https://upload.wikimedia.org/wikipedia/commons/b/bc/Meoto_Iwa_3.JPG",
        overlayOpacity: 0.7,
      },
    },
    {
      type: "factGrid",
      title: "朔日参り（ついたちまいり）",
      facts: [
        {
          heading: "毎月1日の早朝参拝",
          body: "前月の無事に感謝し、新しい月の平安を祈る。伊勢の人々にとっての「暮らしのリズム」",
        },
        {
          heading: "朔日餅（ついたちもち）",
          body: [
            { text: "赤福が毎月1日だけ販売", bold: true },
            "する月替わりの餅。早朝から行列ができる。1月:えびす餅、2月:立春大福…",
          ],
        },
        {
          heading: "東京でも体験",
          body: [
            "常磐会の「朔日餅を楽しむ会」で毎月2日に東京開催。",
            { text: "入門におすすめ", bold: true },
          ],
        },
      ],
    },
    {
      type: "twoColumn",
      title: "初穂曳（はつほびき）",
      leftLabel: "概要",
      left: [
        [{ text: "10月15-16日", bold: true }, "（神嘗祭に合わせて）"],
        "その年の新米をお宮に届ける行事",
        "お木曳きと同じ川曳・陸曳の形式",
        "「お木曳きのミニ版」として毎年体験可能",
      ],
      rightLabel: "お木曳きとの違い",
      right: [
        [{ text: "お木曳き:", bold: true }, " ヒノキ（御用材）を運ぶ。遷宮前のみ"],
        [{ text: "初穂曳:", bold: true }, " 新米を運ぶ。毎年開催"],
        "川曳・陸曳の雰囲気を味わう入門として最適",
        [{ text: "一般参加可能", bold: true }],
      ],
    },
    // ── 第四部: 暮らしのリズム ──
    {
      type: "section",
      title: "暮らしのリズムを取り戻す",
      subtitle: "伊勢の祭事暦は「日本人の暮らしの原点」",
    },
    {
      type: "timeline",
      title: "伊勢の一年 — 季節の祭り",
      events: [
        { date: "1月", label: "歳旦祭・初詣", detail: "約50万人が参拝" },
        { date: "2月", label: "祈年祭", detail: "五穀豊穣を祈る" },
        { date: "5-8月", label: "お木曳き", detail: [{ text: "2026年に20年ぶり再始動", bold: true }] },
        { date: "6月", label: "月次祭・夏至祭", detail: [{ text: "今年は土日開催！", bold: true }] },
        { date: "10月", label: "神嘗祭・初穂曳", detail: [{ text: "年間最重要の祭事", bold: true }] },
        { date: "11月", label: "新嘗祭", detail: "天皇が新穀を神々に捧げる" },
        { date: "12月", label: "月次祭・天長祭", detail: "一年の感謝を捧げる" },
      ],
    },
    {
      type: "comparison",
      title: "現代の暮らしに取り入れる",
      before: {
        label: "忘れがちなこと",
        items: [
          "食べ物への「いただきます」が形骸化",
          "季節の移り変わりを意識しない",
          "感謝を伝える機会が少ない",
        ],
      },
      after: {
        label: "伊勢の暮らしのリズム",
        items: [
          [{ text: "毎日の食事 = 祈りの場", bold: true }, "（日別朝夕大御饌祭）"],
          [{ text: "毎月1日 = リセットの日", bold: true }, "（朔日参り）"],
          [{ text: "新米 = 一年の感謝の集大成", bold: true }, "（神嘗祭）"],
        ],
      },
    },
    {
      type: "cta",
      title: "伊勢の暦で、暮らしを整える",
      subtitle: [
        "2026年の注目行事\n",
        { text: "お木曳き（5月〜）", bold: true },
        " / ",
        { text: "夏至祭（6/20-21 土日）", bold: true },
        " / ",
        { text: "神嘗祭・初穂曳（10月）", bold: true },
        "\n一緒に、伊勢のリズムで一年を過ごしてみませんか",
      ],
      buttonLabel: "isetokiwa.jp",
      url: "https://www.isetokiwa.jp/",
      style: {
        backgroundImage: "https://upload.wikimedia.org/wikipedia/commons/4/43/Ise_Ise-jingu_Ujibashi_Bridge_1.jpg",
        overlayOpacity: 0.7,
      },
    },
  ],
};
