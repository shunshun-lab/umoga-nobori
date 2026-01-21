
import { useState, useEffect } from 'react';

const BANNERS = [
    'https://placehold.co/1200x400/2563eb/white?text=Campaign+1',
    'https://placehold.co/1200x400/dc2626/white?text=Campaign+2',
    'https://placehold.co/1200x400/16a34a/white?text=Campaign+3',
];

export function BannerSlider() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % BANNERS.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative w-full aspect-[3/1] md:aspect-[4/1] overflow-hidden rounded-2xl shadow-lg bg-gray-100">
            {BANNERS.map((banner, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out
            ${index === currentIndex ? 'opacity-100' : 'opacity-0'}
          `}
                >
                    <img
                        src={banner}
                        alt={`Banner ${index + 1}`}
                        className="w-full h-full object-cover"
                    />
                </div>
            ))}

            {/* Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {BANNERS.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-3 h-3 rounded-full transition-all
              ${index === currentIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'}
            `}
                    />
                ))}
            </div>

            {/* Controls */}
            <button
                onClick={() => setCurrentIndex((prev) => (prev - 1 + BANNERS.length) % BANNERS.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button
                onClick={() => setCurrentIndex((prev) => (prev + 1) % BANNERS.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
        </div>
    );
}
