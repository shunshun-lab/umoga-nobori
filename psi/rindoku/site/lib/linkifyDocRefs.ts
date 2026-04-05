/**
 * ノート内の `` `notes/Foo.md` `` / `` `notebook/Bar.md` `` をサイト内リンクに変換する。
 */
export function linkifyDocRefs(markdown: string): string {
  return markdown
    .replace(
      /`notes\/([-\w.]+)\.md`/g,
      (_m, slug: string) => `[notes/${slug}.md](/docs/notes/${slug})`,
    )
    .replace(
      /`notebook\/([-\w.]+)\.md`/g,
      (_m, slug: string) => `[notebook/${slug}.md](/docs/notebook/${slug})`,
    );
}
