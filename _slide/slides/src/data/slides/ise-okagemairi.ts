import type { DeckData } from "@/components/slides/types";

const IMG = {
  oharaimachi:
    "https://upload.wikimedia.org/wikipedia/commons/b/b9/Okage_Yokocho_-_Ise%2C_Mie%2C_Japan_-_DSC07770.jpg",
  okageEzu:
    "https://upload.wikimedia.org/wikipedia/commons/8/8a/Ando_hiroshige_miyakawanowatashi.jpg",
  tokaido:
    "https://upload.wikimedia.org/wikipedia/commons/4/43/Ando_Hiroshige_-_The_Fifty-Three_Stations_of_the_Tokaido-_Hara_-_1985.235_-_Cleveland_Museum_of_Art.jpg",
  onshi:
    "https://upload.wikimedia.org/wikipedia/commons/2/25/Ise_sangu_meisho_zue_-_vol_1_p_22.jpg",
  okageInu:
    "https://upload.wikimedia.org/wikipedia/commons/2/21/Dog_-_Hata_Rokurozaemon_with_his_dog.jpg",
  futami:
    "https://upload.wikimedia.org/wikipedia/commons/1/1d/Futamigaura_Beach_and_Meoto-iwa_2014-05-18_%2814024083920%29.jpg",
  furuichi:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Yashima_Gakutei_-_The_Dance_at_Furuichi_for_the_Hisagataya_Group_-_1921.332_-_Cleveland_Museum_of_Art.tif/lossy-page1-1280px-Yashima_Gakutei_-_The_Dance_at_Furuichi_for_the_Hisagataya_Group_-_1921.332_-_Cleveland_Museum_of_Art.tif.jpg",
  naiku:
    "https://upload.wikimedia.org/wikipedia/commons/2/2d/Ise_Ise-jingu_Isuzugawa_1.jpg",
  iseudon:
    "https://upload.wikimedia.org/wikipedia/commons/3/30/Ise_Udon_by_Kinoko.JPG",
};

export const iseOkagemairi: DeckData = {
  slug: "ise-okagemairi",
  title: "おかげ参りと伊勢の文化",
  description:
    "江戸の庶民は、なぜ伊勢を目指したのか。おかげ参り・御師・伊勢講・施行——「おかげさま」の文化と、令和のおかげ参り追体験を学ぶ。伊勢神宮基礎講座 第四弾（文化編）",
  date: "2026-05",
  tags: ["伊勢神宮", "おかげ参り", "御師", "常磐会", "江戸文化"],
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
      context: "タイトル・名物・CTA（おはらい町／おかげ横丁）",
      attribution: "Okage Yokocho, Ise / Wikimedia Commons / CC BY-SA",
    },
    {
      context: "おかげ参り絵図（宮川の渡し）",
      attribution: "歌川広重「伊勢参宮 宮川の渡し」/ Wikimedia Commons / パブリックドメイン",
    },
    {
      context: "東海道の旅人",
      attribution:
        "歌川広重「東海道五十三次・原」/ Cleveland Museum of Art / Wikimedia Commons / PD",
    },
    {
      context: "御師・伊勢参宮",
      attribution: "『伊勢参宮名所図会』巻一 / Wikimedia Commons / パブリックドメイン",
    },
    {
      context: "おかげ犬（犬の浮世絵）",
      attribution: "「秦六郎左衛門と犬」/ Wikimedia Commons / パブリックドメイン",
    },
    {
      context: "二見浦・夫婦岩",
      attribution: "Futamigaura & Meoto-iwa / Wikimedia Commons / CC BY-SA",
    },
    {
      context: "古市の踊り（伊勢音頭）",
      attribution:
        "八島岳亭「古市の瓢箪屋連の躍」/ Cleveland Museum of Art / Wikimedia Commons / PD",
    },
    {
      context: "内宮・五十鈴川",
      attribution: "Isuzugawa, Naiku, Ise-jingu / Wikimedia Commons / CC BY-SA",
    },
    {
      context: "伊勢うどん",
      attribution: "Ise Udon / Wikimedia Commons / CC BY-SA",
    },
  ],
  slides: [
    // ── 1. タイトル ──
    {
      type: "photoTitle",
      title: "おかげ参りと\n伊勢の文化",
      subtitle: "江戸の庶民は、なぜ伊勢を目指したのか\nOKAGE-MAIRI & THE CULTURE OF ISE",
      badge: "伊勢神宮基礎講座 第四弾",
      style: {
        backgroundImage: IMG.oharaimachi,
        overlayOpacity: 0.72,
        credit: "おはらい町・おかげ横丁 / Wikimedia Commons",
      },
    },
    // ── 2. 今日の流れ ──
    {
      type: "section",
      title: "今日の流れ",
      subtitle:
        "第一部: おかげ参りとは — 江戸の参詣ブーム\n第二部: 旅を支えた仕組み — 御師・伊勢講・施行\n第三部: 食と遊びの文化 — 古市・伊勢音頭・名物\n第四部: いまの伊勢と常磐会 — 受け継がれる「おかげ」",
    },
    // ── 第一部: おかげ参りとは ──
    {
      type: "photoTitle",
      title: "一生に一度は\nお伊勢参り",
      subtitle:
        "江戸の庶民にとって、伊勢参りは一生に一度の憧れ\n片道15泊前後、往復・滞在・寄り道を含めると1か月以上の大旅行",
      badge: "第一部 — おかげ参りとは",
      style: {
        backgroundImage: IMG.tokaido,
        overlayOpacity: 0.74,
        credit: "歌川広重「東海道五十三次・原」/ PD",
      },
    },
    {
      type: "photoCaption",
      caption: "おかげ参り — 江戸時代、伊勢を目指した群衆の賑わい",
      subcaption: "文政・天保期の伊勢参宮ブームを描いた絵図（宮川の渡し）",
      style: {
        backgroundImage: IMG.okageEzu,
        credit: "歌川広重「伊勢参宮 宮川の渡し」/ PD",
      },
    },
    {
      type: "stats",
      value: "約460〜500万人",
      label: "1830年・文政のおかげ参りの参宮者数（諸説あり）",
      detail: [
        "通常の参宮者は年間 約70万人。それが「おかげ年」には数百万人に膨れ上がった。1830年は半年弱で約460〜500万人——当時の人口の",
        { text: "約6人に1人", bold: true },
        "が伊勢へ。約60年に一度の規模で大流行が起きたといわれる（数字は関所・渡し場の通過記録に基づく推計）",
      ],
    },
    {
      type: "timeline",
      title: "おかげ参りの大流行 — 約60年周期といわれる",
      events: [
        {
          date: "1650年",
          label: "慶安",
          detail: "最初の大流行の記録。箱根関を1日 約2,000人が通過したとも",
        },
        {
          date: "1705年",
          label: "宝永",
          detail: ["約2か月で ", { text: "約360万人", bold: true }, " が参宮（諸説あり）"],
        },
        {
          date: "1771年",
          label: "明和",
          detail: ["約 ", { text: "200万人", bold: true }, " が参宮。抜け参りが社会現象に"],
        },
        {
          date: "1830年",
          label: "文政・天保",
          detail: [
            "半年弱で ",
            { text: "約460〜500万人", bold: true },
            "。四国の子供の抜け参りが発端とも（諸説あり）",
          ],
        },
        {
          date: "1867年",
          label: "慶応",
          detail: "幕末、御札降りとともに民衆が乱舞した「ええじゃないか」。おかげ参りの系譜上にあるとも（諸説あり）",
        },
      ],
    },
    // ── 第二部: 旅を支えた仕組み ──
    {
      type: "section",
      title: "抜け参り（ぬけまいり）",
      subtitle:
        "奉公人や子供が、主人や親に無断で伊勢へ。だから「おかげ参り」＝「抜け参り」。\n伊勢参り目的の通行手形はほぼ無条件で発給され、お札を持ち帰れば黙認された。\n「お伊勢さんへ行ってきます」——これが当時、最強の通行証だった。",
      style: { backgroundImage: IMG.onshi, overlayOpacity: 0.78 },
    },
    {
      type: "factGrid",
      title: "旅を支えた「おかげさま」の仕組み",
      facts: [
        {
          heading: "御師（おんし）",
          body: [
            "全国を回り",
            { text: "御祓大麻（お札）", bold: true },
            "を頒布して信仰を広めた神職・祈祷師。伊勢講を組織し、参拝者の宿・案内・食事まで担った——現代でいう旅行代理店のような存在。最盛期 約800〜900家",
          ],
        },
        {
          heading: "伊勢講（いせこう）",
          body: [
            "村人がお金を出し合う互助の仕組み。",
            { text: "くじで選ばれた代表者", bold: true },
            "が、みんなの分も参拝。「自分は行けなくても、誰かが行ってくれる」",
          ],
        },
        {
          heading: "施行（せぎょう）",
          body: [
            "沿道の人が旅人に食事・宿を",
            { text: "無料提供", bold: true },
            "。無一文の抜け参りも伊勢まで辿り着けた。柄杓（ひしゃく）一本が、施行を受ける目印",
          ],
        },
      ],
    },
    {
      type: "quote",
      quote: "犬の世話をすると徳がある — 施行の文化が、犬にまで及んだ",
      context: [
        { text: "おかげ犬", bold: true },
        "。飼い主の代わりに、犬が単独で伊勢参りをした。首に名札と道中費用を付けて送り出すと、街道の旅人が食事や宿を世話してくれた。福島から往復 約2か月 を成功させた犬の実話も残る。",
      ],
      style: {
        backgroundImage: IMG.okageInu,
        overlayOpacity: 0.72,
        credit: "「秦六郎左衛門と犬」/ PD",
      },
    },
    // ── 第三部: 食と遊びの文化 ──
    {
      type: "photoTitle",
      title: "お伊勢参りは\n二見から",
      subtitle:
        "内宮参拝の前に、まず二見浦で身を清める「浜参宮」＝塩水を浴びる禊\n第一弾・第二弾で触れた夫婦岩も、ここ二見浦に",
      badge: "第三部 — 食と遊びの文化",
      style: {
        backgroundImage: IMG.futami,
        overlayOpacity: 0.7,
        credit: "二見浦・夫婦岩 / Wikimedia Commons",
      },
    },
    {
      type: "comparison",
      title: "古市（ふるいち）と精進落とし",
      before: {
        label: "なぜ伊勢に遊郭が？",
        items: [
          "内宮と外宮の間に栄えた遊里・古市",
          "吉原・島原と並ぶ遊里として語られることも",
          ["参拝で禁欲した客が羽目を外す ", { text: "「精進落とし」", bold: true }, " の街"],
          "伊勢参宮文化の一大歓楽地だった",
        ],
      },
      after: {
        label: "聖と俗が隣り合う",
        items: [
          "神聖な参拝と人間くさい享楽が同居",
          "信仰の旅には、リアルな一面もあった",
          ["それも ", { text: "伊勢の文化の素顔", bold: true }],
        ],
      },
    },
    {
      type: "quote",
      quote: "伊勢は津でもつ、津は伊勢でもつ",
      context: [
        { text: "伊勢音頭", bold: true },
        "。古市の宴席で踊られ、参拝客が故郷へ持ち帰って全国に広まった民謡。第三弾のお木曳きで曳く伊勢音頭も、この流れ——江戸の伊勢ブームが生んだ「声の文化遺産」。",
      ],
      style: {
        backgroundImage: IMG.furuichi,
        overlayOpacity: 0.74,
        credit: "八島岳亭「古市の瓢箪屋連の躍」/ PD",
      },
    },
    {
      type: "factGrid",
      title: "おはらい町・おかげ横丁と名物",
      facts: [
        {
          heading: "おはらい町 / おかげ横丁",
          body: [
            "宇治橋前の約800mの鳥居前町。",
            { text: "1993年", bold: true },
            "、赤福が中心となり伊勢路の町並みを再現。江戸のおかげ参りの賑わいを今に",
          ],
        },
        {
          heading: "赤福（1707年創業）",
          body: "餡の三筋は五十鈴川の清流、白い餅は川底の小石を表す。名は「赤心慶福」に由来",
        },
        {
          heading: "伊勢うどん・へんば餅",
          body: "極太の柔らかい麺に濃いたまり醤油だれの伊勢うどん。夏季限定の赤福氷も名物",
        },
      ],
    },
    {
      type: "photoCaption",
      caption: "伊勢の名物 — 江戸の参詣文化が育てた味",
      subcaption: "赤福・伊勢うどん・へんば餅 — おはらい町・おかげ横丁の賑わい",
      style: {
        backgroundImage: IMG.iseudon,
        credit: "Ise Udon / Wikimedia Commons",
      },
    },
    // ── 第四部: いまの伊勢と常磐会 ──
    {
      type: "quote",
      quote: "自分ひとりの力ではない",
      context: [
        "「おかげさま」——神仏や周りの支えへの感謝。おかげ参り・施行・伊勢講に共通する精神。第一弾の「常若」、第三弾のお木曳きとも一本の糸でつながる、伊勢が日本人に残した最も大切な言葉のひとつ。",
      ],
    },
    {
      type: "comparison",
      title: "江戸のおかげ参りと今の私たち",
      before: {
        label: "当時",
        items: ["一生に一度", "命がけで歩く25日の旅", "御師が旅を案内した"],
      },
      after: {
        label: "今",
        items: [
          ["新幹線で東京から ", { text: "約3時間半", bold: true }],
          "行きやすくなった分、「なぜ伊勢に行くのか」が問われる",
          ["御師の案内役を、", { text: "常磐会が担っていきたい", bold: true }],
        ],
      },
      style: { backgroundImage: IMG.naiku, overlayOpacity: 0.78 },
    },
    {
      type: "table",
      title: "2026年 伊勢イベントカレンダー",
      headers: ["時期", "イベント", "おすすめ度"],
      rows: [
        ["5月〜8月", "お木曳き第一次（第三弾参照）", "今年の目玉"],
        ["6/20-21（土日）", "夏至祭（二見興玉神社）", "禊の追体験"],
        ["毎月2日", "朔日餅を楽しむ会（東京）", "入門におすすめ"],
        ["不定期", "おかげ参り 文化さんぽ（古市・おはらい町）", "今日の話の体験版"],
      ],
    },
    // ── CTA ──
    {
      type: "cta",
      title: "あなたの「おかげ参り」を、常磐会で",
      subtitle:
        "江戸の庶民が憧れた、一生に一度の大旅行。御師・伊勢講・施行という「おかげさま」の仕組みが、その旅を支えていた。\n知識として学ぶ伊勢と、自分の足で歩く伊勢はまったく違う。",
      buttonLabel: "参加申込ページへ",
      url: "https://did-event.vercel.app/c/tokiwakai",
      style: {
        backgroundImage: IMG.oharaimachi,
        overlayOpacity: 0.78,
      },
    },
  ],
};
