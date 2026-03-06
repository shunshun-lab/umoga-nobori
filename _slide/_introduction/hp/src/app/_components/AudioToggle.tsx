"use client";

import { useEffect, useRef, useState } from "react";

const AUDIO_SRC =
  process.env.NEXT_PUBLIC_INTRO_MUSIC_URL ??
  ""; // 後で好きな曲のURLをここ（env）に設定

export function AudioToggle() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!AUDIO_SRC) return;
    const audio = new Audio(AUDIO_SRC);
    audio.loop = true;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  const handleToggle = async () => {
    if (!audioRef.current) {
      return;
    }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch {
        // ブラウザの自動再生制限などで失敗したら黙っておく
      }
    }
  };

  if (!AUDIO_SRC) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="pointer-events-auto inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-[11px] font-medium text-slate-100 hover:border-emerald-400/60 hover:text-emerald-300 transition-colors"
    >
      <span
        className={
          isPlaying
            ? "h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse"
            : "h-1.5 w-1.5 rounded-full bg-slate-500"
        }
      />
      {isPlaying ? "Music: Stop" : "Music: Start"}
    </button>
  );
}

