interface NewsItemProps {
  html: string;
}

export function NewsContent({ html }: NewsItemProps) {
  return (
    <div
      className="prose-dark"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
