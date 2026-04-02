"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import PageLoading from "@/components/PageLoading";
import { Download, QrCode, X } from "lucide-react";
import ParticipantQRScanner from "@/components/events/ParticipantQRScanner";
import { useTranslation } from "@/lib/i18n/context";

export default function CheckinPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session, status } = useSession();
    const { t } = useTranslation();
    const [participants, setParticipants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [eventTitle, setEventTitle] = useState("");
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [showScanner, setShowScanner] = useState(false);

    const fetchEventAndParticipants = useCallback(async () => {
        try {
            const eventRes = await fetch(`/api/events/${params.id}`);
            if (eventRes.ok) {
                const eventData = await eventRes.json();
                setEventTitle(eventData.title);
            }

            const res = await fetch(`/api/events/${params.id}/participants`);
            if (res.ok) {
                const data = await res.json();
                setParticipants(data);
            } else {
                console.error("Failed to fetch participants");
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }, [params.id]);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push(`/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
            return;
        }

        if (params.id && session?.user) {
            fetchEventAndParticipants();
        }
    }, [fetchEventAndParticipants, params.id, router, session, status]);

    const handleCheckin = async (participantId: string) => {
        setProcessingId(participantId);
        try {
            const res = await fetch(`/api/events/${params.id}/checkin`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ participantId }),
            });

            if (res.ok) {
                const data = await res.json();
                alert(t("admin.checkin.checkinSuccess", { points: data.pointsAwarded }));
                fetchEventAndParticipants();
            } else {
                const error = await res.json().catch(() => ({}));
                alert(t("admin.checkin.error", { error: error.error || "不明なエラー" }));
            }
        } catch (error) {
            console.error("Error checking in:", error);
            alert(t("admin.checkin.errorGeneric"));
        } finally {
            setProcessingId(null);
        }
    };

    const handleExportCSV = async () => {
        setIsExporting(true);
        try {
            const res = await fetch(`/api/events/${params.id}/participants/export`);
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `participants_${eventTitle}_${new Date().toISOString().split("T")[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            } else {
                alert(t("admin.checkin.exportFailed"));
            }
        } catch (error) {
            console.error("Error exporting:", error);
            alert(t("admin.checkin.exportFailed"));
        } finally {
            setIsExporting(false);
        }
    };

    const handleQRScan = async (userId: string) => {
        const participant = participants.find(p => p.user.id === userId);

        if (participant) {
            if (participant.status === "ATTENDED" || participant.status === "COMPLETED") {
                alert(t("admin.checkin.alreadyCheckedIn"));
            } else {
                handleCheckin(participant.id);
            }
        } else {
            alert(t("admin.checkin.participantNotFound"));
        }
    };

    if (loading) {
        return <PageLoading showHeader={false} />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <Link
                        href={`/events/${params.id}`}
                        className="text-blue-600 hover:underline mb-2 inline-block"
                    >
                        {t("admin.checkin.backToEvent")}
                    </Link>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <h1 className="text-2xl font-bold text-gray-900">
                            {t("admin.checkin.title", { title: eventTitle })}
                        </h1>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowScanner(true)}
                                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <QrCode className="w-4 h-4" />
                                {t("admin.checkin.qrScan")}
                            </button>
                            <button
                                onClick={handleExportCSV}
                                disabled={isExporting}
                                className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                <Download className="w-4 h-4" />
                                {isExporting ? t("admin.checkin.exporting") : t("admin.checkin.csvDownload")}
                            </button>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {t("admin.checkin.participantCount", { count: participants.length })} / {t("admin.checkin.checkedInCount", { count: participants.filter(p => p.status === "ATTENDED" || p.status === "COMPLETED").length })}
                    </p>
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {t("admin.checkin.colParticipant")}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {t("admin.checkin.colStatus")}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {t("admin.checkin.colAction")}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {participants.map((p) => (
                                <tr key={p.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                {p.user.image ? (
                                                    <Image
                                                        className="h-10 w-10 rounded-full"
                                                        src={p.user.image}
                                                        alt=""
                                                        width={40}
                                                        height={40}
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                        <span className="text-gray-600 font-medium">
                                                            {p.user.name?.[0] || "?"}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {p.user.name || t("admin.checkin.anonymous")}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {p.user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${p.status === "ATTENDED" || p.status === "COMPLETED"
                                                ? "bg-green-100 text-green-800"
                                                : "bg-yellow-100 text-yellow-800"
                                                }`}
                                        >
                                            {p.status === "ATTENDED" || p.status === "COMPLETED" ? t("admin.checkin.checkedIn") : t("admin.checkin.scheduled")}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {p.status !== "ATTENDED" && p.status !== "COMPLETED" ? (
                                            <button
                                                onClick={() => handleCheckin(p.id)}
                                                disabled={processingId === p.id}
                                                className="text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-md disabled:bg-gray-400"
                                            >
                                                {processingId === p.id ? t("admin.checkin.processing") : t("admin.checkin.checkinButton")}
                                            </button>
                                        ) : (
                                            <span className="text-gray-400">{t("admin.checkin.completed")}</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {participants.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                                        {t("admin.checkin.noParticipants")}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* QR Scanner Modal */}
            <ParticipantQRScanner
                isOpen={showScanner}
                onClose={() => setShowScanner(false)}
                onScan={handleQRScan}
            />
        </div>
    );
}
