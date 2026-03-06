"use client";

import { useMemo, useState } from "react";

type Depth = "long" | "mid" | "short";
type Involvement = "owner" | "ally" | "idea";

type Node = {
  id: string;
  label: string;
  depth: Depth;
  involvement: Involvement;
  x: number; // 0-100
  y: number; // 0-100
  summary: string;
};

const NODES: Node[] = [
  {
    id: "people-os",
    label: "People OS",
    depth: "long",
    involvement: "owner",
    x: 15,
    y: 10,
    summary: "人と人が長期で行き来できる土壌をどうつくるか、という10〜30年の問い。",
  },
  {
    id: "energy-os",
    label: "Energy OS",
    depth: "long",
    involvement: "owner",
    x: 55,
    y: 8,
    summary: "挑戦と物語のエネルギーを、無理なく循環させるための哲学とOS。",
  },
  {
    id: "system-os",
    label: "System / Infra OS",
    depth: "long",
    involvement: "owner",
    x: 85,
    y: 14,
    summary: "DAO・AI・プロトコルなど、基盤としてのインフラづくり。",
  },
  {
    id: "jxc",
    label: "JXC",
    depth: "mid",
    involvement: "owner",
    x: 35,
    y: 40,
    summary: "若者と社会のフチをつなぐ実践コミュニティ。ツアーとメディアの交差点。",
  },
  {
    id: "ise",
    label: "伊勢・常若",
    depth: "mid",
    involvement: "ally",
    x: 75,
    y: 45,
    summary: "式年遷宮を軸にした、身体でわかる学びと長期コミュニティの場づくり。",
  },
  {
    id: "minerva",
    label: "Minerva × 地域共創",
    depth: "mid",
    involvement: "ally",
    x: 50,
    y: 55,
    summary: "グローバルな学生とローカルプレイヤーをつなぐ12週間のインターン。",
  },
  {
    id: "daoai",
    label: "DAO × AI Deep Tech Lab",
    depth: "mid",
    involvement: "owner",
    x: 20,
    y: 55,
    summary: "DAO × AI のディープテックを、日本語教材とプロダクトに変換するラボ。",
  },
  {
    id: "tour-experiment",
    label: "ツアー実験群",
    depth: "short",
    involvement: "ally",
    x: 70,
    y: 80,
    summary: "1日〜数日のツアーやイベント。木の先端に咲く花や、飛び立つ種たち。",
  },
  {
    id: "media-experiment",
    label: "メディア・ZINE",
    depth: "short",
    involvement: "owner",
    x: 35,
    y: 78,
    summary: "記事・ZINE・書籍など、物語をかたちにして残すアウトプット群。",
  },
  {
    id: "tool-experiment",
    label: "小さなプロダクト実験",
    depth: "short",
    involvement: "idea",
    x: 10,
    y: 85,
    summary: "短いスプリントでつくっては試す、DAO / AI ツールやダッシュボードたち。",
  },
];

function depthToClasses(depth: Depth) {
  switch (depth) {
    case "long":
      return "h-32 w-32 bg-gradient-to-t from-emerald-700/70 via-emerald-500/40 to-emerald-300/20 shadow-2xl shadow-emerald-900/60";
    case "mid":
      return "h-20 w-20 bg-gradient-to-t from-emerald-700/60 via-emerald-500/40 to-emerald-300/10 shadow-xl shadow-emerald-900/40";
    case "short":
      return "h-10 w-10 bg-gradient-to-t from-emerald-600/70 via-emerald-400/60 to-emerald-200/40 shadow-lg shadow-emerald-900/30";
    default:
      return "";
  }
}

function involvementBorder(involvement: Involvement) {
  switch (involvement) {
    case "owner":
      return "border-emerald-300/90";
    case "ally":
      return "border-cyan-300/80";
    case "idea":
      return "border-slate-400/80";
    default:
      return "border-slate-600/80";
  }
}

export function ForestMap() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  const activeNode = useMemo(
    () => NODES.find((n) => n.id === activeId) ?? null,
    [activeId],
  );

  const handleZoom = (delta: number) => {
    setZoom((z) => {
      const next = z + delta;
      return Math.min(1.8, Math.max(0.7, next));
    });
  };

  return (
    <div className="relative h-[520px] md:h-[560px] lg:h-[600px] rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950/95 overflow-hidden">
      {/* 地表ライン */}
      <div className="pointer-events-none absolute inset-x-0 bottom-24 h-0.5 bg-gradient-to-r from-emerald-900/40 via-emerald-400/60 to-emerald-900/40" />
      {/* 下層の霞んだ森（奥行き） */}
      <div className="pointer-events-none absolute inset-x-[-20%] top-12 h-64 bg-gradient-radial from-emerald-900/40 via-emerald-800/10 to-transparent blur-3xl opacity-70" />

      {/* ズーム・ヒント */}
      <div className="pointer-events-none absolute left-4 top-4 flex flex-col gap-1 text-[11px] text-slate-300">
        <p>ドラッグ（トラックパッドのスクロール）とズームで森を眺めてください。</p>
      </div>

      {/* ズームボタン */}
      <div className="pointer-events-auto absolute right-4 top-4 flex flex-col gap-1">
        <button
          type="button"
          onClick={() => handleZoom(0.15)}
          className="h-7 w-7 rounded-md border border-slate-700 bg-slate-900/80 text-slate-100 text-sm hover:border-emerald-400/70 hover:text-emerald-300 transition-colors"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => handleZoom(-0.15)}
          className="h-7 w-7 rounded-md border border-slate-700 bg-slate-900/80 text-slate-100 text-sm hover:border-emerald-400/70 hover:text-emerald-300 transition-colors"
        >
          −
        </button>
      </div>

      {/* マップ本体（横長スクロール＋ズーム） */}
      <div className="absolute inset-0 overflow-auto md:overflow-x-auto md:overflow-y-hidden">
        <div
          className="relative mx-auto my-10 h-[420px] min-w-[960px] md:min-w-[1200px]"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "center center",
            transition: "transform 160ms ease-out",
          }}
        >
          {NODES.map((node) => (
            <button
              key={node.id}
              type="button"
              onClick={() => setActiveId(node.id)}
              className="group absolute -translate-x-1/2 -translate-y-full focus:outline-none"
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
              }}
            >
              {/* 幹＋植物的シルエット（シンプルな図形で） */}
              <div className="flex flex-col items-center gap-1">
                <div className="h-10 w-[3px] rounded-full bg-gradient-to-t from-emerald-900/80 via-emerald-700/80 to-emerald-500/40" />
                <div
                  className={[
                    "rounded-full border backdrop-blur-sm transition-all duration-200",
                    depthToClasses(node.depth),
                    involvementBorder(node.involvement),
                    activeId === node.id
                      ? "ring-2 ring-emerald-300/70 scale-105"
                      : "opacity-90 group-hover:opacity-100 group-hover:scale-105",
                  ].join(" ")}
                >
                  <div className="flex h-full w-full items-center justify-center px-3 text-center text-[11px] font-semibold text-emerald-50 drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]">
                    {node.label}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ノード説明パネル */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 border-t border-slate-800 bg-gradient-to-t from-slate-950 via-slate-950/95 to-slate-950/60 px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="pointer-events-auto flex-1 min-w-0">
            {activeNode ? (
              <>
                <p className="text-xs font-semibold tracking-wide text-emerald-300">
                  {activeNode.label}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-200 line-clamp-3">
                  {activeNode.summary}
                </p>
              </>
            ) : (
              <p className="text-[11px] text-slate-300">
                どれかの木や芽をタップすると、その裏側の物語や OS とのつながりがここに現れます。
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

