import { OsStatus } from "./_components/OsStatus";
import { AudioToggle } from "./_components/AudioToggle";
import { ForestMap } from "./_components/ForestMap";
import { WeatherBadge } from "./_components/WeatherBadge";

async function fetchWeather() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/weather`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return { description: "weather unavailable", temperatureC: null as number | null };
    }
    return (await res.json()) as { description: string; temperatureC: number | null };
  } catch {
    return { description: "weather unavailable", temperatureC: null as number | null };
  }
}

export default async function IntroductionMapPage() {
  const weather = await fetchWeather();

  return (
    <div className="bg-slate-950 text-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 lg:py-10">
        {/* HERO / ベルーフ */}
        <section id="belief" className="space-y-4 lg:space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <p className="inline-flex items-center text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-400/40 rounded-full px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 mr-2" />
              人とエネルギーのための OS をつくる
            </p>
            <WeatherBadge
              description={weather.description}
              temperatureC={weather.temperatureC}
            />
            <AudioToggle />
          </div>
          <h1 className="max-w-3xl text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight">
            日本の国力を上げるのは、
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-cyan-300">
              制度ではなく「人とエネルギー」
            </span>
            だと信じている。
          </h1>
          <p className="max-w-3xl text-sm sm:text-base text-slate-200 leading-relaxed">
            その人とエネルギーが長期で循環するように、
            コミュニティ・システム・メディア・プロダクトを編んでいく。
            このページは、そのための「森の地図」です。
          </p>
        </section>

        {/* OS ステータス + 森マップ */}
        <section id="narrative" className="space-y-4 lg:space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold tracking-wide text-emerald-300">
                01. 森を俯瞰する
              </p>
              <p className="max-w-xl text-xs sm:text-sm text-slate-300">
                上に伸びているのは 10〜30 年スパンの OS。下から生えてくる芽や花は、
                1 日〜数ヶ月の実験やイベントです。横にスクロールしながら、
                自分の興味の近いところから触ってみてください。
              </p>
            </div>
            <OsStatus />
          </div>
          <ForestMap />
        </section>

        {/* いまやっていること / プロジェクトへの導線 */}
        <section id="projects" className="space-y-3 lg:space-y-4">
          <p className="text-xs font-semibold tracking-wide text-emerald-300">
            02. いま、どの木を育てているか
          </p>
          <p className="max-w-3xl text-xs sm:text-sm text-slate-300">
            詳しい説明は、それぞれのページにまとめています。
            森の中で気になった木や花があれば、対応するリンクから奥へ潜ってもらえると嬉しいです。
          </p>
          <div className="grid gap-3 text-xs sm:text-sm text-slate-200 md:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
              <p className="text-[11px] font-semibold text-emerald-300">JXC</p>
              <p>若者と社会のフチをつなぐ実践コミュニティ。ツアーとメディアの交差点。</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
              <p className="text-[11px] font-semibold text-emerald-300">伊勢・常若</p>
              <p>式年遷宮や朔日餅など、「身体でわかる学び」と長期コミュニティの場づくり。</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
              <p className="text-[11px] font-semibold text-emerald-300">Minerva × 地域共創</p>
              <p>ミネルバ大学の学生と地域をつなぐ 12 週間のフィールドインターン。</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
              <p className="text-[11px] font-semibold text-emerald-300">DAO × AI Deep Tech Lab</p>
              <p>DAO × AI のディープテックを、日本語教材と学習プロダクトに変換するラボ。</p>
            </div>
          </div>
        </section>

        {/* 連絡 */}
        <section id="contact" className="space-y-3 border-t border-slate-800 pt-6">
          <p className="text-xs font-semibold tracking-wide text-emerald-300">
            03. どこかで交差したい人へ
          </p>
          <p className="max-w-3xl text-xs sm:text-sm text-slate-300">
            「どの木が自分に近いかまだ分からない」「まずは話してみたい」という段階でも大丈夫です。
            JXC / 伊勢 / Minerva / DAO×AI のどこかに関心があれば、ゆるく一度オンラインでお話しできると嬉しいです。
          </p>
          <p className="text-[11px] text-slate-500">
            ※ 実運用に合わせて、フォーム URL や X アカウント、メールアドレスなどをここに追記してください。
          </p>
        </section>
      </div>
    </div>
  );
}
