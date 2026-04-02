import { notFound } from "next/navigation";
import { getDeck, getAllSlugs } from "@/data/slides";
import Link from "next/link";

export function generateStaticParams() {
  return getAllSlugs().map((deck) => ({ deck }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ deck: string }>;
}) {
  const { deck: slug } = await params;
  const deck = getDeck(slug);
  return { title: deck ? `${deck.title} — ハンドアウト` : "Not Found" };
}

/* ── Ise Vol2 Handout — 参拝ガイド (One-pager) ── */
function IseVol2Handout() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10 text-slate-800">
      {/* Hero */}
      <div className="relative mb-10 overflow-hidden rounded-2xl">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/4/43/Ise_Ise-jingu_Ujibashi_Bridge_1.jpg"
          alt="伊勢神宮 宇治橋"
          className="h-56 w-full object-cover sm:h-72"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 p-6 text-white">
          <p className="text-xs tracking-widest text-amber-300 mb-1">
            ISE JINGU SANPAI GUIDE
          </p>
          <h1 className="text-3xl font-bold tracking-wide sm:text-4xl">
            伊勢神宮 参拝ガイド
          </h1>
          <p className="mt-1 text-sm text-white/70">
            外宮から内宮へ — 作法と歩き方の実践ガイド
          </p>
        </div>
      </div>

      {/* ── 外宮先祭 ── */}
      <section className="mb-10">
        <h2 className="mb-4 border-b-2 border-amber-600 pb-2 text-xl font-bold">
          外宮先祭
        </h2>
        <p className="mb-3 leading-relaxed">
          参拝の順番は<strong>外宮→内宮</strong>が正式。外宮の豊受大御神は天照大御神のお食事を司る神。
          「お膳立て」してから主役のもとへ。
        </p>
      </section>

      {/* ── 外宮の歩き方 ── */}
      <section className="mb-10">
        <h2 className="mb-4 border-b-2 border-amber-600 pb-2 text-xl font-bold">
          外宮の歩き方（左側通行・30〜40分）
        </h2>
        <div className="rounded-xl border-l-4 border-amber-600 bg-amber-50 p-4 text-sm mb-4">
          <p className="text-amber-900">
            <strong>火除橋</strong> → <strong>手水舎</strong> → <strong>正宮</strong> → <strong>多賀宮</strong>(98段) → 土宮 → 風宮 → <strong>せんぐう館</strong>(300円)
          </p>
        </div>
        <p className="leading-relaxed">
          <strong>多賀宮</strong>は外宮最大の別宮。個人の祈願はここで。
        </p>
        <p className="mt-2 text-sm text-slate-600">
          外宮→内宮: バス15分 / タクシー10分 / 徒歩50分。
          寄り道: <strong>月夜見宮</strong>（外宮北御門から徒歩5分）
        </p>
      </section>

      {/* ── 内宮の歩き方 ── */}
      <section className="mb-10">
        <h2 className="mb-4 border-b-2 border-amber-600 pb-2 text-xl font-bold">
          内宮の歩き方（右側通行・1〜1.5時間）
        </h2>
        <div className="rounded-xl border-l-4 border-amber-600 bg-amber-50 p-4 text-sm mb-4">
          <p className="text-amber-900">
            <strong>宇治橋</strong> → 神苑 → <strong>五十鈴川</strong> → <strong>正宮</strong>(感謝) → <strong>荒祭宮</strong>(祈願) → 風日祈宮 → <strong>神楽殿</strong>
          </p>
        </div>
      </section>

      {/* ── 二拝二拍手一拝 ── */}
      <section className="mb-10">
        <h2 className="mb-4 border-b-2 border-amber-600 pb-2 text-xl font-bold">
          二拝二拍手一拝
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm mb-4">
          {[
            { n: "①②", t: "深く2回お辞儀" },
            { n: "③④", t: "2回手を打つ" },
            { n: "⑤", t: "手を合わせ感謝・祈り" },
            { n: "⑥", t: "深く1回お辞儀" },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-600 text-white font-bold text-xs">
                {step.n}
              </div>
              <p className="font-bold text-slate-800 text-sm">{step.t}</p>
              {i < 3 && <span className="text-amber-400 mx-1">→</span>}
            </div>
          ))}
        </div>
        <div className="rounded-xl border-l-4 border-amber-600 bg-amber-50 p-4 text-sm">
          <p className="text-amber-900">
            正宮ではまず感謝。個人的なお願いは荒祭宮・多賀宮で、という風習もある（諸説あり）
          </p>
        </div>

        <h3 className="mt-5 mb-2 text-base font-bold">手水の作法（一杯の水で）</h3>
        <p className="text-sm leading-relaxed">
          ①右手で柄杓→左手洗う ②持ち替え→右手洗う ③左手に水→口すすぐ ④左手洗う ⑤柄杓立て→柄を清め戻す
        </p>
      </section>

      {/* ── 見どころ巡り ── */}
      <section className="mb-10">
        <h2 className="mb-4 border-b-2 border-amber-600 pb-2 text-xl font-bold">
          見どころ巡り
        </h2>

        <h3 className="mb-2 text-base font-bold">別宮めぐり</h3>
        <div className="overflow-x-auto mb-4">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-amber-600 text-left">
                <th className="py-2 pr-4 font-bold">別宮</th>
                <th className="py-2 pr-4 font-bold">場所</th>
                <th className="py-2 font-bold">特徴</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="py-2 pr-4 font-bold text-amber-700">月読宮</td>
                <td className="py-2 pr-4">内宮から徒歩20分</td>
                <td className="py-2">4社殿が並ぶ</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2 pr-4 font-bold text-amber-700">月夜見宮</td>
                <td className="py-2 pr-4">外宮から徒歩5分</td>
                <td className="py-2">大楠木・穴場</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2 pr-4 font-bold text-amber-700">瀧原宮</td>
                <td className="py-2 pr-4">内宮から車40分</td>
                <td className="py-2">「遥宮」深い杉木立</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2 pr-4 font-bold text-amber-700">伊雑宮</td>
                <td className="py-2 pr-4">志摩市</td>
                <td className="py-2">日本三大田植祭</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="mb-2 text-base font-bold">おはらい町・おかげ横丁</h3>
        <p className="text-sm leading-relaxed mb-4">
          内宮前800mの門前町。赤福本店(朝5時〜)・伊勢うどん・てこね寿司・松阪牛コロッケ。
          毎月1日は<strong>朔日餅</strong>（行列覚悟）。1〜2時間で回れます。
        </p>

        <h3 className="mb-2 text-base font-bold">二見興玉神社と夫婦岩</h3>
        <div className="rounded-xl border-l-4 border-amber-600 bg-amber-50 p-4 text-sm mb-4">
          <p className="font-bold text-amber-800 mb-1">「お伊勢参りは二見から」</p>
          <p className="text-amber-900">
            夫婦岩の先200kmに<strong>富士山が一直線</strong>。夏至に山頂付近から日の出。外宮からバス20分。
          </p>
        </div>
      </section>

      {/* ── 季節ごとの伊勢 ── */}
      <section className="mb-10">
        <h2 className="mb-4 border-b-2 border-amber-600 pb-2 text-xl font-bold">
          季節ごとの伊勢
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-amber-600 text-left">
                <th className="py-2 pr-4 font-bold">季節</th>
                <th className="py-2 font-bold">おすすめ</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="py-2 pr-4 font-bold text-amber-700">春</td>
                <td className="py-2">桜（宮川堤・五十鈴川）+ お木曳き(5月〜)</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2 pr-4 font-bold text-amber-700">夏</td>
                <td className="py-2">夏至祭(6月) + 伊勢神宮奉納全国花火大会(7月)</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2 pr-4 font-bold text-amber-700">秋</td>
                <td className="py-2">神嘗祭(10/15-17) 年間最重要の祭事</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2 pr-4 font-bold text-amber-700">冬</td>
                <td className="py-2">初詣（三が日で40万人超） + 冬の早朝参拝(最高)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── モデルコース ── */}
      <section className="mb-10">
        <h2 className="mb-4 border-b-2 border-amber-600 pb-2 text-xl font-bold">
          モデルコース
        </h2>
        <div className="space-y-3">
          <div className="rounded-xl border p-4">
            <h3 className="text-base font-bold mb-1">半日（3〜4時間）</h3>
            <p className="text-sm text-slate-600">外宮(40分) → バス → 内宮(1.5h) → おかげ横丁(1h)</p>
          </div>
          <div className="rounded-xl border p-4">
            <h3 className="text-base font-bold mb-1">1日（6〜8時間）</h3>
            <p className="text-sm text-slate-600">外宮(1h) → 月夜見宮(20min) → 内宮(1.5h) → おかげ横丁(1.5h) → 月読宮(30min)</p>
          </div>
          <div className="rounded-xl border-2 border-amber-600 p-4">
            <h3 className="text-base font-bold mb-1">1泊2日（おすすめ）</h3>
            <p className="text-sm text-slate-600">
              <strong>1日目:</strong> 二見(2h) → 外宮 → せんぐう館<br />
              <strong>2日目:</strong> 早朝内宮(6時台) → 別宮 → おかげ横丁
            </p>
            <p className="mt-2 text-sm font-bold text-amber-700">
              早朝の内宮は別世界。泊まる価値はここにある。
            </p>
          </div>
        </div>
      </section>

      {/* ── 参拝マナー ── */}
      <section className="mb-10">
        <h2 className="mb-4 border-b-2 border-amber-600 pb-2 text-xl font-bold">
          参拝マナー
        </h2>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-amber-600">▸</span>
            撮影禁止場所では<strong>撮影不可</strong>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600">▸</span>
            参道の中央（正中）を避けて歩く
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600">▸</span>
            鳥居で入退場とも<strong>一礼</strong>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600">▸</span>
            帽子を取る・飲食しない
          </li>
        </ul>
      </section>

      {/* ── 常磐会イベント ── */}
      <section className="mb-10">
        <h2 className="mb-4 border-b-2 border-amber-600 pb-2 text-xl font-bold">
          常磐会イベント
        </h2>
        <div className="space-y-3">
          <div className="rounded-xl border p-4">
            <span className="inline-block rounded-full border bg-green-100 text-green-800 border-green-300 px-2 py-0.5 text-xs font-bold mb-2">
              入門
            </span>
            <h3 className="text-base font-bold">リアル伊勢ツアー</h3>
            <p className="text-xs text-slate-500 mb-1">不定期 ／ 伊勢現地</p>
            <p className="text-sm text-slate-600">この参拝ガイドの内容をガイド付きで体験。初心者歓迎。</p>
          </div>
          <div className="rounded-xl border-2 border-amber-400 p-4">
            <span className="inline-block rounded-full border bg-orange-100 text-orange-800 border-orange-300 px-2 py-0.5 text-xs font-bold mb-2">
              注目
            </span>
            <h3 className="text-base font-bold">お木曳き</h3>
            <p className="text-xs text-slate-500 mb-1">2026年5月〜8月（第一次）陸曳5-6月／川曳7-8月 ／ 伊勢現地</p>
            <p className="text-sm text-slate-600">2033年遷宮に向けた550年以上の伝統行事。歴史の当事者に。</p>
          </div>
          <div className="rounded-xl border-2 border-amber-400 p-4">
            <span className="inline-block rounded-full border bg-blue-100 text-blue-800 border-blue-300 px-2 py-0.5 text-xs font-bold mb-2">
              土日開催！
            </span>
            <h3 className="text-base font-bold">夏至祭</h3>
            <p className="text-xs text-slate-500 mb-1">2026年6月20日(土)〜21日(日) ／ 二見興玉神社</p>
            <p className="text-sm text-slate-600">夫婦岩から昇る朝日を浴びながら海で禊。一生忘れない体験。</p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mb-6 rounded-2xl bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900 p-8 text-center text-white">
        <h2 className="mb-3 text-xl font-bold">まとめ — 参拝のポイント</h2>
        <ul className="text-left max-w-lg mx-auto space-y-2 text-sm text-amber-100 mb-5">
          <li>▸ 順番は<strong className="text-amber-300">外宮→内宮</strong>。外宮で「お膳立て」してから主役のもとへ</li>
          <li>▸ 正宮ではまず<strong className="text-amber-300">感謝</strong>。お願いは<strong className="text-amber-300">荒祭宮・多賀宮</strong>で</li>
          <li>▸ 二拝二拍手一拝。参道は正中を避け、鳥居では一礼</li>
          <li>▸ 泊まるなら<strong className="text-amber-300">早朝の内宮</strong>を。静謐な空気は日中とは別世界</li>
        </ul>
        <a
          href="https://www.isetokiwa.jp/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-lg bg-amber-600 px-8 py-3 text-lg font-bold text-white shadow-lg transition hover:bg-amber-500"
        >
          isetokiwa.jp
        </a>
        <p className="mt-4 text-xs text-slate-400">
          &copy; 常磐会（ときわかい）
        </p>
      </section>
    </div>
  );
}

/* ── Ise Okihiki Handout ── */
function IseOkihikiHandout() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10 text-slate-800">
      {/* Hero */}
      <div className="relative mb-10 overflow-hidden rounded-2xl">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/3/39/Hoeisya_of_Okihikigyouji02.jpg"
          alt="お木曳き 奉曳車"
          className="h-56 w-full object-cover sm:h-72"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 p-6 text-white">
          <p className="text-xs tracking-widest text-amber-300 mb-1">
            伊勢神宮基礎講座 第三弾
          </p>
          <h1 className="text-3xl font-bold tracking-wide sm:text-4xl">
            お木曳き完全ガイド
          </h1>
          <p className="mt-1 text-sm text-white/70">
            2033年の式年遷宮へ — いま動き出す
          </p>
        </div>
      </div>

      {/* TOC */}
      <nav className="mb-10 rounded-xl border border-amber-200 bg-amber-50 p-5">
        <h2 className="mb-3 text-sm font-bold text-amber-800 tracking-wide">
          このハンドアウトの内容
        </h2>
        <ol className="grid gap-1 text-sm text-amber-900 sm:grid-cols-2">
          <li>1. お木曳きとは</li>
          <li>2. 川曳と陸曳 — 2つの形式</li>
          <li>3. 2026年スケジュール</li>
          <li>4. 当日の流れ・服装と持ち物</li>
          <li>5. 伊勢音頭</li>
          <li>6. ヒノキの一生と古材リレー</li>
          <li>7. 参加方法</li>
          <li>8. 2026年イベントカレンダー</li>
        </ol>
      </nav>

      {/* ── 1. お木曳きとは ── */}
      <section className="mb-10">
        <h2 className="mb-4 border-b-2 border-amber-600 pb-2 text-xl font-bold">
          1. お木曳きとは
        </h2>
        <p className="mb-3 leading-relaxed">
          お木曳き（おきひき）は、伊勢神宮の<strong>式年遷宮</strong>で使用する
          <strong>御用材（ヒノキ）</strong>を宮域に運び入れる、
          約<strong>550年</strong>の歴史を持つ伝統行事です。
        </p>
        <p className="mb-3 leading-relaxed">
          室町時代に地元の人々が自発的に「お宮のために木を運ぼう」と始めたのが起源。
          やがて伊勢のまち全体を巻き込む一大行事へと発展しました。
          国の<strong>選択無形民俗文化財</strong>にも選ばれています。
        </p>

        <div className="my-5 grid gap-3 sm:grid-cols-3">
          <StatCard label="歴史" value="約550年" />
          <StatCard label="前回参加者（2006年）" value="延べ23万人" />
          <StatCard label="次回遷宮" value="2033年（第63回）" />
        </div>

        <div className="rounded-xl border-l-4 border-amber-600 bg-amber-50 p-4 text-sm">
          <p className="font-bold text-amber-800 mb-1">お木曳きの流れ</p>
          <p className="text-amber-900">
            木曽の御杣山でヒノキを伐採（御杣始祭）→ 伊勢まで運搬 →{" "}
            <strong>最後の区間を人の手で宮域へ運び入れる = お木曳き</strong>
          </p>
        </div>
      </section>

      {/* ── 2. 川曳と陸曳 ── */}
      <section className="mb-10">
        <h2 className="mb-4 border-b-2 border-amber-600 pb-2 text-xl font-bold">
          2. 川曳と陸曳 — 2つの形式
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* 川曳 */}
          <div className="overflow-hidden rounded-xl border">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/d/d1/Kawabiki_at_the_riverside_of_Isuzugawa01.jpg"
              alt="川曳"
              className="h-40 w-full object-cover"
            />
            <div className="p-4">
              <h3 className="mb-2 text-lg font-bold text-blue-800">
                川曳（かわびき）
              </h3>
              <table className="w-full text-sm">
                <tbody>
                  <Tr label="対象" value="内宮の御用材" />
                  <Tr label="方法" value="五十鈴川の水上に木を浮かべ、曳き綱で引く" />
                  <Tr label="服装" value="白装束・法被（川に入る）" />
                  <Tr label="体感" value="禊のような体験。水しぶきを浴びながらの奉仕" />
                  <Tr label="体力" value="★★★（川の中を歩くのはハード）" />
                </tbody>
              </table>
            </div>
          </div>

          {/* 陸曳 */}
          <div className="overflow-hidden rounded-xl border">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/0/0f/Hoeisya_of_Okihikigyouji01.jpg"
              alt="陸曳"
              className="h-40 w-full object-cover"
            />
            <div className="p-4">
              <h3 className="mb-2 text-lg font-bold text-amber-800">
                陸曳（おかびき）
              </h3>
              <table className="w-full text-sm">
                <tbody>
                  <Tr label="対象" value="外宮の御用材" />
                  <Tr label="方法" value="大型の奉曳車に木を載せ、数百人で陸路を曳く" />
                  <Tr label="服装" value="法被・動きやすい服装" />
                  <Tr label="体感" value="伊勢音頭「エンヤー！」の掛け声でまちが一つに" />
                  <Tr label="体力" value="★★（陸路だが炎天下）" />
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. スケジュール ── */}
      <section className="mb-10">
        <h2 className="mb-4 border-b-2 border-amber-600 pb-2 text-xl font-bold">
          3. 2026年スケジュール
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-amber-600 text-left">
                <th className="py-2 pr-4 font-bold">時期</th>
                <th className="py-2 pr-4 font-bold">内容</th>
                <th className="py-2 font-bold">備考</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="py-2 pr-4 font-bold text-amber-700">2026年4月12-13日</td>
                <td className="py-2 pr-4">御木曳初式（役木曳）</td>
                <td className="py-2 text-slate-500">川曳(12日)・陸曳(13日)</td>
              </tr>
              <tr className="border-b border-slate-200 bg-amber-50">
                <td className="py-2 pr-4 font-bold text-amber-700">2026年5月〜8月</td>
                <td className="py-2 pr-4 font-bold">第一次お木曳き</td>
                <td className="py-2 text-slate-500">各地区（奉曳団）が日程を分担</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2 pr-4 font-bold text-amber-700">2027年</td>
                <td className="py-2 pr-4">第二次お木曳き（予定）</td>
                <td className="py-2 text-slate-500">残りの御用材を運搬</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-slate-600">
          <strong>一般参加枠あり</strong> — 地元以外の方も申し込みで参加可能。
          常磐会経由での参加も受付中。
        </p>
      </section>

      {/* ── 4. 当日の流れ ── */}
      <section className="mb-10">
        <h2 className="mb-4 border-b-2 border-amber-600 pb-2 text-xl font-bold">
          4. 当日の流れ・服装と持ち物
        </h2>

        {/* Flow */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-2 text-sm">
          {[
            { n: "1", t: "集合・受付", s: "朝" },
            { n: "2", t: "法被・鉢巻", s: "受取り" },
            { n: "3", t: "出発式", s: "木遣り唄" },
            { n: "4", t: "本曳き", s: "2〜3時間" },
            { n: "5", t: "直会", s: "食事・交流" },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-600 text-white font-bold">
                {step.n}
              </div>
              <div>
                <p className="font-bold text-slate-800">{step.t}</p>
                <p className="text-xs text-slate-500">{step.s}</p>
              </div>
              {i < 4 && <span className="text-amber-400 mx-1">→</span>}
            </div>
          ))}
        </div>

        {/* Checklist */}
        <h3 className="mb-3 text-base font-bold">持ち物チェックリスト</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <ChecklistCard
            title="川曳"
            color="blue"
            items={[
              "濡れてよい服（着替え必須）",
              "ゴム草履 or ウォーターシューズ",
              "ビーサンは脱げるのでNG",
            ]}
          />
          <ChecklistCard
            title="陸曳"
            color="amber"
            items={[
              "動きやすい服装",
              "運動靴",
              "暑さ対策（炎天下）",
            ]}
          />
          <ChecklistCard
            title="共通"
            color="slate"
            items={[
              "タオル・帽子",
              "水筒・日焼け止め",
              "法被は当日貸与",
              "貴重品は最小限に",
            ]}
          />
        </div>
      </section>

      {/* ── 5. 伊勢音頭 ── */}
      <section className="mb-10">
        <h2 className="mb-4 border-b-2 border-amber-600 pb-2 text-xl font-bold">
          5. 伊勢音頭
        </h2>
        <div className="flex items-start gap-4">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/9/95/Enyabiki_of_Okihikigyoji_at_Geku01.jpg"
            alt="エンヤ曳き"
            className="hidden h-32 w-48 rounded-lg object-cover sm:block"
          />
          <div>
            <p className="mb-2 leading-relaxed">
              お木曳きの魂ともいえる<strong>伊勢音頭</strong>。
              先頭の木遣り（きやり）が唄を歌い、全員で
              <strong className="text-amber-700 text-lg">「エンヤー！」</strong>
              と掛け声を返しながら綱を引きます。
            </p>
            <p className="mb-2 leading-relaxed">
              この伊勢音頭は<strong>京都をどりの発祥</strong>とも言われ、
              江戸時代には「伊勢は津でもつ、津は伊勢でもつ」と東海道を行く旅人の間で大流行しました。
            </p>
            <p className="leading-relaxed">
              式年遷宮の技術が「身体知」で受け継がれてきたように、
              伊勢音頭もまた<strong>550年間歌い継がれてきた「声のリレー」</strong>です。
            </p>
          </div>
        </div>
      </section>

      {/* ── 6. ヒノキの一生・古材リレー ── */}
      <section className="mb-10">
        <h2 className="mb-4 border-b-2 border-amber-600 pb-2 text-xl font-bold">
          6. ヒノキの一生と古材リレー
        </h2>
        <p className="mb-3 leading-relaxed">
          御用材は<strong>木曽（長野県）の御杣山（みそまやま）</strong>から。
          樹齢<strong>200〜300年</strong>のヒノキが選ばれます。
          最初の一本を伐採する神事が<strong>御杣始祭（みそまはじめさい）</strong>です。
        </p>

        <div className="my-5 rounded-xl border-l-4 border-amber-600 bg-amber-50 p-4">
          <p className="mb-2 text-sm font-bold text-amber-800">
            古材の壮大なリレー — 伊勢神宮の木材は一切捨てない
          </p>
          <div className="flex flex-wrap items-center gap-2 text-sm text-amber-900">
            <span className="rounded bg-amber-200 px-2 py-0.5 font-bold">お木曳き</span>
            <span className="text-amber-500">→</span>
            <span>正殿で <strong>20年</strong></span>
            <span className="text-amber-500">→</span>
            <span>宇治橋の鳥居で <strong>+20年</strong></span>
            <span className="text-amber-500">→</span>
            <span>関の追分・七里の渡の鳥居で <strong>+20年</strong></span>
            <span className="text-amber-500">→</span>
            <span>全国の神社の建替え・修復へ</span>
          </div>
          <p className="mt-2 text-sm font-bold text-amber-800">
            1本の柱が60年以上、木材全体では100〜200年にわたり使い続けられます。
          </p>
        </div>

        <div className="rounded-xl bg-slate-900 p-5 text-center text-white">
          <p className="text-lg font-bold text-amber-300">
            自分が曳いた木が、60年後もどこかで生き続ける。
          </p>
          <p className="mt-1 text-sm text-slate-400">
            お木曳きはこのリレーの「出発点」です。
          </p>
        </div>
      </section>

      {/* ── 7. 参加方法 ── */}
      <section className="mb-10">
        <h2 className="mb-4 border-b-2 border-amber-600 pb-2 text-xl font-bold">
          7. 参加方法
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border-2 border-amber-600 p-5">
            <p className="mb-1 text-xs font-bold text-amber-600">おすすめ</p>
            <h3 className="mb-2 text-lg font-bold">常磐会経由</h3>
            <ul className="space-y-1 text-sm">
              <li>仲間と一緒に参加できる</li>
              <li>ガイド・サポート付きで安心</li>
              <li>宿泊手配のお手伝いも</li>
              <li className="font-bold text-amber-700">初めてでも大丈夫</li>
            </ul>
          </div>
          <div className="rounded-xl border p-5">
            <h3 className="mb-2 text-lg font-bold">一般参加枠</h3>
            <ul className="space-y-1 text-sm">
              <li>伊勢市が用意する申込制の枠</li>
              <li>全国どこからでも参加可能</li>
              <li>個人での参加</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 text-sm text-slate-600">
          <p>
            <strong>事前準備:</strong> 川曳は特に体力が要ります。普段から歩く習慣をつけておきましょう。
          </p>
          <p className="mt-1">
            <strong>宿泊:</strong> お木曳きの時期は伊勢市内のホテルが混みます。早めの予約を。
          </p>
        </div>
      </section>

      {/* ── 8. イベントカレンダー ── */}
      <section className="mb-10">
        <h2 className="mb-4 border-b-2 border-amber-600 pb-2 text-xl font-bold">
          8. 2026年 伊勢イベントカレンダー
        </h2>
        <div className="space-y-3">
          <EventCard
            badge="今年の目玉"
            badgeColor="amber"
            title="お木曳き（第一次）"
            date="2026年5月〜8月"
            place="伊勢現地"
            desc="550年以上の伝統行事。遷宮の「始まり」を自分の手で体感。川曳と陸曳の2形式。"
          />
          <EventCard
            badge="土日開催！"
            badgeColor="blue"
            title="夏至祭"
            date="2026年6月20日(土)〜21日(日)"
            place="二見興玉神社"
            desc="夫婦岩の前で朝日を浴びながら海で禊。お木曳きとのセット参加がおすすめ。"
          />
          <EventCard
            badge="入門"
            badgeColor="green"
            title="朔日餅を楽しむ会"
            date="毎月2日"
            place="東京都内"
            desc="伊勢の朔日参りの文化を東京で味わう交流会。まずはここから。"
          />
          <EventCard
            badge="じっくり体験"
            badgeColor="green"
            title="リアル伊勢ツアー"
            date="不定期"
            place="伊勢現地"
            desc="ガイド付きの参拝体験。第二弾「参拝ガイド」の内容を現地で。"
          />
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mb-6 rounded-2xl bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900 p-8 text-center text-white">
        <h2 className="mb-2 text-2xl font-bold">一緒に木を曳こう</h2>
        <p className="mb-5 text-sm text-amber-200">
          2033年の遷宮へ — いま動き出す
        </p>
        <a
          href="https://www.isetokiwa.jp/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-lg bg-amber-600 px-8 py-3 text-lg font-bold text-white shadow-lg transition hover:bg-amber-500"
        >
          isetokiwa.jp
        </a>
        <p className="mt-4 text-xs text-slate-400">
          &copy; 常磐会（ときわかい）
        </p>
      </section>

      {/* ── Credits ── */}
      <footer className="border-t pt-6 text-xs text-slate-400">
        <p className="font-bold text-slate-500 mb-2">写真クレジット</p>
        <p>お木曳き行事（奉曳車・エンヤ曳き・川曳・陸曳・お木曳初式） — Wikimedia Commons / CC BY-SA 3.0</p>
        <p>宇治橋・夫婦岩 — Wikimedia Commons / CC BY-SA 3.0</p>
      </footer>
    </div>
  );
}

/* ── Sub-components ── */

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-white p-4 text-center shadow-sm">
      <p className="text-2xl font-bold text-amber-700">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  );
}

function Tr({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-b border-slate-100">
      <td className="py-1.5 pr-3 font-bold text-slate-600 whitespace-nowrap align-top">
        {label}
      </td>
      <td className="py-1.5 text-slate-700">{value}</td>
    </tr>
  );
}

function ChecklistCard({
  title,
  color,
  items,
}: {
  title: string;
  color: string;
  items: string[];
}) {
  const borderColor =
    color === "blue"
      ? "border-blue-300"
      : color === "amber"
        ? "border-amber-300"
        : "border-slate-300";
  const headColor =
    color === "blue"
      ? "text-blue-800"
      : color === "amber"
        ? "text-amber-800"
        : "text-slate-800";
  return (
    <div className={`rounded-xl border ${borderColor} p-4`}>
      <h4 className={`mb-2 font-bold ${headColor}`}>{title}</h4>
      <ul className="space-y-1 text-sm">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-0.5 text-amber-600">&#9745;</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EventCard({
  badge,
  badgeColor,
  title,
  date,
  place,
  desc,
}: {
  badge: string;
  badgeColor: string;
  title: string;
  date: string;
  place: string;
  desc: string;
}) {
  const bg =
    badgeColor === "amber"
      ? "bg-amber-100 text-amber-800 border-amber-300"
      : badgeColor === "blue"
        ? "bg-blue-100 text-blue-800 border-blue-300"
        : "bg-green-100 text-green-800 border-green-300";
  const borderClass =
    badgeColor === "amber" ? "border-amber-400" : "border-slate-200";
  return (
    <div className={`rounded-xl border ${borderClass} p-4`}>
      <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-bold ${bg} mb-2`}>
        {badge}
      </span>
      <h3 className="text-base font-bold">{title}</h3>
      <p className="text-xs text-slate-500 mb-1">
        {date} ／ {place}
      </p>
      <p className="text-sm text-slate-600">{desc}</p>
    </div>
  );
}

/* ── Fallback for other decks ── */
function GenericHandout({ title, description }: { title: string; description: string }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20 text-center text-slate-600">
      <h1 className="mb-4 text-2xl font-bold text-slate-800">{title}</h1>
      <p className="mb-6">{description}</p>
      <p className="text-sm text-slate-400">
        このデッキのハンドアウトはまだ作成されていません。
      </p>
    </div>
  );
}

/* ── Main page ── */
export default async function HandoutPage({
  params,
}: {
  params: Promise<{ deck: string }>;
}) {
  const { deck: slug } = await params;
  const deck = getDeck(slug);
  if (!deck) notFound();

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b bg-white px-6 py-3 text-sm text-slate-500 shadow-sm print:hidden">
        <Link
          href={`/slides/${deck.slug}`}
          className="hover:text-slate-800 transition-colors"
        >
          ← スライドに戻る
        </Link>
        <span className="font-bold text-slate-800">{deck.title}</span>
        <span className="text-xs text-slate-400">ハンドアウト</span>
      </div>

      {slug === "ise-vol2" ? (
        <IseVol2Handout />
      ) : slug === "ise-okihiki" ? (
        <IseOkihikiHandout />
      ) : (
        <GenericHandout title={deck.title} description={deck.description} />
      )}
    </div>
  );
}
