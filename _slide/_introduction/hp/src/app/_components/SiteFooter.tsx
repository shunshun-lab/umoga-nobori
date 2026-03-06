import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm font-semibold text-slate-100">高木 俊介</p>
          <div className="flex flex-wrap gap-4 text-xs text-slate-300">
            <Link href="/jxc" className="hover:text-emerald-300 transition-colors">
              JXC
            </Link>
            <Link href="/ise" className="hover:text-emerald-300 transition-colors">
              伊勢（常若）
            </Link>
            <Link href="/minerva" className="hover:text-emerald-300 transition-colors">
              Minerva
            </Link>
            <Link href="/dao-ai" className="hover:text-emerald-300 transition-colors">
              DAO×AI
            </Link>
          </div>
        </div>
        <p className="text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Shunsuke Takagi. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

