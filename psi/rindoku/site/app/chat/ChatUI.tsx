"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect, useMemo } from "react";
import { Markdown } from "@/components/Markdown";

type ChapterInfo = { chapter: number; title: string };

type Shortcut = { label: string; prompt: string; chapter: number | null };

const SHORTCUTS: Shortcut[] = [
  { label: "Intro", prompt: "Introductionの要点を教えて", chapter: null },
  { label: "Ch1", prompt: "Chapter 1 Applied Linear Algebraの要点を教えて", chapter: 1 },
  { label: "Ch2", prompt: "Chapter 2 A Framework for Applied Mathematicsの要点を教えて", chapter: 2 },
  { label: "Ch3", prompt: "Chapter 3 Boundary Value Problemsの要点を教えて", chapter: 3 },
  { label: "Ch4", prompt: "Chapter 4 Fourier Series and Integralsの要点を教えて", chapter: 4 },
  { label: "Ch5", prompt: "Chapter 5 Analytic Functionsの要点を教えて", chapter: 5 },
  { label: "Ch6", prompt: "Chapter 6 Initial Value Problemsの要点を教えて", chapter: 6 },
  { label: "Ch7", prompt: "Chapter 7 Solving Large Systemsの要点を教えて", chapter: 7 },
  { label: "Ch8", prompt: "Chapter 8 Optimization and Minimum Principlesの要点を教えて", chapter: 8 },
  { label: "単語帳", prompt: "重要な用語をまとめて教えて", chapter: null },
  { label: "アルゴリズム", prompt: "主要なアルゴリズムの一覧と関係を教えて", chapter: null },
];

export default function ChatUI({ chapters }: { chapters: ChapterInfo[] }) {
  const [input, setInput] = useState("");
  const [chapter, setChapter] = useState<number | null>(1);
  const bottomRef = useRef<HTMLDivElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { chapter },
      }),
    [chapter]
  );

  const { messages, sendMessage, status } = useChat({ transport });

  const isLoading = status === "submitted" || status === "streaming";

  const handleShortcut = (sc: Shortcut) => {
    if (isLoading) return;
    if (sc.chapter !== null) setChapter(sc.chapter);
    sendMessage({ text: sc.prompt });
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-[calc(100dvh-3rem)] flex-col">
      {/* Chapter selector */}
      <div className="sticky top-0 z-10 border-b border-zinc-200/80 bg-white/95 px-4 py-2 backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-950/95">
        <select
          value={chapter ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            setChapter(v ? parseInt(v, 10) : null);
          }}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        >
          <option value="">全般（章を選択しない）</option>
          {chapters.map((c) => (
            <option key={c.chapter} value={c.chapter}>
              Ch{c.chapter}: {c.title}
            </option>
          ))}
        </select>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-6">
            <div className="text-center text-zinc-400 dark:text-zinc-500">
              <p className="text-lg font-medium">
                章を選んで質問してください
              </p>
              <p className="mt-2 text-sm">
                ノートと問題集の内容に基づいて回答します
              </p>
            </div>
            <div className="flex max-w-md flex-wrap justify-center gap-2">
              {SHORTCUTS.map((sc) => (
                <button
                  key={sc.label}
                  type="button"
                  onClick={() => handleShortcut(sc)}
                  disabled={isLoading}
                  className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 transition-colors hover:border-teal-400 hover:bg-teal-50 hover:text-teal-700 active:bg-teal-100 disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-teal-600 dark:hover:bg-teal-900/30 dark:hover:text-teal-300"
                >
                  {sc.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mx-auto max-w-2xl space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={
                message.role === "user"
                  ? "flex justify-end"
                  : "flex justify-start"
              }
            >
              <div
                className={
                  message.role === "user"
                    ? "max-w-[85%] rounded-2xl rounded-br-md bg-teal-600 px-4 py-2.5 text-[0.95rem] text-white"
                    : "max-w-[95%] rounded-2xl rounded-bl-md bg-zinc-100 px-4 py-3 dark:bg-zinc-800/80"
                }
              >
                {message.parts.map((part, i) => {
                  if (part.type === "text") {
                    if (message.role === "user") {
                      return (
                        <span key={`${message.id}-${i}`} className="whitespace-pre-wrap">
                          {part.text}
                        </span>
                      );
                    }
                    return (
                      <div
                        key={`${message.id}-${i}`}
                        className="prose prose-sm prose-zinc max-w-none dark:prose-invert prose-p:my-1.5 prose-p:leading-relaxed prose-headings:mt-3 prose-headings:mb-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-pre:my-2 prose-pre:text-xs"
                      >
                        <Markdown source={part.text} variant="default" />
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          ))}

          {status === "submitted" && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-md bg-zinc-100 px-4 py-3 dark:bg-zinc-800/80">
                <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                  <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-teal-500" />
                  考え中...
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-zinc-200/80 bg-white px-4 py-3 dark:border-zinc-800/80 dark:bg-zinc-950 supports-[padding:max(0px)]:pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!input.trim() || isLoading) return;
            sendMessage({ text: input.trim() });
            setInput("");
          }}
          className="mx-auto flex max-w-2xl gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            placeholder="質問を入力..."
            disabled={isLoading}
            className="min-w-0 flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-[0.95rem] outline-none transition-colors placeholder:text-zinc-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-teal-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white transition-colors hover:bg-teal-700 active:bg-teal-800 disabled:opacity-40 dark:bg-teal-700 dark:hover:bg-teal-600"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
