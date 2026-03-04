// src/app/providers.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { PhoneVerificationGuard } from "@/components/auth/PhoneVerificationGuard";
import { LocaleProvider } from "@/lib/i18n/context";
import { ToastProvider } from "@/context/ToastContext";
import { SidebarProvider } from "@/context/SidebarContext";
import CreateFAB from "@/components/CreateFAB";
import { useEffect } from "react";

type Locale = "ja" | "en";
type Translations = Record<string, unknown>;

export function Providers({
  children,
  initialLocale = "ja",
  initialTranslations,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
  initialTranslations?: Translations;
}) {
  useEffect(() => {
    // Global error handler for ChunkLoadError
    const handleError = (event: ErrorEvent) => {
      const isChunkLoadError = event.error?.name === "ChunkLoadError" || event.message?.includes("ChunkLoadError");
      if (isChunkLoadError) {
        console.warn("ChunkLoadError detected. Reloading page...");
        // Prevent infinite reload loop if the error persists after reload
        const lastReload = sessionStorage.getItem("last_chunk_reload");
        const now = Date.now();
        if (!lastReload || now - parseInt(lastReload) > 10000) {
          sessionStorage.setItem("last_chunk_reload", now.toString());
          window.location.reload();
        }
      }
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  return (
    <LocaleProvider initialLocale={initialLocale} initialTranslations={initialTranslations}>
      <SessionProvider>
        <SidebarProvider>
          <ToastProvider>
            <PhoneVerificationGuard>
              {children}
              <CreateFAB />
            </PhoneVerificationGuard>
          </ToastProvider>
        </SidebarProvider>
      </SessionProvider>
    </LocaleProvider>
  );
}
