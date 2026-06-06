/* ── Slide type definitions ── */

/**
 * Rich text segment — allows inline links and emphasis in slide text.
 *
 * Plain string is still accepted everywhere. Use an array of segments
 * when you need links or bold:
 *
 *   "plain text"
 *   ["Visit ", { text: "our site", href: "https://..." }, " for details"]
 *   ["This is ", { text: "important", bold: true }]
 */
export type RichTextSegment =
  | string
  | { text: string; href?: string; bold?: boolean };

export type RichText = string | RichTextSegment[];

export interface DeckTheme {
  brand: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  /** Google Fonts family name, e.g. "Noto Serif JP" */
  font?: string;
  /** Secondary gradient color blended with background */
  backgroundAlt?: string;
}

/** Per-slide visual overrides */
export interface SlideStyle {
  /** Full URL for background image */
  backgroundImage?: string;
  /** Overlay opacity 0-1 (default 0.65) */
  overlayOpacity?: number;
  /** Override text alignment */
  align?: "center" | "left";
  /** Image credit / attribution shown bottom-left of the slide */
  credit?: string;
}

/** Image source credit for the credits slide at the end */
export interface ImageCredit {
  /** Which slide or context this image is used in */
  context: string;
  /** Attribution text, e.g. "Photo by John Doe on Unsplash" */
  attribution: string;
  /** Optional URL to the original source */
  url?: string;
}

/* ── Individual slide types ── */

export interface TitleSlideData {
  type: "title";
  title: string;
  subtitle?: RichText;
  badge?: string;
  style?: SlideStyle;
}

export interface SectionSlideData {
  type: "section";
  title: string;
  subtitle?: RichText;
  style?: SlideStyle;
}

export interface TwoColumnSlideData {
  type: "twoColumn";
  title: string;
  left: RichText[];
  right: RichText[];
  leftLabel?: string;
  rightLabel?: string;
  style?: SlideStyle;
}

export interface KPIListSlideData {
  type: "kpiList";
  title: string;
  items: { label: string; value: string; note?: string }[];
  style?: SlideStyle;
}

export interface ComparisonSlideData {
  type: "comparison";
  title: string;
  before: { label: string; items: RichText[] };
  after: { label: string; items: RichText[] };
  style?: SlideStyle;
}

export interface TimelineSlideData {
  type: "timeline";
  title: string;
  events: { date: string; label: string; detail?: RichText }[];
  style?: SlideStyle;
}

export interface DiagramSlideData {
  type: "diagram";
  title: string;
  nodes: { id: string; label: string; sub?: string }[];
  flow?: "horizontal" | "vertical" | "cycle";
  style?: SlideStyle;
}

/* ── New slide types ── */

export interface PhotoTitleSlideData {
  type: "photoTitle";
  title: string;
  subtitle?: RichText;
  badge?: string;
  style?: SlideStyle;
}

export interface QuoteSlideData {
  type: "quote";
  quote: string;
  author?: string;
  context?: RichText;
  style?: SlideStyle;
}

export interface StatsSlideData {
  type: "stats";
  value: string;
  label: string;
  detail?: RichText;
  style?: SlideStyle;
}

export interface TableSlideData {
  type: "table";
  title: string;
  headers: string[];
  rows: RichText[][];
  style?: SlideStyle;
}

export interface FactGridSlideData {
  type: "factGrid";
  title: string;
  facts: { heading: string; body: RichText }[];
  style?: SlideStyle;
}

export interface PhotoCaptionSlideData {
  type: "photoCaption";
  caption: RichText;
  subcaption?: RichText;
  style?: SlideStyle;
}

export interface CTASlideData {
  type: "cta";
  title: string;
  subtitle?: RichText;
  buttonLabel?: string;
  url?: string;
  /** Optional QR code (image src / data URI) shown on the slide, e.g. pointing to this deck itself */
  qr?: string;
  /** Caption under the QR code */
  qrCaption?: RichText;
  style?: SlideStyle;
}

export type SlideData =
  | TitleSlideData
  | SectionSlideData
  | TwoColumnSlideData
  | KPIListSlideData
  | ComparisonSlideData
  | TimelineSlideData
  | DiagramSlideData
  | PhotoTitleSlideData
  | QuoteSlideData
  | StatsSlideData
  | TableSlideData
  | FactGridSlideData
  | PhotoCaptionSlideData
  | CTASlideData;

/* ── Deck definition ── */

export interface DeckMeta {
  slug: string;
  title: string;
  description: string;
  date?: string;
  tags?: string[];
}

export interface DeckData extends DeckMeta {
  theme: DeckTheme;
  slides: SlideData[];
  /** Image credits / attributions shown on the credits page */
  credits?: ImageCredit[];
}
