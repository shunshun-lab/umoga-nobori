"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DeckData } from "./types";
import { SlideRenderer } from "./SlideRenderer";
import Link from "next/link";

export function Deck({ deck }: { deck: DeckData }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const total = deck.slides.length;

  const goTo = useCallback(
    (next: number) => {
      if (next === index || next < 0 || next >= total) return;
      setVisible(false);
      setTimeout(() => {
        setIndex(next);
        setVisible(true);
      }, 250);
    },
    [index, total],
  );

  const go = useCallback((dir: number) => goTo(index + dir), [goTo, index]);

  /* Touch swipe */
  const touchX = useRef(0);
  function onTouchStart(e: React.TouchEvent) {
    touchX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (dx < -50) go(1);
    else if (dx > 50) go(-1);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "Home") {
        e.preventDefault();
        goTo(0);
      } else if (e.key === "End") {
        e.preventDefault();
        goTo(total - 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, goTo, total]);

  const slide = deck.slides[index];
  const progress = ((index + 1) / total) * 100;

  return (
    <div
      className="flex h-dvh w-dvw flex-col overflow-hidden bg-black"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/*
        Desktop: 16:9 centered in viewport
        Mobile portrait: full-width, scrollable if content overflows
      */}
      <div className="flex flex-1 items-center justify-center overflow-hidden pb-9">
        <div
          className={[
            // Mobile: full width, fixed height
            "w-full h-[calc(100dvh-2.25rem)]",
            // Desktop: fixed 16:9 box that fills viewport height
            "sm:h-[calc(100dvh-2.25rem)] sm:w-[calc((100dvh-2.25rem)*16/9)] sm:max-w-full",
          ].join(" ")}
          style={{
            opacity: visible ? 1 : 0,
            transition: "opacity 0.25s ease",
          }}
        >
          <SlideRenderer slide={slide} theme={deck.theme} />
        </div>
      </div>

      {/* Page number – desktop only, mobile shows in nav */}
      <div
        className="pointer-events-none fixed bottom-10 right-4 z-40 text-[10px] tabular-nums hidden sm:block"
        style={{ color: deck.theme.muted }}
      >
        {index + 1} / {total}
      </div>

      {/* Progress bar */}
      <div
        className="fixed bottom-8 left-0 z-50 h-[3px]"
        style={{
          width: `${progress}%`,
          background: `linear-gradient(90deg, ${deck.theme.brand}, ${deck.theme.accent})`,
          transition: "width 0.4s ease",
        }}
      />

      {/* Nav bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between bg-black/80 backdrop-blur px-4 py-2 text-xs text-slate-400">
        <Link href="/slides" className="hover:text-white transition-colors shrink-0">
          ← Back
        </Link>
        <span className="font-medium text-slate-300 truncate mx-2">{deck.title}</span>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href={`/slides/${deck.slug}/print`}
            className="hover:text-white transition-colors hidden sm:inline"
          >
            Print
          </Link>
          <button
            onClick={() => go(-1)}
            disabled={index === 0}
            className="disabled:opacity-30 hover:text-white transition-colors"
          >
            ‹
          </button>
          <span className="tabular-nums">{index + 1}/{total}</span>
          <button
            onClick={() => go(1)}
            disabled={index === total - 1}
            className="disabled:opacity-30 hover:text-white transition-colors"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
