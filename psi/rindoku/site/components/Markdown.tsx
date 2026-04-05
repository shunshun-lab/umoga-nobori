import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import type { Components } from "react-markdown";
import { linkifyDocRefs } from "@/lib/linkifyDocRefs";

const katexOptions = {
  strict: false,
  throwOnError: false,
  output: "html" as const,
};

function createComponents(variant: "default" | "notebook" | "problemset"): Components {
  const hrNotebook =
    "my-10 border-0 border-t-2 border-dashed border-zinc-300/90 dark:border-zinc-600/80";
  const hrDefault =
    "my-8 border-0 border-t border-zinc-200 dark:border-zinc-700";
  const hrProblemset =
    "my-8 border-0 border-t-2 border-dashed border-zinc-300/80 dark:border-zinc-600/70";

  return {
    hr: ({ ...props }) => (
      <hr
        className={
          variant === "notebook"
            ? hrNotebook
            : variant === "problemset"
              ? hrProblemset
              : hrDefault
        }
        {...props}
      />
    ),
    table: ({ children, ...props }) => (
      <div className="my-4 overflow-x-auto rounded-lg border border-zinc-200/80 dark:border-zinc-700/80">
        <table className="min-w-max w-full text-left text-sm" {...props}>
          {children}
        </table>
      </div>
    ),
    pre: ({ children, ...props }) => (
      <pre
        className={[
          "my-4 overflow-x-auto rounded-lg p-3 leading-relaxed",
          variant === "notebook"
            ? "bg-zinc-50 text-[0.8rem] sm:text-[0.85rem] dark:bg-zinc-900/80"
            : "bg-zinc-100 text-[0.85rem] dark:bg-zinc-900",
        ].join(" ")}
        {...props}
      >
        {children}
      </pre>
    ),
    code: ({ className, children, ...props }) => {
      const isBlock = Boolean(className?.includes("language-"));
      if (isBlock) {
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      }
      return (
        <code
          className="rounded bg-zinc-100 px-1 py-0.5 text-[0.9em] dark:bg-zinc-800"
          {...props}
        >
          {children}
        </code>
      );
    },
    a: ({ href, children, ...props }) => (
      <a
        href={href}
        className="break-words text-teal-700 underline decoration-teal-700/40 underline-offset-2 hover:decoration-teal-700 dark:text-teal-400 dark:decoration-teal-400/40"
        target={href?.startsWith("http") ? "_blank" : undefined}
        rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
        {...props}
      >
        {children}
      </a>
    ),
  };
}

export function Markdown({
  source,
  variant = "default",
}: {
  source: string;
  variant?: "default" | "notebook" | "problemset";
}) {
  const md =
    variant === "notebook" ? linkifyDocRefs(source) : source;
  const components = createComponents(variant);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, [remarkMath, { singleDollarTextMath: true }]]}
      rehypePlugins={[[rehypeKatex, katexOptions]]}
      components={components}
    >
      {md}
    </ReactMarkdown>
  );
}
