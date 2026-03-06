import type { PriceBreakdown, NoboriSpecs } from '@/types/nobori.types';
import { SIZES, FABRICS } from '@/utils/constants';
import { getShipDateLabel } from '@/utils/deliveryDate';

interface Props {
    price: PriceBreakdown;
    specs: NoboriSpecs;
    onOpenDetail: () => void;
    onAddToCart: () => void;
    disabled: boolean;
}

export function StickyEstimateFooter({ price, specs, onOpenDetail, onAddToCart, disabled }: Props) {
    const sizeName = specs.size === 'custom' ? 'カスタム' : (SIZES[specs.size]?.name || specs.size);
    const fabricName = FABRICS[specs.fabric]?.name || specs.fabric;
    const optionLabel = specs.options.length > 0 ? `${specs.options.length}件` : 'なし';

    const scrollTo = (id: string) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <>
            {/* Footer: specs summary + price bar (always visible) */}
            <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
                {/* Specs summary - always shown */}
                <div className="bg-white border-t border-gray-200 shadow-[0_-2px_8px_-2px_rgba(0,0,0,0.08)]">
                    <div className="max-w-7xl mx-auto px-4 py-2 space-y-0 divide-y divide-gray-100">
                        <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-gray-500">サイズ</span>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900">{sizeName}</span>
                                <button onClick={() => scrollTo('size')} className="text-xs text-blue-600 hover:underline">変更</button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-gray-500">生地</span>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900">{fabricName}</span>
                                <button onClick={() => scrollTo('fabric')} className="text-xs text-blue-600 hover:underline">変更</button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-gray-500">オプション</span>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900">{optionLabel}</span>
                                <button onClick={() => scrollTo('options')} className="text-xs text-blue-600 hover:underline">変更</button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-gray-500">数量</span>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900">{specs.quantity}枚</span>
                                <button onClick={() => scrollTo('quantity')} className="text-xs text-blue-600 hover:underline">変更</button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-gray-500">お届け予定日</span>
                            <span className="font-bold text-gray-900">
                                {getShipDateLabel({ rushSchedule: specs.rushSchedule || false, desiredShipDate: specs.desiredShipDate })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Price bar */}
                <div className="bg-white border-t border-gray-200 px-4 py-3">
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

                        <button
                            onClick={onAddToCart}
                            disabled={disabled}
                            className={`px-5 py-3 rounded-xl font-bold text-white shadow-md text-sm whitespace-nowrap transition-all
                                ${disabled
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-600 to-blue-500 active:scale-95'}`}
                        >
                            カートへ
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
