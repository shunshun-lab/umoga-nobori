import { getAllDigests } from "@/lib/content";
import { HomeContent } from "@/components/HomeContent";

export default async function HomePage() {
  const digests = await getAllDigests();
  const totalItems = digests.reduce((sum, d) => sum + d.itemCount, 0);

  return <HomeContent digests={digests} totalItems={totalItems} />;
}
