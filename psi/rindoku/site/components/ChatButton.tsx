"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function ChatButton() {
  const pathname = usePathname();
  if (pathname === "/chat") return null;

  return (
    <Link
      href="/chat"
      aria-label="チャットで質問"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-teal-600 text-white shadow-lg shadow-teal-600/25 transition-transform hover:scale-105 active:scale-95 dark:bg-teal-700 dark:shadow-teal-700/20 supports-[padding:max(0px)]:bottom-[max(1.5rem,calc(env(safe-area-inset-bottom)+0.5rem))]"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    </Link>
  );
}
