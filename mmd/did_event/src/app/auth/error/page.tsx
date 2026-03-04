// src/app/auth/error/page.tsx
"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description") || undefined;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            認証エラー
          </h1>
          <p className="text-gray-600 mb-6">
            {error === "Configuration"
              ? "認証設定に問題があります。管理者に連絡してください。"
              : error === "AccessDenied"
                ? "アクセスが拒否されました。"
                : error === "Verification"
                  ? "認証トークンの検証に失敗しました。"
                  : error === "OAuthSignin"
                    ? "ログインの開始に失敗しました。Googleの場合はリダイレクトURI、LINEの場合はチャネル設定を確認してください。"
                    : error === "OAuthCallback"
                      ? "Google/LINEからのコールバック処理中にエラーが発生しました。"
                      : error === "OAuthAccountNotLinked"
                        ? "このメールアドレスは既に別の方法（Google等）で登録されています。元のログイン方法を試すか、管理者にお問い合わせください。"
                        : error === "CredentialsSignin"
                          ? "電話認証のサーバー確認に失敗しました。認証コードが正しくないか、時間が経過しすぎている可能性があります。"
                          : `エラーが発生しました。`}
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
              <p className="font-semibold mb-2">考えられる原因（Googleログインの場合）</p>
              <p className="mb-2 text-xs font-semibold text-amber-900">① どのOAuthクライアントに登録しましたか？</p>
              <p className="mb-2 text-xs">このアプリにはGoogleのOAuthクライアントが<strong>2種類</strong>あります。リダイレクトURIは<strong>ログイン用</strong>のクライアントに追加する必要があります。</p>
              <ul className="list-disc list-inside space-y-0.5 text-xs mb-2">
                <li><strong>ログイン用</strong>（ここに追加）: 環境変数 <code className="bg-amber-100 px-0.5 rounded">GOOGLE_CLIENT_ID</code> に対応するクライアント（NextAuthが使用）</li>
                <li>Meet用（ここには不要）: <code className="bg-amber-100 px-0.5 rounded">GOOGLE_MEET_CLIENT_ID</code> は別のクライアントです</li>
              </ul>
              <p className="mb-1 text-xs font-semibold text-amber-900">② 登録するURI</p>
              <p className="mb-1 text-xs">正しいURI: <code className="bg-green-100 px-0.5 rounded break-all">{typeof window !== "undefined" ? `${window.location.origin}/api/auth/callback/google` : "http://localhost:3020/api/auth/callback/google"}</code></p>
              <p className="mt-2 text-xs">Google Cloud Console で「認証情報」を開き、<strong>GOOGLE_CLIENT_ID の値と一致する</strong>OAuth 2.0 クライアントを選び、その「承認済みのリダイレクト URI」に上記を追加してください。</p>
              <p className="mt-2 text-xs">まだエラーになる場合は、<code className="bg-amber-100 px-0.5 rounded">npm run dev</code> を実行している<strong>ターミナル</strong>のログを確認してください。コールバック直前にエラー内容が出力されていることがあります。</p>
            </div>
          )}
          <div className="space-y-3">
            <a
              href="/auth/signin"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              ログインページに戻る
            </a>
            <a
              href="/"
              className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              トップページに戻る
            </a>
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
