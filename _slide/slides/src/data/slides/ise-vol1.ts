import type { DeckData } from "@/components/slides/types";

export const iseVol1: DeckData = {
  slug: "ise-vol1",
  title: "伊勢神宮と常磐会入門",
  description:
    "古事記・日本神話から式年遷宮と「常若」の思想まで。伊勢神宮基礎講座 第一弾",
  date: "2026-02",
  tags: ["伊勢神宮", "常磐会", "古事記", "常若"],
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
    { context: "内宮正宮", attribution: "Wikimedia Commons / CC BY-SA 3.0" },
    { context: "夫婦岩", attribution: "Wikimedia Commons / CC BY-SA 3.0" },
    { context: "森林・参道", attribution: "Unsplash License" },
  ],
  slides: [
    {
      type: "photoTitle",
      title: "伊勢神宮と常磐会入門",
      subtitle: "古事記・日本神話と伊勢のつながり\n式年遷宮と「常若」の思想",
      badge: "伊勢神宮基礎講座 第一弾",
      style: {
        backgroundImage: "https://upload.wikimedia.org/wikipedia/commons/4/43/Ise_Ise-jingu_Ujibashi_Bridge_1.jpg",
        overlayOpacity: 0.65,
        credit: "Photo: Wikimedia Commons / CC BY-SA 3.0",
      },
    },
    {
      type: "section",
      title: "今日の流れ",
      subtitle: "1. 伊勢神宮ってどんな場所？\n2. 古事記・日本神話と伊勢のつながり\n3. 式年遷宮と「常若」の思想\n4. 常磐会（ときわかい）とは？\n5. 一緒に参加できるイベントの紹介",
    },
    // ── 伊勢神宮の基本 ──
    {
      type: "kpiList",
      title: "日本の「心のふるさと」",
      items: [
        { label: "正式名称", value: "神宮", note: "「伊勢」も付かない唯一無二の存在" },
        { label: "創建", value: "約2,000年前", note: "内宮" },
        { label: "宮域林", value: "5,500ha", note: "東京都世田谷区とほぼ同じ面積" },
        { label: "宮社の数", value: "125社", note: "4市2町にまたがる広大な信仰圏" },
      ],
    },
    {
      type: "twoColumn",
      title: "内宮と外宮",
      leftLabel: "内宮（皇大神宮）",
      left: [
        "祭神：天照大御神 — 皇室のご祖先・国民の「総氏神」",
        "五十鈴川のほとりに鎮座",
        [{ text: "御神体：八咫鏡（やたのかがみ）", bold: true }],
      ],
      rightLabel: "外宮（豊受大神宮）",
      right: [
        "祭神：豊受大御神 — 天照大御神のお食事を司る神",
        "衣食住・産業の守り神",
        "約1,500年前に丹波国から伊勢に迎えられた",
      ],
    },
    // ── 古事記 ──
    {
      type: "section",
      title: "古事記・日本書紀と伊勢",
      subtitle: "天照大御神の誕生から伊勢の地が選ばれるまで",
    },
    {
      type: "factGrid",
      title: "天照大御神の誕生",
      facts: [
        { heading: "左目", body: [{ text: "天照大御神", bold: true }, " — 太陽の女神"] },
        { heading: "右目", body: "月読命 — 月の神" },
        { heading: "鼻", body: "須佐之男命 — 嵐の神" },
      ],
      style: {
        backgroundImage: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1920&q=80",
        overlayOpacity: 0.8,
      },
    },
    {
      type: "quote",
      quote: "この神風の伊勢の国は常世から波が寄せる美しい国。ここにいたい",
      author: "天照大御神のお告げ — 倭姫命が伊勢にたどり着いた時",
      context: "倭姫命が大和国を出発し、伊賀・近江・美濃を巡幸。ついに伊勢国に入り、五十鈴川の川上に宮が建てられた",
    },
    {
      type: "table",
      title: "三種の神器と伊勢",
      headers: ["神器", "現在の所在"],
      rows: [
        [[{ text: "八咫鏡", bold: true }], [{ text: "伊勢神宮 内宮（御神体）", bold: true }]],
        ["草薙剣", "熱田神宮（名古屋）"],
        ["八尺瓊勾玉", "皇居"],
      ],
    },
    // ── 式年遷宮 ──
    {
      type: "section",
      title: "式年遷宮",
      subtitle: "1,300年つづく「建て替え」の大事業",
    },
    {
      type: "kpiList",
      title: "式年遷宮の規模",
      items: [
        { label: "周期", value: "20年ごと", note: "持統天皇4年（690年）に第1回" },
        { label: "建て替え殿舎", value: "65棟" },
        { label: "御装束神宝", value: "714種・1,576点", note: "すべて新調" },
        { label: "使用ヒノキ", value: "約1万本", note: "8,500m³" },
        { label: "費用（第62回）", value: "約550億円" },
        { label: "次回", value: "2033年 秋", note: "第63回" },
      ],
    },
    {
      type: "timeline",
      title: "なぜ「20年」ごとなのか",
      events: [
        { date: "1回目", label: "青年期", detail: "見習いとして参加" },
        { date: "2回目", label: "壮年期", detail: "中堅として技術を発揮" },
        { date: "3回目", label: "熟年期", detail: "ベテランとして若手を指導" },
      ],
      style: {
        backgroundImage: "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=1920&q=80",
        overlayOpacity: 0.8,
      },
    },
    {
      type: "diagram",
      title: "古材の「壮大なリレー」",
      nodes: [
        { id: "1", label: "正殿", sub: "20年" },
        { id: "2", label: "宇治橋の鳥居", sub: "+20年" },
        { id: "3", label: "関の追分・七里の渡", sub: "+20年" },
        { id: "4", label: "全国の神社", sub: "修復に提供" },
      ],
      flow: "horizontal",
    },
    {
      type: "comparison",
      title: "「常若（とこわか）」の思想",
      before: {
        label: "西洋の発想",
        items: [
          "石やコンクリートで頑丈に作る",
          "できるだけ長く持たせる",
          "ピラミッド・パルテノン → 廃墟",
        ],
      },
      after: {
        label: "日本の発想「常若」",
        items: [
          "朽ちやすい木で作る",
          [{ text: "定期的に作り替えることで永遠を実現", bold: true }],
          [{ text: "伊勢神宮 → 常にピカピカの新築", bold: true }],
        ],
      },
    },
    // ── 驚きの事実 ──
    {
      type: "factGrid",
      title: "知ってた？ — 驚きの事実",
      facts: [
        {
          heading: "御神体を誰も見たことがない",
          body: "遷御の儀は完全な闇の中。八咫鏡は天皇ですら直接見られない",
        },
        {
          heading: "犬がお伊勢参りをしていた",
          body: "江戸時代、首に旅費とメモをくくりつけ道中リレーで世話。「おかげ犬」",
        },
        {
          heading: "6人に1人が一斉に伊勢へ",
          body: "1830年、半年で約460万人が殺到（当時の人口は約3,000万人）",
        },
      ],
    },
    // ── 常磐会 ──
    {
      type: "section",
      title: "常磐会（ときわかい）とは",
      subtitle: "伊勢の地から未来を育むコミュニティ",
    },
    {
      type: "factGrid",
      title: "常磐会が目指すもの",
      facts: [
        { heading: "日本の伝統文化の継承", body: "伊勢を拠点に学びの場をつくる" },
        { heading: "若い世代の健全な育ち", body: "大学生・起業家・家族連れが集まる" },
        { heading: "世代をこえたつながり", body: "奉仕・友愛・責任・忍耐・進取" },
      ],
    },
    {
      type: "table",
      title: "イベント一覧",
      headers: ["イベント", "場所", "時期", "おすすめ"],
      rows: [
        ["朔日餅を楽しむ会", "東京", "毎月", "入門"],
        ["リアル伊勢ツアー", "伊勢現地", "不定期", "入門〜中級"],
        [[{ text: "お木曳き", bold: true }], "伊勢現地", [{ text: "2026年〜", bold: true }], "中級〜上級"],
        [[{ text: "夏至祭", bold: true }], "二見ヶ浦", [{ text: "6月（今年は土日！）", bold: true }], "全レベル"],
      ],
    },
    {
      type: "cta",
      title: "一緒に「常若」のこころを\n伊勢から未来へ",
      subtitle: [
        "2026年は ",
        { text: "お木曳き元年", bold: true },
        " & ",
        { text: "夏至祭が土日", bold: true },
        "\n伊勢に関わる絶好のタイミング",
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
