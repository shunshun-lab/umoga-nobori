import type { PriceBreakdown } from '@/types/nobori.types';

interface Props {
    price: PriceBreakdown;
    onOpenDetail: () => void;
    onAddToCart: () => void;
    disabled: boolean;
}

export function StickyEstimateFooter({ price, onOpenDetail, onAddToCart, disabled }: Props) {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 z-40 lg:hidden">
            <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
                <div className="flex-1 cursor-pointer" onClick={onOpenDetail}>
                    <div className="text-xs text-gray-500 font-bold mb-0.5">合計金額（税込）</div>
                    <div className="flex items-baseline space-x-2">
                        <span className="text-2xl font-black text-blue-600">
                            {price.quoteRequired ? '別途見積' : `¥${price.totalPrice.toLocaleString()}`}
                        </span>
                        {!price.quoteRequired && (
                            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                                1枚 {price.unitPrice.toLocaleString()}円
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onOpenDetail}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="詳細を表示"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>

                    <button
                        onClick={onAddToCart}
                        disabled={disabled}
                        className={`px-4 py-3 rounded-xl font-bold text-white shadow-md text-sm whitespace-nowrap transition-all
              ${disabled
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-blue-500 active:scale-95'}`}
                    >
                        カートへ
                    </button>
                </div>
            </div>
        </div>
    );
}
