// src/app/auth/error/page.tsx
"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description") || undefined;

  const errorMessages: Record<string, string> = {
    Configuration: t("auth.errorPage.configuration"),
    AccessDenied: t("auth.errorPage.accessDenied"),
    Verification: t("auth.errorPage.verification"),
    OAuthSignin: t("auth.errorPage.oauthSignin"),
    OAuthCallback: t("auth.errorPage.oauthCallback"),
    OAuthAccountNotLinked: t("auth.errorPage.accountNotLinked"),
    CredentialsSignin: t("auth.errorPage.credentialsSignin"),
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {t("auth.errorPage.title")}
          </h1>
          <p className="text-gray-600 mb-6">
            {error && errorMessages[error]
              ? errorMessages[error]
              : t("auth.errorPage.generic")}
          </p>
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 break-all font-mono">
              Error code: {error}
              {errorDescription && (
                <div className="mt-2 pt-2 border-t border-red-200 text-red-600">
                  {decodeURIComponent(errorDescription)}
                </div>
              )}
            </div>
          )}
          {(error === "OAuthCallback" || error === "OAuthSignin") && (
            <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded text-left text-sm text-amber-800">
              <p className="font-semibold mb-2">{t("auth.errorPage.googleHintTitle")}</p>
              <p className="mb-2 text-xs font-semibold text-amber-900">{t("auth.errorPage.googleHintClient")}</p>
              <p className="mb-2 text-xs">{t("auth.errorPage.googleHintClientDesc")}</p>
              <ul className="list-disc list-inside space-y-0.5 text-xs mb-2">
                <li><strong>{t("auth.errorPage.googleHintLogin")}</strong></li>
                <li>{t("auth.errorPage.googleHintMeet")}</li>
              </ul>
              <p className="mb-1 text-xs font-semibold text-amber-900">{t("auth.errorPage.googleHintUri")}</p>
              <p className="mb-1 text-xs">{t("auth.errorPage.googleHintUriCorrect")} <code className="bg-green-100 px-0.5 rounded break-all">{typeof window !== "undefined" ? `${window.location.origin}/api/auth/callback/google` : "http://localhost:3020/api/auth/callback/google"}</code></p>
              <p className="mt-2 text-xs">{t("auth.errorPage.googleHintInstructions")}</p>
              <p className="mt-2 text-xs">{t("auth.errorPage.googleHintTerminal")}</p>
            </div>
          )}
          <div className="space-y-3">
            <Link
              href="/auth/signin"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-center"
            >
              {t("auth.errorPage.backToLogin")}
            </Link>
            <Link
              href="/"
              className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors text-center"
            >
              {t("auth.errorPage.backToTop")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  );
}
