type WeatherProps = {
  description: string;
  temperatureC: number | null;
};

export function WeatherBadge({ description, temperatureC }: WeatherProps) {
  return (
    <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-[11px] text-slate-200">
      <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
      <span className="font-semibold text-slate-100">文京区の空模様</span>
      <span className="text-slate-300">
        {description || "Loading..."}
        {typeof temperatureC === "number" ? ` / ${temperatureC.toFixed(1)}℃` : ""}
      </span>
    </div>
  );
}

