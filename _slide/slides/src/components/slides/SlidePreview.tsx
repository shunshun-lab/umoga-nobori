import type { SlideData, DeckTheme } from "./types";
import { SlideRenderer } from "./SlideRenderer";

/**
 * A miniature, non-interactive preview of a slide.
 * Uses CSS transform to scale down from 16:9 full size.
 */
export function SlidePreview({
  slide,
  theme,
  scale = 0.25,
}: {
  slide: SlideData;
  theme: DeckTheme;
  scale?: number;
}) {
  const w = 960;
  const h = 540;

  return (
    <div
      className="overflow-hidden rounded-lg border border-white/10"
      style={{ width: w * scale, height: h * scale }}
    >
      <div
        style={{
          width: w,
          height: h,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <SlideRenderer slide={slide} theme={theme} />
      </div>
    </div>
  );
}
