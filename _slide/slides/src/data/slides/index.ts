import type { DeckData, DeckMeta } from "@/components/slides/types";
import { jxc } from "./jxc";
import { skillBridge } from "./skill-bridge";
import { funoption } from "./funoption";
import { daoAi } from "./dao-ai";
import { antennaShop } from "./antenna-shop";
import { iseVol1 } from "./ise-vol1";
import { iseVol2 } from "./ise-vol2";
import { iseOkihiki } from "./ise-okihiki";
import { iseVol4 } from "./ise-vol4";
import { iseOkagemairi } from "./ise-okagemairi";
import { iseGaiyou } from "./ise-gaiyou";

/** All decks – add new imports here */
export const decks: DeckData[] = [iseGaiyou, iseVol1, iseVol2, iseOkihiki, iseOkagemairi, iseVol4, antennaShop, daoAi, jxc, skillBridge, funoption];

/** Lightweight list for the hub page */
export const deckIndex: DeckMeta[] = decks.map(
  ({ slug, title, description, date, tags }) => ({
    slug,
    title,
    description,
    date,
    tags,
  }),
);

/** Lookup a single deck by slug */
export function getDeck(slug: string): DeckData | undefined {
  return decks.find((d) => d.slug === slug);
}

/** All slugs for generateStaticParams */
export function getAllSlugs(): string[] {
  return decks.map((d) => d.slug);
}
