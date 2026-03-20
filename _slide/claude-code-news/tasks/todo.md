# Claude Code News - Implementation

## Steps
- [x] Step 1: Project init (package.json, tsconfig, next.config, postcss)
- [x] Step 2: Collection script (scripts/collect.ts) with retry + dedup
- [x] Step 3: Site build (layout, pages, components, content lib)
- [x] Step 4: GitHub Actions (collect + deploy workflows)

## Verification
- [x] `npm install` — 150 packages installed
- [x] `npm run collect` — 30 items collected from 3 sources (GitHub, HN, Dev.to)
- [x] `npm run build` — static export succeeded, 5 pages generated
- [x] Output directory has index.html + date pages
- [ ] Fix: Anthropic Blog RSS URL updated to feed.xml (needs re-test)
- [ ] Fix: Reddit RSS updated to new.rss with filter (needs re-test)

## Notes
- Anthropic Blog `rss.xml` returned 404, changed to `feed.xml`
- Reddit search RSS returned 403, switched to `new.rss` + client-side filter
