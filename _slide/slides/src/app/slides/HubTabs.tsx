"use client";

import { useRouter, useSearchParams } from "next/navigation";

const tabs = [
  { key: "library", label: "Library" },
  { key: "expanded", label: "All Slides" },
] as const;

export function HubTabs({ current }: { current: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function switchView(view: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (view === "library") {
      params.delete("view");
    } else {
      params.set("view", view);
    }
    const qs = params.toString();
    router.push(`/slides${qs ? `?${qs}` : ""}`);
  }

  return (
    <div className="mb-8 flex gap-1 rounded-lg bg-white/5 p-1 w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => switchView(tab.key)}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            current === tab.key
              ? "bg-white/10 text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
