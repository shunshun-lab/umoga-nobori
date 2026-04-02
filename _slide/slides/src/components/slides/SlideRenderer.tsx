import type {
  SlideData,
  SlideStyle,
  DeckTheme,
  RichText,
  TitleSlideData,
  SectionSlideData,
  TwoColumnSlideData,
  KPIListSlideData,
  ComparisonSlideData,
  TimelineSlideData,
  DiagramSlideData,
  PhotoTitleSlideData,
  QuoteSlideData,
  StatsSlideData,
  TableSlideData,
  FactGridSlideData,
  PhotoCaptionSlideData,
  CTASlideData,
} from "./types";
import { RichTextRenderer } from "./RichTextRenderer";

/* helper */
function RT({ children, accent, className }: { children: RichText; accent?: string; className?: string }) {
  return <RichTextRenderer content={children} accentColor={accent} className={className} />;
}

/* ═══════════════════════════════════════════
   Shared wrapper
   ═══════════════════════════════════════════ */

function SlideFrame({
  theme,
  children,
  className = "",
  slideStyle,
}: {
  theme: DeckTheme;
  children: React.ReactNode;
  className?: string;
  slideStyle?: SlideStyle;
}) {
  const bgAlt = theme.backgroundAlt ?? theme.background;
  const hasImage = !!slideStyle?.backgroundImage;
  const overlay = slideStyle?.overlayOpacity ?? 0.65;
  const centered = className.includes("items-center") || slideStyle?.align === "center";

  return (
    <div
      className={`relative flex h-full w-full flex-col justify-center overflow-hidden ${
        centered ? "items-center text-center" : ""
      } ${className}`}
      style={{
        background: hasImage
          ? `url(${slideStyle!.backgroundImage}) center/cover no-repeat`
          : `linear-gradient(135deg, ${theme.background} 0%, ${bgAlt} 50%, ${theme.background} 100%)`,
        color: theme.foreground,
        fontFamily: theme.font ? `"${theme.font}", serif` : undefined,
      }}
    >
      {hasImage && (
        <div
          className="absolute inset-0 z-0"
          style={{
            background: `linear-gradient(135deg, rgba(0,0,0,${overlay}) 0%, rgba(0,0,0,${overlay * 0.85}) 100%)`,
          }}
        />
      )}
      <div
        className={`relative z-10 flex h-full w-full flex-col justify-center px-5 py-4 sm:px-16 sm:py-12 ${
          centered ? "items-center text-center" : ""
        }`}
      >
        {children}
      </div>
      {/* Image credit */}
      {slideStyle?.credit && (
        <div className="absolute bottom-2 left-4 z-20 text-[10px] opacity-40">
          {slideStyle.credit}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Original slide types
   ═══════════════════════════════════════════ */

function TitleSlide({ slide, theme }: { slide: TitleSlideData; theme: DeckTheme }) {
  return (
    <SlideFrame theme={theme} slideStyle={slide.style} className="items-center text-center">
      {slide.badge && (
        <span
          className="mb-6 inline-block rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wider uppercase"
          style={{ borderColor: theme.accent, color: theme.accent }}
        >
          {slide.badge}
        </span>
      )}
      <h1 className="max-w-4xl text-2xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
        {slide.title}
      </h1>
      {slide.subtitle && (
        <p className="mt-6 max-w-2xl text-lg leading-relaxed" style={{ color: theme.muted }}>
          <RT accent={theme.accent}>{slide.subtitle}</RT>
        </p>
      )}
    </SlideFrame>
  );
}

function SectionSlide({ slide, theme }: { slide: SectionSlideData; theme: DeckTheme }) {
  return (
    <SlideFrame theme={theme} slideStyle={slide.style} className="items-center text-center">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: theme.accent }}>
        {slide.title}
      </h2>
      {slide.subtitle && (
        <p className="mt-2 max-w-xl text-base font-medium leading-snug sm:mt-4 sm:text-2xl">
          <RT accent={theme.accent}>{slide.subtitle}</RT>
        </p>
      )}
    </SlideFrame>
  );
}

function TwoColumnSlide({ slide, theme }: { slide: TwoColumnSlideData; theme: DeckTheme }) {
  return (
    <SlideFrame theme={theme} slideStyle={slide.style} className="items-center text-center">
      <h2 className="mb-4 text-lg font-bold sm:mb-10 sm:text-3xl">{slide.title}</h2>
      <div className="grid w-full max-w-5xl grid-cols-1 gap-4 text-left sm:grid-cols-2 sm:gap-10">
        {[
          { label: slide.leftLabel, items: slide.left },
          { label: slide.rightLabel, items: slide.right },
        ].map((col, i) => (
          <div key={i}>
            {col.label && (
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider" style={{ color: theme.accent }}>
                {col.label}
              </p>
            )}
            <ul className="space-y-3">
              {col.items.map((item, j) => (
                <li key={j} className="flex items-start gap-3 text-base leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: theme.brand }} />
                  <RT accent={theme.accent}>{item}</RT>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </SlideFrame>
  );
}

function KPIListSlide({ slide, theme }: { slide: KPIListSlideData; theme: DeckTheme }) {
  return (
    <SlideFrame theme={theme} slideStyle={slide.style} className="items-center text-center">
      <h2 className="mb-4 text-lg font-bold sm:mb-10 sm:text-3xl">{slide.title}</h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
        {slide.items.map((item, i) => (
          <div key={i} className="rounded-xl border p-6" style={{ borderColor: theme.muted + "33" }}>
            <p className="text-xl font-bold sm:text-3xl" style={{ color: theme.brand }}>{item.value}</p>
            <p className="mt-2 text-sm font-medium">{item.label}</p>
            {item.note && <p className="mt-1 text-xs" style={{ color: theme.muted }}>{item.note}</p>}
          </div>
        ))}
      </div>
    </SlideFrame>
  );
}

function ComparisonSlide({ slide, theme }: { slide: ComparisonSlideData; theme: DeckTheme }) {
  return (
    <SlideFrame theme={theme} slideStyle={slide.style} className="items-center text-center">
      <h2 className="mb-4 text-lg font-bold sm:mb-10 sm:text-3xl">{slide.title}</h2>
      <div className="grid w-full max-w-5xl grid-cols-1 gap-4 text-left sm:grid-cols-2 sm:gap-8">
        {[slide.before, slide.after].map((col, i) => (
          <div
            key={i}
            className="rounded-xl border p-8"
            style={{
              borderColor: i === 0 ? theme.muted + "44" : theme.brand + "66",
              backgroundColor: i === 0 ? theme.muted + "0a" : theme.brand + "0a",
            }}
          >
            <p className="mb-5 text-sm font-semibold uppercase tracking-wider" style={{ color: i === 0 ? theme.muted : theme.brand }}>
              {col.label}
            </p>
            <ul className="space-y-3">
              {col.items.map((item, j) => (
                <li key={j} className="flex items-start gap-3 text-base leading-relaxed">
                  <span className="mt-1.5 text-sm">{i === 0 ? "△" : "◎"}</span>
                  <RT accent={theme.accent}>{item}</RT>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </SlideFrame>
  );
}

function TimelineSlide({ slide, theme }: { slide: TimelineSlideData; theme: DeckTheme }) {
  return (
    <SlideFrame theme={theme} slideStyle={slide.style} className="items-center text-center">
      <h2 className="mb-4 text-lg font-bold sm:mb-10 sm:text-3xl">{slide.title}</h2>
      <div className="grid grid-cols-2 gap-3 sm:flex sm:items-start sm:gap-4">
        {slide.events.map((ev, i) => (
          <div key={i} className="flex flex-1 flex-col items-center text-center">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
              style={{ backgroundColor: theme.brand, color: theme.background }}
            >
              {i + 1}
            </div>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wider" style={{ color: theme.accent }}>{ev.date}</p>
            <p className="mt-2 text-sm font-medium">{ev.label}</p>
            {ev.detail && <p className="mt-1 text-xs" style={{ color: theme.muted }}><RT accent={theme.accent}>{ev.detail}</RT></p>}
          </div>
        ))}
      </div>
    </SlideFrame>
  );
}

function DiagramSlide({ slide, theme }: { slide: DiagramSlideData; theme: DeckTheme }) {
  const isCycle = slide.flow === "cycle";
  return (
    <SlideFrame theme={theme} slideStyle={slide.style} className="items-center text-center">
      <h2 className="mb-4 text-lg font-bold sm:mb-10 sm:text-3xl">{slide.title}</h2>
      <div className="flex flex-wrap items-center justify-center gap-4">
        {slide.nodes.map((node, i) => (
          <div key={node.id} className="flex items-center gap-4">
            <div className="flex flex-col items-center rounded-xl border px-6 py-5 text-center" style={{ borderColor: theme.brand + "55" }}>
              <p className="text-base font-semibold">{node.label}</p>
              {node.sub && <p className="mt-1 text-xs" style={{ color: theme.muted }}>{node.sub}</p>}
            </div>
            {i < slide.nodes.length - 1 && <span className="text-lg" style={{ color: theme.accent }}>→</span>}
            {isCycle && i === slide.nodes.length - 1 && <span className="text-lg" style={{ color: theme.accent }}>↻</span>}
          </div>
        ))}
      </div>
    </SlideFrame>
  );
}

/* ═══════════════════════════════════════════
   New slide types
   ═══════════════════════════════════════════ */

function PhotoTitleSlide({ slide, theme }: { slide: PhotoTitleSlideData; theme: DeckTheme }) {
  return (
    <SlideFrame theme={theme} slideStyle={{ ...slide.style, overlayOpacity: slide.style?.overlayOpacity ?? 0.6 }} className="items-center text-center">
      {slide.badge && (
        <span
          className="mb-6 inline-block rounded-full border px-4 py-1.5 text-xs font-semibold tracking-[0.3em] uppercase"
          style={{ borderColor: theme.accent, color: theme.accent }}
        >
          {slide.badge}
        </span>
      )}
      <h1 className="max-w-4xl text-2xl font-black leading-tight tracking-wider sm:text-5xl md:text-6xl" style={{ textShadow: "0 4px 30px rgba(0,0,0,0.5)" }}>
        {slide.title}
      </h1>
      {slide.subtitle && (
        <p className="mt-6 max-w-2xl text-lg leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
          <RT accent={theme.accent}>{slide.subtitle}</RT>
        </p>
      )}
    </SlideFrame>
  );
}

function QuoteSlide({ slide, theme }: { slide: QuoteSlideData; theme: DeckTheme }) {
  return (
    <SlideFrame theme={theme} slideStyle={slide.style} className="items-center text-center">
      <div
        className="max-w-3xl rounded-r-lg border-l-4 px-10 py-8 text-left"
        style={{ borderColor: theme.accent, backgroundColor: theme.accent + "0d" }}
      >
        <p className="text-base font-medium italic leading-relaxed sm:text-2xl" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
          「{slide.quote}」
        </p>
        {slide.author && <p className="mt-5 text-sm" style={{ color: theme.muted }}>— {slide.author}</p>}
      </div>
      {slide.context && (
        <p className="mt-6 text-sm" style={{ color: theme.muted }}><RT accent={theme.accent}>{slide.context}</RT></p>
      )}
    </SlideFrame>
  );
}

function StatsSlide({ slide, theme }: { slide: StatsSlideData; theme: DeckTheme }) {
  return (
    <SlideFrame theme={theme} slideStyle={slide.style} className="items-center text-center">
      <p className="text-5xl font-black leading-none sm:text-8xl md:text-9xl" style={{ color: theme.accent, textShadow: `0 0 60px ${theme.accent}33` }}>
        {slide.value}
      </p>
      <p className="mt-4 text-lg font-bold sm:mt-6 sm:text-2xl">{slide.label}</p>
      {slide.detail && (
        <p className="mt-3 max-w-lg text-base leading-relaxed" style={{ color: theme.muted }}>
          <RT accent={theme.accent}>{slide.detail}</RT>
        </p>
      )}
    </SlideFrame>
  );
}

function TableSlide({ slide, theme }: { slide: TableSlideData; theme: DeckTheme }) {
  return (
    <SlideFrame theme={theme} slideStyle={slide.style} className="items-center text-center">
      <h2 className="mb-4 text-lg font-bold sm:mb-10 sm:text-3xl">{slide.title}</h2>
      <table className="mx-auto text-left" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {slide.headers.map((h, i) => (
              <th key={i} className="px-6 py-3 text-sm font-bold" style={{ color: theme.accent, borderBottom: `2px solid ${theme.accent}44` }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {slide.rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="px-6 py-3 text-base" style={{ borderBottom: `1px solid ${theme.muted}22` }}>
                  <RT accent={theme.accent}>{cell}</RT>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </SlideFrame>
  );
}

function FactGridSlide({ slide, theme }: { slide: FactGridSlideData; theme: DeckTheme }) {
  return (
    <SlideFrame theme={theme} slideStyle={slide.style} className="items-center text-center">
      <h2 className="mb-4 text-lg font-bold sm:mb-10 sm:text-3xl">{slide.title}</h2>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-5">
        {slide.facts.map((fact, i) => (
          <div
            key={i}
            className="rounded-xl border p-6"
            style={{ borderColor: theme.accent + "33", backgroundColor: theme.foreground + "06" }}
          >
            <h3 className="text-base font-bold" style={{ color: theme.accent }}>{fact.heading}</h3>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: theme.muted }}>
              <RT accent={theme.accent}>{fact.body}</RT>
            </p>
          </div>
        ))}
      </div>
    </SlideFrame>
  );
}

function PhotoCaptionSlide({ slide, theme }: { slide: PhotoCaptionSlideData; theme: DeckTheme }) {
  return (
    <div
      className="relative flex h-full w-full flex-col justify-end items-center pb-[8vh] overflow-hidden"
      style={{
        background: slide.style?.backgroundImage
          ? `url(${slide.style.backgroundImage}) center/cover no-repeat`
          : theme.background,
        fontFamily: theme.font ? `"${theme.font}", serif` : undefined,
      }}
    >
      <div
        className="absolute inset-0 z-0"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.7) 85%, rgba(0,0,0,0.85) 100%)" }}
      />
      <div className="relative z-10 max-w-[80%] text-center">
        <p className="text-lg" style={{ color: "rgba(255,255,255,0.92)", textShadow: "0 2px 12px rgba(0,0,0,0.8)", letterSpacing: "0.05em" }}>
          <RT accent={theme.accent}>{slide.caption}</RT>
        </p>
        {slide.subcaption && (
          <p className="mt-2 text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
            <RT accent={theme.accent}>{slide.subcaption}</RT>
          </p>
        )}
      </div>
      {slide.style?.credit && (
        <div className="absolute bottom-2 left-4 z-20 text-[10px] opacity-40">
          {slide.style.credit}
        </div>
      )}
    </div>
  );
}

function CTASlide({ slide, theme }: { slide: CTASlideData; theme: DeckTheme }) {
  return (
    <SlideFrame theme={theme} slideStyle={slide.style} className="items-center text-center">
      <h2 className="max-w-3xl text-xl font-bold leading-tight sm:text-4xl">{slide.title}</h2>
      {slide.subtitle && (
        <p className="mt-4 max-w-xl text-lg leading-relaxed" style={{ color: theme.muted }}>
          <RT accent={theme.accent}>{slide.subtitle}</RT>
        </p>
      )}
      {slide.buttonLabel && (
        slide.url ? (
          <a
            href={slide.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block rounded-lg px-8 py-3 text-lg font-bold no-underline transition-opacity hover:opacity-80"
            style={{ backgroundColor: theme.accent, color: theme.background }}
          >
            {slide.buttonLabel}
          </a>
        ) : (
          <div
            className="mt-8 inline-block rounded-lg px-8 py-3 text-lg font-bold"
            style={{ backgroundColor: theme.accent, color: theme.background }}
          >
            {slide.buttonLabel}
          </div>
        )
      )}
      {slide.url && !slide.buttonLabel && (
        <a href={slide.url} target="_blank" rel="noopener noreferrer" className="mt-4 text-sm underline" style={{ color: theme.accent }}>
          {slide.url}
        </a>
      )}
    </SlideFrame>
  );
}

/* ═══════════════════════════════════════════
   Dispatcher
   ═══════════════════════════════════════════ */

export function SlideRenderer({ slide, theme }: { slide: SlideData; theme: DeckTheme }) {
  switch (slide.type) {
    case "title": return <TitleSlide slide={slide} theme={theme} />;
    case "section": return <SectionSlide slide={slide} theme={theme} />;
    case "twoColumn": return <TwoColumnSlide slide={slide} theme={theme} />;
    case "kpiList": return <KPIListSlide slide={slide} theme={theme} />;
    case "comparison": return <ComparisonSlide slide={slide} theme={theme} />;
    case "timeline": return <TimelineSlide slide={slide} theme={theme} />;
    case "diagram": return <DiagramSlide slide={slide} theme={theme} />;
    case "photoTitle": return <PhotoTitleSlide slide={slide} theme={theme} />;
    case "quote": return <QuoteSlide slide={slide} theme={theme} />;
    case "stats": return <StatsSlide slide={slide} theme={theme} />;
    case "table": return <TableSlide slide={slide} theme={theme} />;
    case "factGrid": return <FactGridSlide slide={slide} theme={theme} />;
    case "photoCaption": return <PhotoCaptionSlide slide={slide} theme={theme} />;
    case "cta": return <CTASlide slide={slide} theme={theme} />;
    default: {
      const _exhaustive: never = slide;
      return null;
    }
  }
}
