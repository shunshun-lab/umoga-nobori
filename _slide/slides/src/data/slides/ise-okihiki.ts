import type { DeckData } from "@/components/slides/types";

export const iseOkihiki: DeckData = {
  slug: "ise-okihiki",
  title: "お木曳き完全ガイド",
  description:
    "2033年の式年遷宮へ — 550年の伝統行事を体感する。伊勢神宮基礎講座 第三弾",
  date: "2026-04",
  tags: ["伊勢神宮", "お木曳き", "式年遷宮", "常磐会"],
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
    {
      context: "タイトル・奉曳車",
      attribution: "Wikimedia Commons / CC BY-SA 3.0",
      url: "https://commons.wikimedia.org/wiki/Category:Okihiki_(Geku)",
    },
    {
      context: "エンヤ曳き（外宮・内宮）",
      attribution: "Wikimedia Commons / CC BY-SA 3.0",
      url: "https://commons.wikimedia.org/wiki/Category:Okihiki_(Geku)",
    },
    {
      context: "川曳・五十鈴川",
      attribution: "Wikimedia Commons / CC BY-SA 3.0",
      url: "https://commons.wikimedia.org/wiki/Category:Okihiki-Kawabiki_(Naiku)",
    },
    {
      context: "お木曳初式・木遣り上げ",
      attribution: "Wikimedia Commons / CC BY-SA 3.0",
      url: "https://commons.wikimedia.org/wiki/Category:Okihiki_(Geku)",
    },
    {
      context: "宇治橋",
      attribution: "Wikimedia Commons / CC BY-SA 3.0",
    },
    {
      context: "夫婦岩",
      attribution: "Wikimedia Commons / CC BY-SA 3.0",
    },
  ],
  slides: [
    // ── 1. タイトル ──
    {
      type: "photoTitle",
      title: "お木曳き完全ガイド",
      subtitle: "2033年の式年遷宮へ — いま動き出す\n550年の伝統行事を体感する",
      badge: "伊勢神宮基礎講座 第三弾",
      style: {
        backgroundImage:
          "https://upload.wikimedia.org/wikipedia/commons/3/39/Hoeisya_of_Okihikigyouji02.jpg",
        overlayOpacity: 0.65,
        credit: "Photo: Wikimedia Commons / CC BY-SA 3.0",
      },
    },
    // ── 2. 今日の流れ ──
    {
      type: "section",
      title: "今日の流れ",
      subtitle:
        "第一部: お木曳きとは — 550年つづく伝統行事\n第二部: 川曳と陸曳 — 2つの形式と当日の流れ\n第三部: 木の物語 — ヒノキの一生と「常若」\n第四部: 参加方法と常磐会",
    },
    // ── 3. お木曳きとは ──
    {
      type: "photoTitle",
      title: "式年遷宮の「始まり」を担う行事",
      subtitle:
        "御用材（ヒノキ）を宮域に運び入れる約550年の伝統行事\n遷宮の8年前から準備が始まり、伊勢のまち全体が動き出す",
      badge: "第一部 — お木曳きとは",
      style: {
        backgroundImage:
          "https://upload.wikimedia.org/wikipedia/commons/9/95/Enyabiki_of_Okihikigyoji_at_Geku01.jpg",
        overlayOpacity: 0.7,
      },
    },
    // ── 4. 写真：奉曳車 ──
    {
      type: "photoCaption",
      caption: "陸曳の奉曳車 — 外宮の御用材を載せて伊勢のまちを曳く",
      subcaption: "白装束・法被姿の奉曳団が伊勢音頭とともに進む",
      style: {
        backgroundImage:
          "https://upload.wikimedia.org/wikipedia/commons/0/0f/Hoeisya_of_Okihikigyouji01.jpg",
        overlayOpacity: 0.5,
      },
    },
    // ── 5. 歴史タイムライン ──
    {
      type: "timeline",
      title: "お木曳きの歴史",
      events: [
        {
          date: "室町時代",
          label: "約550年前",
          detail: "地元民が自発的に御用材を運んだのが起源",
        },
        {
          date: "江戸時代",
          label: "最盛期",
          detail: "伊勢のまち全体が参加する一大行事に。各地区に奉曳団が組織される",
        },
        {
          date: "戦中〜戦後",
          label: "中断と復興",
          detail: "中断の時期を経て復興",
        },
        {
          date: "2006年",
          label: "前回",
          detail: "延べ約23万人が参加。伊勢市人口の倍近い規模",
        },
        {
          date: "2026年",
          label: "今年",
          detail: [
            "第63回遷宮に向け、",
            { text: "20年ぶりに再始動", bold: true },
          ],
        },
      ],
    },
    // ── 6. 川曳 ──
    {
      type: "twoColumn",
      title: "川曳（かわびき）",
      leftLabel: "内宮の御用材を運ぶ",
      left: [
        "五十鈴川の水上に木を浮かべ、曳き綱で引いて宮域へ運ぶ",
      ],
      rightLabel: "川の中に入る奉仕",
      right: [
        "白装束・法被で腰まで浸かり、水しぶきを浴びながら曳く",
        [{ text: "禊のような体験", bold: true }],
      ],
      style: {
        backgroundImage:
          "https://upload.wikimedia.org/wikipedia/commons/d/d1/Kawabiki_at_the_riverside_of_Isuzugawa01.jpg",
        overlayOpacity: 0.7,
      },
    },
    // ── 7. 写真：川曳 ──
    {
      type: "photoCaption",
      caption: "川曳 — 五十鈴川で御用材を曳く参加者たち",
      subcaption: "内宮の参集殿前にて・法被姿で川に入り綱を引く",
      style: {
        backgroundImage:
          "https://upload.wikimedia.org/wikipedia/commons/e/ef/Kawabiki_in_front_of_sanshuden01.jpg",
        overlayOpacity: 0.5,
      },
    },
    // ── 8. 陸曳 ──
    {
      type: "twoColumn",
      title: "陸曳（おかびき）",
      leftLabel: "外宮の御用材を運ぶ",
      left: [
        [
          "大型の",
          { text: "奉曳車（ほうえいしゃ）", bold: true },
          "に木を載せて陸路を曳く。数百人で一斉に綱を引く壮大さ",
        ],
      ],
      rightLabel: "伊勢音頭が響くまち",
      right: [
        [
          "木遣りの唄に合わせて",
          { text: "「エンヤー！」", bold: true },
        ],
        "沿道も含め、まち全体が一つになる",
      ],
    },
    // ── 9. スケジュール ──
    {
      type: "twoColumn",
      title: "2026年 お木曳きスケジュール",
      leftLabel: "第一次お木曳き",
      left: [
        [{ text: "2026年 5月〜8月", bold: true }],
        "伊勢市内の各地区（奉曳団）が日程を分担して実施",
      ],
      rightLabel: "第二次お木曳き",
      right: [
        [{ text: "2027年 予定", bold: true }],
        "第一次で運びきれなかった御用材を引き続き運搬",
      ],
    },
    // ── 10. 当日の流れ ──
    {
      type: "diagram",
      title: "当日の流れ",
      nodes: [
        { id: "1", label: "集合・受付", sub: "朝" },
        { id: "2", label: "法被・鉢巻", sub: "受取り" },
        { id: "3", label: "出発式", sub: "木遣り唄" },
        { id: "4", label: "本曳き", sub: "2〜3時間" },
        { id: "5", label: "直会", sub: "食事会" },
      ],
      flow: "horizontal",
    },
    // ── 11. 服装・持ち物 ──
    {
      type: "factGrid",
      title: "服装・持ち物チェックリスト",
      facts: [
        {
          heading: "川曳",
          body: "濡れてよい服（着替え必須）／ゴム草履 or ウォーターシューズ／ビーサンNG",
        },
        {
          heading: "陸曳",
          body: "動きやすい服装／運動靴／暑さ対策を",
        },
        {
          heading: "共通の持ち物",
          body: [
            "タオル・帽子・水筒・日焼け止め／",
            { text: "法被は当日貸与", bold: true },
            "／貴重品は最小限に",
          ],
        },
      ],
    },
    // ── 12. 伊勢音頭 ──
    {
      type: "photoTitle",
      title: "伊勢音頭",
      subtitle: [
        { text: "「エンヤー！」", bold: true },
        "\n木遣りが唄を歌い、全員で掛け声を返しながら綱を引く\n550年の「声のリレー」— 京都をどりの発祥とも",
      ],
      badge: "第三部 — 木の物語と「常若」",
      style: {
        backgroundImage:
          "https://upload.wikimedia.org/wikipedia/commons/5/51/Enyabiki_of_Okihikigyoji_at_Naiku01.jpg",
        overlayOpacity: 0.65,
      },
    },
    // ── 13. ヒノキの一生 ──
    {
      type: "diagram",
      title: "ヒノキの一生",
      nodes: [
        { id: "1", label: "御杣始祭", sub: "木曽で伐採" },
        { id: "2", label: "伊勢へ運搬", sub: "トラック輸送" },
        { id: "3", label: "お木曳き", sub: "人の手で宮域へ" },
        { id: "4", label: "社殿に", sub: "宮大工の手で" },
      ],
      flow: "horizontal",
      style: {
        backgroundImage:
          "https://upload.wikimedia.org/wikipedia/commons/1/11/Kiyariage_of_Okihikigyoji01.jpg",
        overlayOpacity: 0.75,
      },
    },
    // ── 14. 古材リレー ──
    {
      type: "diagram",
      title: "古材の壮大なリレー",
      nodes: [
        { id: "1", label: "お木曳き", sub: "START" },
        { id: "2", label: "正殿", sub: "20年" },
        { id: "3", label: "鳥居", sub: "+20年" },
        { id: "4", label: "全国の神社", sub: "+60年〜" },
      ],
      flow: "horizontal",
    },
    // ── 15. なぜ参加するのか ──
    {
      type: "quote",
      quote:
        "知識として学ぶ伊勢と、身体で味わう伊勢はまったく違う。見知らぬ人と一緒に綱を引いた瞬間、「奉仕」と「友愛」の意味が、言葉ではなく身体でわかる。",
      author: "歴史の当事者になる — それがお木曳き",
      style: {
        backgroundImage:
          "https://upload.wikimedia.org/wikipedia/commons/7/78/%E3%81%8A%E6%9C%A8%E6%9B%B3%E3%81%8D%E8%A1%8C%E4%BA%8B_%E5%B7%9D%E6%9B%B3.jpg",
        overlayOpacity: 0.7,
      },
    },
    // ── 16. 参加方法 ──
    {
      type: "comparison",
      title: "参加する方法",
      before: {
        label: "常磐会経由（おすすめ）",
        items: [
          "仲間と一緒に参加",
          "ガイド・サポート付きで安心",
          "宿泊手配のお手伝いも",
          [{ text: "初めてでも大丈夫", bold: true }],
        ],
      },
      after: {
        label: "一般参加枠",
        items: [
          "伊勢市が用意する申込枠",
          "全国どこからでも参加可能",
          "個人での参加",
        ],
      },
    },
    // ── 17. イベントカレンダー ──
    {
      type: "table",
      title: "2026年 伊勢イベントカレンダー",
      headers: ["時期", "イベント", "おすすめ度"],
      rows: [
        [
          [{ text: "5月〜8月", bold: true }],
          "お木曳き（第一次）",
          [{ text: "今年の目玉", bold: true }],
        ],
        [
          [{ text: "6/20-21（土日）", bold: true }],
          "夏至祭（二見興玉神社）",
          [{ text: "土日開催は貴重", bold: true }],
        ],
        ["毎月2日", "朔日餅を楽しむ会（東京）", "入門におすすめ"],
        ["不定期", "リアル伊勢ツアー", "じっくり体験"],
      ],
    },
    // ── 18. CTA ──
    {
      type: "cta",
      title: "一緒に木を曳こう",
      subtitle: [
        "550年の伝統 × 川曳 or 陸曳 × 60年生き続ける\n",
        { text: "2033年の遷宮へ — いま動き出す", bold: true },
      ],
      buttonLabel: "isetokiwa.jp",
      url: "https://www.isetokiwa.jp/",
      style: {
        backgroundImage:
          "https://upload.wikimedia.org/wikipedia/commons/0/00/%E5%BE%A1%E6%9C%A8%E6%9B%B3%E8%A1%8C%E4%BA%8B_%E6%85%B6%E5%85%89%E9%99%A2%E6%9B%B3.jpg",
        overlayOpacity: 0.65,
      },
    },
  ],
};
