const SOURCE_CONFIG: Record<string, { color: string; dimColor: string; icon: string }> = {
  "Dev.to": {
    color: "bg-source-devto/15 text-source-devto border-source-devto/30",
    dimColor: "bg-border/50 text-text-muted border-border opacity-50",
    icon: "D",
  },
  "GitHub claude-code Releases": {
    color: "bg-source-github/15 text-source-github border-source-github/30",
    dimColor: "bg-border/50 text-text-muted border-border opacity-50",
    icon: "G",
  },
  "Hacker News": {
    color: "bg-source-hackernews/15 text-source-hackernews border-source-hackernews/30",
    dimColor: "bg-border/50 text-text-muted border-border opacity-50",
    icon: "Y",
  },
  "Reddit r/ClaudeAI": {
    color: "bg-source-reddit/15 text-source-reddit border-source-reddit/30",
    dimColor: "bg-border/50 text-text-muted border-border opacity-50",
    icon: "R",
  },
  "Anthropic Blog": {
    color: "bg-source-anthropic/15 text-source-anthropic border-source-anthropic/30",
    dimColor: "bg-border/50 text-text-muted border-border opacity-50",
    icon: "A",
  },
};

const DEFAULT_CONFIG = {
  color: "bg-border text-text-muted border-border-light",
  dimColor: "bg-border/50 text-text-muted border-border opacity-50",
};

export function SourceBadge({ source, active = true }: { source: string; active?: boolean }) {
  const config = SOURCE_CONFIG[source] ?? { ...DEFAULT_CONFIG, icon: source.charAt(0) };
  const colorClass = active ? config.color : config.dimColor;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-all duration-200 ${colorClass}`}
    >
      <span className="font-bold text-[10px] w-4 h-4 rounded flex items-center justify-center opacity-80">
        {config.icon}
      </span>
      {source.replace("GitHub claude-code ", "").replace("r/ClaudeAI", "Reddit")}
    </span>
  );
}

export function SourceDot({ source }: { source: string }) {
  const colorMap: Record<string, string> = {
    "Dev.to": "bg-source-devto",
    "GitHub claude-code Releases": "bg-source-github",
    "Hacker News": "bg-source-hackernews",
    "Reddit r/ClaudeAI": "bg-source-reddit",
    "Anthropic Blog": "bg-source-anthropic",
  };
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${colorMap[source] ?? "bg-text-muted"}`} />
  );
}
