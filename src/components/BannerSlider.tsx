import { useState, useEffect } from 'react';
import { uiConfigService } from '@/utils/uiConfigService';
import type { BannerItem } from '@/utils/uiConfigTypes';

// フォールバック用のプレースホルダーバナー
const FALLBACK_BANNERS: BannerItem[] = [
    {
        id: 'fallback-1',
        imageUrl: 'https://placehold.co/1200x750/2563eb/white?text=Campaign+1',
        sortOrder: 1,
        active: true,
    },
    {
        id: 'fallback-2',
        imageUrl: 'https://placehold.co/1200x750/dc2626/white?text=Campaign+2',
        sortOrder: 2,
        active: true,
    },
    {
        id: 'fallback-3',
        imageUrl: 'https://placehold.co/1200x750/16a34a/white?text=Campaign+3',
        sortOrder: 3,
        active: true,
    },
];

export function BannerSlider() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [banners, setBanners] = useState<BannerItem[]>(FALLBACK_BANNERS);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const config = await uiConfigService.loadUiConfig();
                if (!mounted) return;
                const active = (config.banners || [])
                    .filter((b) => b.active)
                    .sort((a, b) => a.sortOrder - b.sortOrder);
                if (active.length > 0) {
                    setBanners(active);
                    setCurrentIndex(0);
                }
            } catch {
                // 読み込み失敗時はフォールバックのまま
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        if (banners.length === 0) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [banners.length]);

    if (banners.length === 0) {
        return null;
    }

    return (
        <div className="relative w-full aspect-[8/5] overflow-hidden rounded-2xl shadow-lg bg-gray-100">
            {banners.map((banner, index) => (
                <div
                    key={banner.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out
            ${index === currentIndex ? 'opacity-100' : 'opacity-0'}
          `}
                >
                    {banner.linkUrl ? (
                        <a href={banner.linkUrl}>
                            <img
                                src={banner.imageUrl}
                                alt={banner.id}
                                className="w-full h-full object-cover"
                            />
                        </a>
                    ) : (
                        <img
                            src={banner.imageUrl}
                            alt={banner.id}
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>
            ))}

            {/* Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {banners.map((b, index) => (
                    <button
                        key={b.id}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-3 h-3 rounded-full transition-all
              ${index === currentIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'}
            `}
                    />
                ))}
            </div>

            {/* Controls */}
            <button
                onClick={() => setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button
                onClick={() => setCurrentIndex((prev) => (prev + 1) % banners.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
        </div>
    );
}

