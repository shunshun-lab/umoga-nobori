// src/components/Header.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import NotificationBell from "./NotificationBell";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import InstallAppModal from "./pwa/InstallAppModal";
import { useTranslation } from "@/lib/i18n/context";
import { useSidebar } from "@/context/SidebarContext";

export default function Header() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useTranslation();
  const { toggle: toggleSidebar } = useSidebar();
  const [profileOpen, setProfileOpen] = useState(false);

  // PWA Install Logic
  const { isIOS, isStandalone, deferredPrompt, promptInstall } = usePwaInstall();
  const [showInstallModal, setShowInstallModal] = useState(false);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.profile-menu-container')) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40 relative">
      <div className="flex items-center h-16 w-full px-4">
        {/* Left: Hamburger (mobile only) */}
        <div className="flex items-center gap-2 min-w-0 flex-1 relative z-10">
          <button
            onClick={toggleSidebar}
            className="md:hidden flex-shrink-0 p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="メニューを開く"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Center: ロゴ（アイコンのみ）→ タイムライン（スマホでもタップ可能に z-10 で前面に） */}
        <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 flex items-center justify-center pointer-events-none [&>a]:pointer-events-auto z-10">
          <Link
            href={status === "authenticated" ? "/timeline" : "/"}
            className="flex items-center justify-center min-h-[44px] min-w-[44px] px-2 py-1.5 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
            aria-label="タイムラインへ"
          >
            <img src="/logo-100dao.png" alt="100万人DAO" className="h-8 w-8 object-contain" />
          </Link>
        </div>

        {/* Right: Icons */}
        <div className="flex-shrink-0 flex items-center gap-2 md:gap-4 ml-auto relative z-10">
          {status === "loading" ? (
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
          ) : status === "authenticated" && session.user ? (
            <>
              {/* Notification */}
              <div className="flex items-center">
                <NotificationBell />
              </div>

              {/* 3. Profile (Dropdown) */}
              <div className="relative profile-menu-container">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center justify-center transition-opacity hover:opacity-80 focus:outline-none"
                >
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.displayName || session.user.name || "User"}
                      className="w-9 h-9 rounded-full border border-gray-200"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {(session.user.displayName || session.user.name || "U")[0]}
                    </div>
                  )}
                </button>

                {/* Dropdown Menu */}
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 overflow-hidden animate-fade-in origin-top-right z-50">
                    {/* 名前を押したらマイページへ（マイページボタンは廃止） */}
                    <button
                      type="button"
                      className="block w-full text-left px-4 py-3 border-b border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors"
                      onClick={() => {
                        router.push("/mypage");
                        setProfileOpen(false);
                      }}
                    >
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {([session.user.displayName, session.user.name].find(v => v && String(v) !== "null") as string) || "ユーザー"}
                      </p>
                      {session.user.email && String(session.user.email) !== "null" && (
                        <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                      )}
                    </button>
                    {/* QR・名刺 → 自分の公開ページ (/users/[id]) */}
                    {(session.user as any).id && (
                      <button
                        type="button"
                        className="block w-full text-left px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 flex items-center gap-2 border-0 bg-transparent cursor-pointer"
                        onClick={() => {
                          const id = (session.user as any).id;
                          if (id) router.push(`/users/${id}`);
                          setProfileOpen(false);
                        }}
                      >
                        <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1v-2a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                        {t("header.qrNamecard")}
                      </button>
                    )}

                    <Link
                      href="/points"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      onClick={(e) => {
                        e.preventDefault();
                        router.push("/points");
                        setProfileOpen(false);
                      }}
                    >
                      <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {t("header.pointsAssets")}
                    </Link>

                    <button
                      type="button"
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border-0 bg-transparent cursor-pointer"
                      onClick={() => {
                        router.push("/mypage?tab=profile");
                        setProfileOpen(false);
                      }}
                    >
                      {t("header.profileSettings")}
                    </button>
                    <Link
                      href="/campaigns"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={(e) => {
                        e.preventDefault();
                        router.push("/campaigns");
                        setProfileOpen(false);
                      }}
                    >
                      {t("header.campaignManage")}
                    </Link>
                    {(session?.user as any).isAdmin && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
                        onClick={(e) => {
                          e.preventDefault();
                          router.push("/admin");
                          setProfileOpen(false);
                        }}
                      >
                        {t("common.admin")}
                      </Link>
                    )}
                    {!isStandalone && (
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          setShowInstallModal(true);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 font-bold border-t border-gray-100 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        {t("common.installApp")}
                      </button>
                    )}
                  </div>
                )}
              </div>

              <InstallAppModal
                isOpen={showInstallModal}
                onClose={() => setShowInstallModal(false)}
                onInstall={promptInstall}
                isIOS={isIOS}
              />

            </>
          ) : (
            <Link
              href="/auth/signin"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
            >
              {t("common.login")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
