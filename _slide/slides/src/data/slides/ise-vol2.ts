import type { DeckData } from "@/components/slides/types";

export const iseVol2: DeckData = {
  slug: "ise-vol2",
  title: "参拝と歩き方 ＋ お木曳き",
  description:
    "外宮から内宮へ — 参拝作法・順路・お木曳きの実践ガイド。伊勢神宮基礎講座 第二弾",
  date: "2026-03",
  tags: ["伊勢神宮", "参拝", "お木曳き", "式年遷宮", "常磐会"],
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
    { context: "内宮参道（今日の流れ）", attribution: "Wikimedia Commons / CC BY-SA 3.0" },
    { context: "外宮正宮", attribution: "Wikimedia Commons / CC BY-SA 3.0" },
    { context: "せんぐう館（外宮の歩き方）", attribution: "Wikimedia Commons / CC BY-SA 3.0" },
    { context: "五十鈴川御手洗場", attribution: "Wikimedia Commons / CC BY-SA 3.0" },
    { context: "内宮正宮石段（二拝二拍手一拝）", attribution: "Wikimedia Commons / CC BY-SA 3.0" },
    { context: "夫婦岩", attribution: "Wikimedia Commons / CC BY-SA 3.0" },
    { context: "森林・参道", attribution: "Unsplash License" },
    { context: "お木曳き・奉曳車・エンヤ曳き", attribution: "Wikimedia Commons / CC BY-SA 3.0" },
  ],
  slides: [
    // ── スライド 1: タイトル ──
    {
      type: "photoTitle",
      title: "参拝と歩き方 ＋ お木曳き",
      subtitle: "伊勢神宮基礎講座 第二弾",
      badge: "全12枚 ／ 約30分",
      style: {
        backgroundImage: "https://upload.wikimedia.org/wikipedia/commons/4/43/Ise_Ise-jingu_Ujibashi_Bridge_1.jpg",
        overlayOpacity: 0.65,
        credit: "Photo: Wikimedia Commons / CC BY-SA 3.0",
      },
    },
    // ── スライド 2: 今日の流れ ──
    {
      type: "section",
      title: "今日の流れ",
      subtitle: "前半: 参拝ガイド（チラシを見ながら）\n　外宮先祭・歩き方・参拝作法・見どころ\n後半: お木曳き\n　式年遷宮とお木曳き・参加方法・常磐会ツアー\n\n※チラシを手元に広げてください",
      style: {
        backgroundImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Naiku_01.JPG/1280px-Naiku_01.JPG",
        overlayOpacity: 0.8,
      },
    },
    // ── 前半: 参拝と歩き方（スライド 3-6） ──
    // ── スライド 3: 外宮先祭 ──
    {
      type: "factGrid",
      title: "外宮先祭（げくうせんさい）",
      facts: [
        { heading: "順番", body: "外宮 → 内宮が正式な参拝順" },
        { heading: "豊受大御神", body: "天照大御神のお食事を司る神" },
        { heading: "「お膳立て」", body: "すべての祭事も外宮から先に行われる" },
      ],
      style: {
        backgroundImage: "https://upload.wikimedia.org/wikipedia/commons/7/70/Ise_Shrine_Geku_%28New_shrine%29.jpg",
        overlayOpacity: 0.82,
      },
    },
    // ── スライド 4: 外宮の歩き方 ──
    {
      type: "diagram",
      title: "外宮の歩き方（左側通行・30〜40分）",
      nodes: [
        { id: "1", label: "火除橋", sub: "" },
        { id: "2", label: "手水舎", sub: "" },
        { id: "3", label: "正宮", sub: "感謝の場" },
        { id: "4", label: "多賀宮", sub: "石段98段" },
        { id: "5", label: "土宮・風宮", sub: "" },
        { id: "6", label: "せんぐう館", sub: "300円" },
      ],
      flow: "horizontal",
      style: {
        backgroundImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Geku_Sengukan01.jpg/1280px-Geku_Sengukan01.jpg",
        overlayOpacity: 0.82,
      },
    },
    // ── スライド 5: 内宮と参拝作法 ──
    {
      type: "diagram",
      title: "内宮の歩き方（右側通行・1〜1.5時間）",
      nodes: [
        { id: "1", label: "宇治橋", sub: "101.8m" },
        { id: "2", label: "五十鈴川", sub: "御手洗場" },
        { id: "3", label: "正宮", sub: "まず感謝" },
        { id: "4", label: "荒祭宮", sub: "祈願の場" },
        { id: "5", label: "風日祈宮", sub: "静寂の地" },
        { id: "6", label: "神楽殿", sub: "お守り" },
      ],
      flow: "horizontal",
      style: {
        backgroundImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Isuzu-gawa_River3.jpg/1280px-Isuzu-gawa_River3.jpg",
        overlayOpacity: 0.8,
      },
    },
    // ── スライド 5b: 二拝二拍手一拝 ──
    {
      type: "diagram",
      title: "二拝二拍手一拝",
      nodes: [
        { id: "1", label: "①②", sub: "深く2回お辞儀（二拝）" },
        { id: "2", label: "③④", sub: "2回手を打つ（二拍手）" },
        { id: "3", label: "⑤", sub: "手を合わせ感謝・祈り" },
        { id: "4", label: "⑥", sub: "深く1回お辞儀（一拝）" },
      ],
      flow: "horizontal",
      style: {
        backgroundImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Naiku_05.JPG/1280px-Naiku_05.JPG",
        overlayOpacity: 0.8,
      },
    },
    // ── スライド 6: 見どころダイジェスト ──
    {
      type: "twoColumn",
      title: "見どころダイジェスト",
      leftLabel: "別宮・スポット",
      left: [
        "月読宮・月夜見宮・瀧原宮・伊雑宮",
        "おはらい町・おかげ横丁",
        "赤福・伊勢うどん・朔日餅",
        "二見興玉神社（夫婦岩→富士山が一直線）",
      ],
      rightLabel: "モデルコース",
      right: [
        [{ text: "半日:", bold: true }, " 外宮 or 内宮どちらか集中"],
        [{ text: "1日:", bold: true }, " 外宮→内宮→おかげ横丁"],
        [{ text: "1泊2日:", bold: true }, " 早朝内宮がおすすめ"],
        [{ text: "📖 公式 内宮参拝コース", href: "https://www.isejingu.or.jp/visit/course/naiku.html", bold: true }],
      ],
      style: {
        backgroundImage: "https://upload.wikimedia.org/wikipedia/commons/b/bc/Meoto_Iwa_3.JPG",
        overlayOpacity: 0.82,
      },
    },
    // ── 後半: お木曳き（スライド 7-12） ──
    // ── スライド 7: 式年遷宮とお木曳き ──
    {
      type: "photoTitle",
      title: "式年遷宮とお木曳き",
      subtitle: "20年に一度すべてを建て替え — 次は2033年（あと7年）\n約1万本のヒノキが必要\n2026年が第一次お木曳き行事",
      badge: "後半 — お木曳き",
      style: {
        backgroundImage: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1920&q=80",
        overlayOpacity: 0.7,
      },
    },
    // ── スライド 8: 川曳きと陸曳き ──
    {
      type: "twoColumn",
      title: "川曳きと陸曳き",
      leftLabel: "川曳き（内宮御用材）",
      left: [
        "五十鈴川でソリを曳く",
        "水しぶき・「エンヤ、エンヤ」の掛け声",
        "禊のような体験",
        "一般参加可能",
      ],
      rightLabel: "陸曳き（外宮御用材）",
      right: [
        "大型の奉曳車に木を載せ、数百人で曳く",
        "外宮参道を綱で曳く",
        "550年以上途切れることなく続く",
        "一般参加可能",
      ],
      style: {
        backgroundImage: "https://upload.wikimedia.org/wikipedia/commons/3/39/Hoeisya_of_Okihikigyouji02.jpg",
        overlayOpacity: 0.82,
      },
    },
    // ── スライド 9: なぜ参加する価値があるか ──
    {
      type: "factGrid",
      title: "なぜ参加する価値があるか",
      facts: [
        { heading: "① 身体で歴史に触れる", body: "1,300年の営みを腕の筋肉で感じる" },
        { heading: "② 見知らぬ人と一つになる", body: "数百人で一本の綱を曳く連帯感" },
        { heading: "③ 遷宮の「当事者」になれる", body: "次は2046年まで来ない" },
      ],
      style: {
        backgroundImage: "https://upload.wikimedia.org/wikipedia/commons/0/0f/Hoeisya_of_Okihikigyouji01.jpg",
        overlayOpacity: 0.82,
      },
    },
    // ── スライド 10: 2026年の日程と参加方法 ──
    {
      type: "table",
      title: "2026年 お木曳き日程・参加方法",
      headers: ["項目", "詳細"],
      rows: [
        ["陸曳き", "2026年5月9日〜6月13日"],
        ["川曳き", "2026年7月25日〜8月2日"],
        ["参加①", "奉曳団に参加（常磐会経由で手配可能）"],
        ["参加②", "一日神領民として登録"],
        ["服装", "白い服・法被・地下足袋 / 川曳きは着替え必須"],
      ],
      style: {
        backgroundImage: "https://upload.wikimedia.org/wikipedia/commons/9/95/Enyabiki_of_Okihikigyoji_at_Geku01.jpg",
        overlayOpacity: 0.85,
      },
    },
    // ── スライド 11: 夏至祭 ──
    {
      type: "photoCaption",
      caption: "夏至祭 — 2026年6月20日(土)〜21日(日)",
      subcaption: "二見興玉神社・夫婦岩\n朝日を浴びながら海で禊\n「お伊勢参りは二見から」を身をもって体験\n今年は土日！",
      style: {
        backgroundImage: "https://upload.wikimedia.org/wikipedia/commons/b/bc/Meoto_Iwa_3.JPG",
        overlayOpacity: 0.5,
      },
    },
    // ── スライド 12: まとめ＋CTA ──
    {
      type: "cta",
      title: "「常若」— 受け継ぎ、続けていく",
      subtitle: [
        "お木曳きは「受け継ぎ」の行為そのもの\n",
        "参拝から",
        { text: "当事者", bold: true },
        "に変わる\n伊勢と常磐会を通じて「自分の根っこ」を見つけていきましょう",
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
