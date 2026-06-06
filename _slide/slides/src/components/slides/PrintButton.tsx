"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded bg-white/10 px-3 py-1 hover:bg-white/20 transition-colors"
    >
      Print / PDF
    </button>
  );
}
