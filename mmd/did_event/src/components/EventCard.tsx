"use client";

import Link from "next/link";
import Image from "next/image";
import ShareButton from "@/components/ShareButton";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
    startAt: string;
    endAt: string | null;
    location: string | null;
    format: string | null;
    onlineUrl: string | null;
    capacity: number | null;
    tickets?: { price: number }[];
    owner: {
      id: string;
      name: string | null;
      image: string | null;
    } | null;
    _count: {
      participants: number;
    };
  };
  compact?: boolean;
  isJoined?: boolean;
  isOwner?: boolean;
  /** 紹介用 ref パラメータに付与するユーザーID（ログイン時） */
  referrerId?: string | null;
}

export default function EventCard({ event, compact = false, isJoined = false, isOwner = false, referrerId }: EventCardProps) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden group block relative"
    >
      {/* Share (icon only) - stop propagation so clicking doesn't navigate */}
      <div
        className="absolute top-2 right-2 z-10"
        onClick={(e) => e.preventDefault()}
      >
        <div onClick={(e) => e.stopPropagation()}>
          <ShareButton
            url={`/events/${event.id}`}
            title={event.title}
            description={event.description ? event.description.replace(/<[^>]*>?/gm, "").slice(0, 100) : undefined}
            referrerId={referrerId ?? undefined}
            iconOnly
          />
        </div>
      </div>

      {/* Image */}
      <div className={`relative ${compact ? 'h-32' : 'h-48'} bg-gradient-to-br from-indigo-500 to-indigo-600 overflow-hidden`}>
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className={`${compact ? 'w-10 h-10' : 'w-16 h-16'} text-white opacity-50`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={compact ? 'p-3' : 'p-5'}>
        <h3 className={`${compact ? 'text-sm' : 'text-xl'} font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1`}>
          {event.title}
        </h3>

        {!compact && event.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 whitespace-pre-line">
            {event.description.replace(/<[^>]*>?/gm, "")}
          </p>
        )}

        {/* Event Info */}
        <div className="space-y-2">
          {/* Date */}
          <div className="flex items-center text-sm text-gray-500">
            <svg
              className="w-4 h-4 mr-2 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="truncate">
              {new Date(event.startAt).toLocaleDateString("ja-JP", {
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          {/* Location - Hide in compact if needed, but let's keep it minimal */}
          {/* Location / Online URL */}
          {(event.format === 'offline' || event.format === 'hybrid') && event.location && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center text-sm text-gray-500 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              <svg
                className="w-4 h-4 mr-2 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="truncate">{event.location}</span>
            </a>
          )}

          {/* Online URL Display */}
          {(event.format === 'online' || event.format === 'hybrid') && (
            <div className="flex items-start text-sm text-gray-500 mt-1">
              <svg
                className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <div className="truncate max-w-full">
                {(isJoined || isOwner) ? (
                  event.onlineUrl ? (
                    <a
                      href={event.onlineUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline hover:text-indigo-800"
                      onClick={(e) => e.stopPropagation()}
                    >
                      オンライン会場へ
                    </a>
                  ) : (
                    <span className="text-gray-400">URL未設定</span>
                  )
                ) : (
                  <span className="text-gray-400 italic">参加後に公開</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!compact && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            {/* Format & Price Badges */}
            <div className="flex flex-wrap gap-2 mb-3">
              {/* Format Badge */}
              <span className={`px-2 py-0.5 rounded text-xs font-medium border ${event.format === 'online'
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                : event.format === 'hybrid'
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : 'bg-gray-50 text-gray-700 border-gray-200'
                }`}>
                {event.format === 'online' ? 'オンライン' : event.format === 'hybrid' ? 'ハイブリッド' : 'オフライン'}
              </span>

              {/* Price Badge */}
              <span className={`px-2 py-0.5 rounded text-xs font-medium border ${(event.tickets && event.tickets.some(t => t.price > 0))
                ? 'bg-orange-50 text-orange-700 border-orange-200'
                : 'bg-green-50 text-green-700 border-green-200'
                }`}>
                {(event.tickets && event.tickets.some(t => t.price > 0)) ? '有料' : '無料'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {event.owner?.image && (
                <img
                  src={event.owner.image}
                  alt={event.owner.name || "主催者"}
                  className="w-6 h-6 rounded-full"
                />
              )}
              <span className="text-xs text-gray-500">
                {event.owner?.name || "匿名"}
              </span>
            </div>

            {/* Action Button/Text */}
            {isOwner ? (
              <Link
                href={`/events/${event.id}/edit`}
                className="z-10 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-full transition-colors"
              >
                編集する
              </Link>
            ) : isJoined ? (
              <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                参加済み
              </span>
            ) : (
              <span className="text-xs text-indigo-600 font-medium group-hover:translate-x-1 transition-transform">
                参加する →
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
