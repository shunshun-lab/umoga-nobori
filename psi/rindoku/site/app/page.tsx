import { getAllDocs, getProblemSetGroups } from "@/lib/content";
import Link from "next/link";

export default function Home() {
  const docs = getAllDocs();
  const notes = docs.filter((d) => d.section === "notes");
  const notebook = docs.filter((d) => d.section === "notebook");
  const psGroups = getProblemSetGroups();

  return (
    <div className="mx-auto w-full max-w-xl flex-1 px-4 py-8 pb-28 sm:max-w-lg sm:px-6">
      <header className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          輪読ノート
        </h1>
        <p className="mt-2 text-[1.05rem] leading-relaxed text-zinc-600 dark:text-zinc-400">
          CSE（Gilbert Strang）のメモ・単語帳・日次ノート。モバイル向けに読みやすく表示します。
        </p>
      </header>

      <Section title="notes" items={notes} />
      <Section title="notebook" items={notebook} className="mt-10" />

      {/* Problem Sets */}
      <section className="mt-10">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          problem sets
        </h2>
        <ul className="space-y-0 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white dark:divide-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/50">
          {psGroups.map((g) => (
            <li key={g.chapter}>
              <div className="px-4 py-3">
                <div className="text-[1.05rem] font-medium text-zinc-900 dark:text-zinc-100">
                  Ch{g.chapter}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {g.selected && (
                    <Link
                      href={g.selected.href}
                      className="inline-flex items-center rounded-md bg-teal-50 px-2.5 py-1 text-sm font-medium text-teal-700 ring-1 ring-teal-200/60 active:bg-teal-100 dark:bg-teal-900/30 dark:text-teal-300 dark:ring-teal-700/50"
                    >
                      選定問題
                    </Link>
                  )}
                  {g.answers.map((a) => (
                    <Link
                      key={a.slug}
                      href={a.href}
                      className="inline-flex items-center rounded-md bg-zinc-100 px-2.5 py-1 text-sm text-zinc-600 ring-1 ring-zinc-200/60 active:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700/50"
                    >
                      {a.slug.replace(/^ch\d+_?/, "").replace(/_/g, " ") || "全問解答"}
                    </Link>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Section({
  title,
  items,
  className = "",
}: {
  title: string;
  items: { href: string; title: string; slug: string }[];
  className?: string;
}) {
  return (
    <section className={className}>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        {title}
      </h2>
      <ul className="space-y-0 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white dark:divide-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/50">
        {items.length === 0 ? (
          <li className="px-4 py-6 text-zinc-500">（まだありません）</li>
        ) : (
          items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex min-h-[3rem] items-center px-4 py-3 text-[1.05rem] text-teal-800 active:bg-zinc-50 dark:text-teal-300 dark:active:bg-zinc-800/60"
              >
                <span className="leading-snug">{item.title}</span>
              </Link>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
