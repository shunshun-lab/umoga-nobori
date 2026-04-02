"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslation } from "@/lib/i18n/context";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { t } = useTranslation();

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=%2Fprofile");
    } else if (session?.user) {
      router.replace(`/users/${(session.user as any).id}`);
    }
  }, [status, session, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-bold">{t("profile.redirecting")}</p>
      </div>
    </div>
  );
}
