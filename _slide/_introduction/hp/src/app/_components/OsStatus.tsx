type Metric = {
  id: string;
  label: string;
  value: number; // 0-5
  description: string;
};

const METRICS: Metric[] = [
  {
    id: "people",
    label: "People Flow",
    value: 3,
    description: "プロジェクト間を行き来する人の流れ・関係人口の循環度合い。",
  },
  {
    id: "energy",
    label: "Energy Flow",
    value: 4,
    description: "新しい問い・物語・アウトプットが生まれるペース。",
  },
  {
    id: "system",
    label: "System / Infra",
    value: 2,
    description: "自分抜きでも回り始めている仕組み・OSとしての整備度合い。",
  },
];

function Dots({ count }: { count: number }) {
  return (
    <span className="inline-flex gap-0.5 text-[10px] tracking-tight">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          className={
            i < count
              ? "text-emerald-300"
              : "text-slate-600"
          }
        >
          ●
        </span>
      ))}
    </span>
  );
}

export function OsStatus() {
  return (
    <aside className="pointer-events-auto rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-3 shadow-lg shadow-black/40 text-xs text-slate-200 space-y-2">
      <p className="text-[11px] font-semibold tracking-wide text-emerald-300">
        CURRENT OS STATUS
      </p>
      <div className="space-y-1.5">
        {METRICS.map((m) => (
          <div key={m.id} className="flex items-center justify-between gap-2">
            <span className="truncate">{m.label}</span>
            <Dots count={m.value} />
          </div>
        ))}
      </div>
      <p className="text-[10px] text-slate-400">
        ● の数は、今の自分なりの自己評価です。森を探索していくと、「どこに効かせたいのか」が少しずつ見えてきます。
      </p>
    </aside>
  );
}

