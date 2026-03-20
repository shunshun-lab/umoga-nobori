import { getAllDigests } from "@/lib/content";
import { DigestCard } from "@/components/DigestCard";

export default async function HomePage() {
  const digests = await getAllDigests();

  return (
    <div>
      <div className="mb-8">
        <p className="text-text-secondary text-sm leading-relaxed">
          Claude Code に関する最新ニュースを毎朝自動収集しています。
          <br />
          Anthropic Blog / GitHub Releases / Hacker News / Reddit / Dev.to から厳選。
        </p>
      </div>

      {digests.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <p className="text-lg mb-2">No digests yet</p>
          <p className="text-sm">
            Run <code className="px-1.5 py-0.5 bg-border rounded text-text-secondary">npm run collect</code> to fetch the latest news.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {digests.map((digest) => (
            <DigestCard
              key={digest.date}
              date={digest.date}
              title={digest.title}
              itemCount={digest.itemCount}
            />
          ))}
        </div>
      )}
    </div>
  );
}
