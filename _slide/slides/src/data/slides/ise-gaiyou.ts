import type { DeckData } from "@/components/slides/types";
import { iseGaiyouSelfQr } from "./ise-gaiyou-qr";

export const iseGaiyou: DeckData = {
  slug: "ise-gaiyou",
  title: "常磐会のご案内",
  description:
    "伊勢の地から未来の世代を育むコミュニティ「常磐会（ときわかい）」の団体概要。理念(MVV)・活動の3つの入り口・年間カレンダー・関わり方まで。勧誘・新規募集向け。",
  date: "2026-06",
  tags: ["常磐会", "伊勢神宮", "団体概要", "コミュニティ", "勧誘"],
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
    { context: "タイトル・宇治橋／朝日", attribution: "Wikimedia Commons / CC BY-SA 3.0" },
    { context: "夫婦岩・二見", attribution: "Wikimedia Commons / CC BY-SA 3.0" },
    { context: "森林・自然", attribution: "Unsplash License" },
    { context: "出典: 団体情報は isetokiwa.jp (annual-plan / past-events / join) に基づく", attribution: "https://www.isetokiwa.jp/" },
  ],
  slides: [
    // ── 1. タイトル ──
    {
      type: "photoTitle",
      title: "常磐会（ときわかい）の\nご案内",
      subtitle: "伊勢の地から、未来の世代を育むコミュニティ\nTOKIWAKAI — A COMMUNITY GROWING FROM ISE",
      badge: "団体概要",
      style: {
        backgroundImage: "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=1920&q=80",
        overlayOpacity: 0.72,
        credit: "Photo: Unsplash",
      },
    },
    // ── 2. つかみ ──
    {
      type: "section",
      title: "こんな思い、ありませんか？",
      subtitle:
        "「日本のことを、何も知らないままでいいのかな」\n「忙しい毎日に、立ち返れる“軸”がほしい」\n「損得をこえて付き合える仲間に出会いたい」\n\n——その答えを探しに、伊勢へ来ませんか。",
    },
    // ── 3. 常磐会とは ──
    {
      type: "factGrid",
      title: "常磐会とは",
      facts: [
        {
          heading: "どんな団体？",
          body: [
            { text: "常磐会（ときわかい）", bold: true },
            "。伊勢を拠点に、若い世代と多世代のための学びの場をつくる団体（一般社団法人 設立準備中）。活動は伊勢のほか東京・京都でも。",
          ],
        },
        { heading: "継承", body: "日本の伝統文化を、次の世代へ受け継ぐ" },
        { heading: "育ち", body: "若い世代・子どもたちの健やかな育ちを支える" },
        { heading: "つながり", body: "世代をこえた、温かなつながりを育む" },
      ],
    },
    // ── 4. なぜ伊勢 ──
    {
      type: "quote",
      quote: "変わらないために、変わり続ける。",
      author: "伊勢神宮の式年遷宮が伝える「常若（とこわか）」の思想",
      context:
        "20年ごとにすべてを新しくし、1,300年もの永遠を保ち続ける。この知恵を、現代の私たちの生き方の軸に。",
    },
    // ── 5. MVV ──
    {
      type: "factGrid",
      title: "私たちが目指すもの（MVV）",
      facts: [
        {
          heading: "Mission｜使命",
          body: "伊勢の地から日本の伝統文化を次世代へ継承し、若い世代の育ちと世代をこえたつながりを育む",
        },
        {
          heading: "Vision｜目指す姿",
          body: [
            { text: "「変わらないために、変わり続ける」", bold: true },
            "— 常若の思想を、現代の生き方の軸に",
          ],
        },
        {
          heading: "Value｜5つのこころ",
          body: [{ text: "奉仕・友愛・責任・忍耐・進取", bold: true }],
        },
      ],
    },
    // ── 6. 名前の由来 ──
    {
      type: "factGrid",
      title: "名称「常磐会」にこめた想い",
      facts: [
        {
          heading: "常磐（ときわ）",
          body: [{ text: "いつまでも変わらない、揺るがないもの", bold: true }],
        },
        {
          heading: "由来",
          body: "祝詞のことば「常磐尓堅磐尓（ときはに かきはに）」に由来する",
        },
        {
          heading: "願い",
          body: "伊勢で共に学んだ仲間が、進む道は変わっても心はひとつに、ずっとつながっていてほしい",
        },
        {
          heading: "命名",
          body: "会の名は、神宮参事・音羽悟氏により名づけられた",
        },
      ],
    },
    // ── 7. 集まる人 ──
    {
      type: "twoColumn",
      title: "どんな人たちが集まるのか",
      leftLabel: "若い世代",
      left: ["全国の大学生", "社会人", "場所にとらわれず働く人"],
      rightLabel: "地域・多世代",
      right: ["ご家族", "子どもたち", "人生の先輩方"],
    },
    // ── 8. 育まれるもの ──
    {
      type: "factGrid",
      title: "活動を通して育まれるもの",
      facts: [
        { heading: "人の役に立つ喜び", body: "奉仕 — 誰かのために時間や力を使う" },
        { heading: "世代をこえた友情", body: "友愛 — 立場をこえてつながる" },
        { heading: "一歩踏み出す勇気", body: "進取 — 新しいことに踏み出す" },
        {
          heading: "大切にしていること",
          body: [
            "上達も入会条件もありません。",
            { text: "「身につけなきゃ」ではなく「いつのまにか育っていた」", bold: true },
            "を大切にします",
          ],
        },
      ],
    },
    // ── 9. 体験 ──
    {
      type: "factGrid",
      title: "参加するとどんな体験が",
      facts: [
        { heading: "物語が自分ごとに", body: "日本の神話や歴史が「物語」から「自分ごと」に変わる" },
        { heading: "仲間ができる", body: "世代や地域をこえた仲間ができる" },
        { heading: "心身を整える", body: "自然の中で、心と身体を整えるきっかけになる" },
      ],
    },
    // ── 10. 活動の3つの入り口 ──
    {
      type: "factGrid",
      title: "活動の3つの入り口",
      facts: [
        {
          heading: "① 学びの場（知る）",
          body: "伊勢・日本文化を学び、物語を自分ごとに。朔日会／伊勢神宮基礎講座／伊勢神宮100人講演会",
        },
        {
          heading: "② 体験・奉仕（身体で味わう）",
          body: "行事の当事者になり、心身を整える。お木曳き奉仕／夏至祭／リアル伊勢・伊勢ツアー",
        },
        {
          heading: "③ つながり（仲間と続ける）",
          body: "世代・地域をこえた縁を結ぶ。京都イベント／会員コミュニティ",
        },
      ],
    },
    // ── 11. 朔日会 ──
    {
      type: "factGrid",
      title: "① 学びの入り口：朔日会（ついたちかい）",
      facts: [
        {
          heading: "毎月2日・東京",
          body: "伊勢の朔日参りの文化を、東京で・日常の中で味わう定例の交流イベント",
        },
        {
          heading: "朔日餅は全11種類",
          body: [
            "かしわ餅・麦手餅・笹わらび餅・八朔粟餅・萩の餅…と",
            { text: "月替わり", bold: true },
            "で味わいながら、神宮や伊勢の話を聞き感想をシェア",
          ],
        },
        {
          heading: "はじめての方へ",
          body: "伊勢に行ったことがなくても大丈夫。まずはここから",
        },
      ],
    },
    // ── 12. 動と静 ──
    {
      type: "twoColumn",
      title: "② 体験の入り口：伊勢で身体ごと味わう",
      leftLabel: "【動】お木曳き奉仕",
      left: [
        "御用材を奉曳車や川で運ぶ伝統行事",
        "法被・伊勢音頭で町が最も活気づく",
        ["奉仕枠は", { text: "成人10名・学生10名の少人数制", bold: true }, "（2026年は5/17・8/2）"],
        "「行事のど真ん中で奉仕したい」人へ",
      ],
      rightLabel: "【静】夏至祭（二見興玉神社・6月）",
      right: [
        "夫婦岩の間から昇る朝日を浴びる",
        "海での禊で心身を清める",
        "「自分と向き合う時間をとりたい」人へ",
      ],
    },
    // ── 13. 年間カレンダー ──
    {
      type: "table",
      title: "伊勢の一年を、共に巡る（年間カレンダー）",
      headers: ["時期", "活動", "場所"],
      rows: [
        ["1月", "リアル伊勢（新年の参拝）", "おかげ横丁"],
        ["毎月2日", "朔日会（朔日餅を楽しむ会）", "東京"],
        ["3月", "リアル伊勢（春の参拝）", "おかげ横丁"],
        ["4月", "伊勢ツアー（宿泊）／京都・都をどり&舞妓体験", "伊勢・京都"],
        ["5・8月", "お木曳き奉仕（少人数枠）", "伊勢"],
        ["6月", "夏至祭", "二見興玉神社"],
        ["11月", "リアル伊勢（朔日参り）", "伊勢"],
        ["2033年秋", [{ text: "第63回 式年遷宮 — 活動が向かう北極星", bold: true }], "伊勢"],
      ],
    },
    // ── 14. どれが自分に向くか ──
    {
      type: "factGrid",
      title: "どの関わり方が自分に向いている？",
      facts: [
        { heading: "まず雰囲気を知りたい", body: "→ 朔日会（東京）" },
        { heading: "伊勢にじっくり行きたい", body: "→ リアル伊勢・伊勢ツアー" },
        { heading: "行事の中で奉仕したい", body: "→ お木曳き奉仕（少人数枠）" },
        { heading: "自分と向き合いたい", body: "→ 夏至祭（二見興玉神社）" },
      ],
    },
    // ── 15. 呼びかけ ──
    {
      type: "quote",
      quote: "あなたの根っこを、伊勢で。",
      context:
        "祭り・行事・学びの場を通して、自分の根っこを見つめなおし、仲間と共に成長していく。進む道が分かれても、伊勢でつながった心はずっとひとつに。",
    },
    // ── 16. CTA ──
    {
      type: "cta",
      title: "次の一歩",
      subtitle: [
        "いきなり入会しなくて大丈夫。気軽なイベント参加から。\n",
        "① イベントを見る・申し込む → Peatix　／　② 会員になる・支援する → ",
        { text: "isetokiwa.jp/join", href: "https://www.isetokiwa.jp/join" },
        "\n\n費用のめやす｜会員: 年10,000円（名刺付20,000円・自動更新なし）／寄付: 1,000円から",
      ],
      buttonLabel: "常磐会の最新情報を見る",
      url: "https://www.isetokiwa.jp/",
      qr: iseGaiyouSelfQr,
      qrCaption: "このスライドをスマホで（あとでゆっくり見返せます）",
    },
  ],
};
