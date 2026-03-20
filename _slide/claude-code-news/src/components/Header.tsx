import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-border bg-bg-secondary/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="text-xl font-bold tracking-tight text-text-primary">
            Claude Code News
          </span>
        </Link>
        <span className="text-xs text-text-muted">Daily Auto-Collected</span>
      </div>
    </header>
  );
}
