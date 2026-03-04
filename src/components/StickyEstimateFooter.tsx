import { useState } from 'react';
import type { PriceBreakdown, NoboriSpecs } from '@/types/nobori.types';
import { SIZES, FABRICS } from '@/utils/constants';

interface Props {
    price: PriceBreakdown;
    specs: NoboriSpecs;
    onOpenDetail: () => void;
    onAddToCart: () => void;
    disabled: boolean;
}

const WEEKDAY_NAMES = ['日', '月', '火', '水', '木', '金', '土'];

function getDeliveryDateStr(rushSchedule: boolean) {
    const base = new Date();
    const days = rushSchedule ? 3 : 7;
    base.setDate(base.getDate() + days);
    return `${base.getMonth() + 1}/${base.getDate()}(${WEEKDAY_NAMES[base.getDay()]})`;
}

export function StickyEstimateFooter({ price, specs, onOpenDetail, onAddToCart, disabled }: Props) {
    const [showSummary, setShowSummary] = useState(false);

    const sizeName = specs.size === 'custom' ? 'カスタム' : (SIZES[specs.size]?.name || specs.size);
    const fabricName = FABRICS[specs.fabric]?.name || specs.fabric;
    const optionLabel = specs.options.length > 0 ? `${specs.options.length}件` : 'なし';

    const scrollTo = (id: string) => {
        setShowSummary(false);
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <>
            {/* Specs summary panel */}
            {showSummary && (
                <div className="fixed bottom-[72px] left-0 right-0 z-40 lg:hidden animate-slideUp">
                    <div className="bg-white border-t border-gray-200 shadow-lg rounded-t-2xl max-w-7xl mx-auto">
                        <div className="p-4 space-y-0 divide-y divide-gray-100">
                            <div className="flex items-center justify-between py-3">
                                <span className="text-sm text-gray-500">サイズ</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-900">{sizeName}</span>
                                    <button onClick={() => scrollTo('size')} className="text-xs text-blue-600 hover:underline">変更</button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between py-3">
                                <span className="text-sm text-gray-500">生地</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-900">{fabricName}</span>
                                    <button onClick={() => scrollTo('fabric')} className="text-xs text-blue-600 hover:underline">変更</button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between py-3">
                                <span className="text-sm text-gray-500">オプション</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-900">{optionLabel}</span>
                                    <button onClick={() => scrollTo('options')} className="text-xs text-blue-600 hover:underline">変更</button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between py-3">
                                <span className="text-sm text-gray-500">数量</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-900">{specs.quantity}枚</span>
                                    <button onClick={() => scrollTo('quantity')} className="text-xs text-blue-600 hover:underline">変更</button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between py-3">
                                <span className="text-sm text-gray-500">お届け予定日</span>
                                <span className="font-bold text-gray-900">
                                    {getDeliveryDateStr(specs.rushSchedule || false)} 頃
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer bar */}
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
                            onClick={() => setShowSummary(!showSummary)}
                            className={`p-2 rounded-lg transition-colors ${showSummary ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                            aria-label="仕様を表示"
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

            {/* Backdrop for summary */}
            {showSummary && (
                <div
                    className="fixed inset-0 z-30 lg:hidden"
                    onClick={() => setShowSummary(false)}
                />
            )}
        </>
    );
}
