import { Markdown } from "@/components/Markdown";
import { getAllDocSlugs, getDoc } from "@/lib/content";
import Link from "next/link";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return getAllDocSlugs();
}

type Props = { params: Promise<{ slug?: string[] }> };

export default async function DocPage({ params }: Props) {
  const { slug: parts } = await params;
  if (!parts || parts.length !== 2) notFound();
  const [section, slug] = parts;
  const doc = getDoc(section, slug);
  if (!doc) notFound();

  const isNotebook = section === "notebook";
  const isProblemset = section === "problemsets";

  const proseExtra = isNotebook
    ? [
        "prose-h2:mt-12 prose-h2:mb-3 prose-h2:border-b prose-h2:border-zinc-200 prose-h2:pb-2 dark:prose-h2:border-zinc-700",
        "prose-h3:mt-8 prose-h3:mb-2",
        "prose-blockquote:rounded-r-md prose-blockquote:border-l-4 prose-blockquote:border-teal-500/70 prose-blockquote:bg-zinc-50 prose-blockquote:py-2 prose-blockquote:pr-4 prose-blockquote:not-italic dark:prose-blockquote:bg-zinc-900/45",
        "[&_h1:nth-of-type(2)]:mt-14 [&_h1:nth-of-type(2)]:border-t [&_h1:nth-of-type(2)]:border-zinc-200 [&_h1:nth-of-type(2)]:pt-8 [&_h1:nth-of-type(2)]:text-base [&_h1:nth-of-type(2)]:font-medium [&_h1:nth-of-type(2)]:text-zinc-500 dark:[&_h1:nth-of-type(2)]:border-zinc-700 dark:[&_h1:nth-of-type(2)]:text-zinc-400",
        "[&_h1:nth-of-type(n+3)]:mt-8 [&_h1:nth-of-type(n+3)]:text-xl",
      ].join(" ")
    : isProblemset
      ? [
          // Problem set 用の特別スタイル: 問題ごとにカード風区切り
          "prose-h2:mt-10 prose-h2:mb-3 prose-h2:scroll-mt-20 prose-h2:rounded-lg prose-h2:bg-teal-50 prose-h2:px-3 prose-h2:py-2 prose-h2:text-base prose-h2:font-semibold prose-h2:text-teal-900 dark:prose-h2:bg-teal-900/30 dark:prose-h2:text-teal-200",
          "prose-h3:mt-6 prose-h3:mb-2",
          // 問題 bold styling
          "[&_strong]:text-zinc-800 dark:[&_strong]:text-zinc-200",
          // 核心 highlight
          "prose-blockquote:rounded-r-md prose-blockquote:border-l-4 prose-blockquote:border-amber-400/80 prose-blockquote:bg-amber-50/70 prose-blockquote:py-2 prose-blockquote:pr-4 prose-blockquote:not-italic dark:prose-blockquote:border-amber-500/60 dark:prose-blockquote:bg-amber-900/20",
          // hrを問題区切りとして強調
          "prose-hr:my-8 prose-hr:border-t-2 prose-hr:border-dashed prose-hr:border-zinc-300/80 dark:prose-hr:border-zinc-600/70",
        ].join(" ")
      : "";

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 pb-24 sm:px-6">
      <nav className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/" className="hover:text-zinc-800 dark:hover:text-zinc-200">
          ホーム
        </Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-700 dark:text-zinc-300">{section}</span>
      </nav>
      <article
        className={[
          "prose prose-zinc max-w-none dark:prose-invert",
          "prose-headings:scroll-mt-20 prose-headings:font-semibold",
          "prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg",
          "prose-p:text-[1.05rem] prose-p:leading-relaxed sm:prose-p:text-[1.0625rem]",
          "prose-li:leading-relaxed",
          "prose-ul:my-3 prose-ol:my-3",
          "prose-th:bg-zinc-100/90 prose-th:px-3 prose-th:py-2 dark:prose-th:bg-zinc-800/80",
          "prose-td:px-3 prose-td:py-2",
          proseExtra,
        ].join(" ")}
      >
        <Markdown
          source={doc.content}
          variant={isNotebook ? "notebook" : isProblemset ? "problemset" : "default"}
        />
      </article>
    </div>
  );
}

export async function generateMetadata({ params }: Props) {
  const { slug: parts } = await params;
  if (!parts || parts.length !== 2) return { title: "Not found" };
  const doc = getDoc(parts[0], parts[1]);
  if (!doc) return { title: "Not found" };
  return { title: doc.title };
}
