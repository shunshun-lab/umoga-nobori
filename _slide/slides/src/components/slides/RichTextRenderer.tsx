import type { RichText, RichTextSegment } from "./types";

function Segment({ seg, accentColor }: { seg: RichTextSegment; accentColor?: string }) {
  if (typeof seg === "string") return <>{seg}</>;

  const inner = seg.bold ? <strong>{seg.text}</strong> : seg.text;

  if (seg.href) {
    return (
      <a
        href={seg.href}
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-1 underline-offset-2 hover:opacity-80 transition-opacity"
        style={{ color: accentColor }}
      >
        {inner}
      </a>
    );
  }

  if (seg.bold) {
    return <strong style={{ color: accentColor }}>{seg.text}</strong>;
  }

  return <>{seg.text}</>;
}

export function RichTextRenderer({
  content,
  accentColor,
  className,
}: {
  content: RichText;
  accentColor?: string;
  className?: string;
}) {
  if (typeof content === "string") {
    return <span className={className}>{content}</span>;
  }

  return (
    <span className={className}>
      {content.map((seg, i) => (
        <Segment key={i} seg={seg} accentColor={accentColor} />
      ))}
    </span>
  );
}
