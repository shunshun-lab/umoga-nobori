import Link from "next/link";

type NavItem = {
  label: string;
  href: string;
};

const primaryLinks: NavItem[] = [
  { label: "思想", href: "/#belief" },
  { label: "ナラティブ", href: "/#narrative" },
  { label: "いまやってること", href: "/#now" },
  { label: "プロジェクト", href: "/#projects" },
  { label: "連絡", href: "/#contact" },
];

const pageLinks: NavItem[] = [
  { label: "JXC", href: "/jxc" },
  { label: "伊勢（常若）", href: "/ise" },
  { label: "Minerva", href: "/minerva" },
  { label: "DAO×AI", href: "/dao-ai" },
];

export function SiteNav({ title = "SHUNSUKE TAKAGI" }: { title?: string }) {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/" className="text-sm font-bold tracking-wide hover:text-emerald-300 transition-colors">
          {title}
        </Link>
        <div className="hidden lg:flex items-center gap-5 text-xs text-slate-300">
          {primaryLinks.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-emerald-300 transition-colors">
              {l.label}
            </Link>
          ))}
          <span className="mx-1 h-4 w-px bg-slate-800" />
          {pageLinks.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-emerald-300 transition-colors">
              {l.label}
            </Link>
          ))}
        </div>
        <div className="lg:hidden text-xs text-slate-400">
          <Link href="/#projects" className="hover:text-emerald-300 transition-colors">
            Projects
          </Link>
        </div>
      </div>
    </nav>
  );
}

