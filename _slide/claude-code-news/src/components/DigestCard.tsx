import Link from "next/link";

interface DigestCardProps {
  date: string;
  title: string;
  itemCount: number;
}

export function DigestCard({ date, title, itemCount }: DigestCardProps) {
  return (
    <Link
      href={`/${date}`}
      className="block p-5 rounded-xl border border-border bg-bg-card hover:bg-bg-card-hover hover:border-border-light transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-2">
        <time className="text-sm font-mono text-accent">{date}</time>
        <span className="text-xs px-2 py-0.5 rounded-full bg-border text-text-muted">
          {itemCount} items
        </span>
      </div>
      <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
    </Link>
  );
}
