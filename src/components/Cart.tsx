import { useStore } from '@/store';
import { useState } from 'react';
import { AddressModal } from './AddressModal';

interface Props {
    onContinueShopping: () => void;
    onProceedToDelivery: () => void;
}

export function Cart({ onContinueShopping, onProceedToDelivery }: Props) {
    const cart = useStore(state => state.cart);
    const sizeMaster = useStore(state => state.sizes);
    const optionsMaster = useStore(state => state.options);
    const fabricMaster = useStore(state => state.fabrics);
    const removeFromCart = useStore(state => state.removeFromCart);

    // Delivery & Shipping State
    const deliverySettings = useStore((state) => state.deliverySettings);
    const shippingAddresses = useStore((state) => state.shippingAddresses);
    const addShippingAddress = useStore((state) => state.addShippingAddress);
    const updateCartItemShipping = useStore((state) => state.updateCartItemShipping);

    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

    // Helper: Address Options
    const addressList = Object.values(shippingAddresses);

    // Totals Calculation
    const subtotal = cart.reduce((sum, item) => sum + item.price.totalPrice, 0);

    // Calculate Surcharge Per Item
    const totalSurcharge = cart.reduce((sum, item) => {
        if (item.shipping?.deliveryMode === 'rush') {
            return sum + Math.floor(item.price.totalPrice * deliverySettings.rushSurchargeRate);
        }
        return sum;
    }, 0);

    const grandTotal = subtotal + totalSurcharge;
    const tax = Math.floor(grandTotal * 0.1);
    const totalWithTax = grandTotal + tax;

    // Validation
    const allItemsHaveAddress = cart.every(item => !!item.shipping?.addressId);

    // Check for Quote Items
    const hasQuoteItem = cart.some(item => item.price.quoteRequired);

    // Shipment Date Helper
    const getShipmentDate = (businessDays: number) => {
        const date = new Date();
        const currentHour = date.getHours();

        let startLag = 0;
        // If after 12:00, shipment is calculated from next day (+1 lag)
        if (currentHour >= 12) {
            startLag = 1;
        }

        // Move to start date
        date.setDate(date.getDate() + startLag);

        let added = 0;
        // Add business days
        while (added < businessDays) {
            date.setDate(date.getDate() + 1);
            // Skip Sunday (0) and Saturday (6)
            if (date.getDay() !== 0 && date.getDay() !== 6) {
                added++;
            }
        }
        return date;
    };

    const handlePrint = () => {
        window.print();
    };


    const handleCheckout = async () => {
        const isDemoMode = import.meta.env.VITE_DEV_MODE === 'true';

        // Quote Required Flow
        if (cart.some(item => item.price.quoteRequired)) {
            const subject = encodeURIComponent("【お見積もり依頼】規定外サイズについて");
            const body = encodeURIComponent(`
以下の内容で見積もりを依頼します。

${cart.map((item, i) => `
[商品${i + 1}]
サイズ: ${item.specs.size === 'custom' ? `カスタム ${item.specs.customDimensions?.width}x${item.specs.customDimensions?.height}cm` : item.specs.size}
生地: ${item.specs.fabric}
枚数: ${item.specs.quantity}
オプション: ${item.specs.options.join(', ')}
`).join('\n')}
`);
            window.location.href = `mailto:info@example.com?subject=${subject}&body=${body}`;
            return;
        }

        if (!allItemsHaveAddress) {
            alert("すべての商品の配送先を選択してください。");
            return;
        }

        if (isDemoMode) {
            // Proceed to dummy checkout / final confirm
            onProceedToDelivery();
        } else {
            onProceedToDelivery();
        }
    };

    if (cart.length === 0) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                <div className="mb-6">
                    <svg className="w-24 h-24 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">カートは空です</h2>
                <p className="text-gray-500 mb-8">商品を選んで見積もりを作成してください。</p>
                <button
                    onClick={onContinueShopping}
                    className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
                >
                    商品一覧へ戻る
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 print:hidden">カート・見積もり確認</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Cart Items List */}
                <div className="flex-1 space-y-6">
                    {cart.map(item => {
                        const sizeName = item.specs.size === 'custom'
                            ? `カスタム (${item.specs.customDimensions?.width}x${item.specs.customDimensions?.height}cm)`
                            : sizeMaster[item.specs.size]?.displayName;

                        const fabricName = fabricMaster[item.specs.fabric]?.displayName;

                        // Current Item Logic
                        const assignedAddress = shippingAddresses[item.shipping?.addressId || ''];
                        const isRush = item.shipping?.deliveryMode === 'rush';
                        const arrivalDate = getShipmentDate(isRush ? deliverySettings.rushDays : deliverySettings.standardDays);

                        return (
                            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden print:hidden">
                                {/* Product Info Header */}
                                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-6">
                                    <div className="w-full sm:w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <span className="text-2xl">🚩</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">のぼり旗</h3>
                                                <p className="text-sm text-gray-500">{sizeName} / {fabricName}</p>
                                                <div className="text-sm text-gray-600 mt-1">
                                                    {item.specs.options.length > 0 ? (
                                                        <span>Op: {item.specs.options.map(oid => optionsMaster[oid]?.name).join(', ')}</span>
                                                    ) : <span className="text-gray-400">オプションなし</span>}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                {item.price.quoteRequired ? (
                                                    <div className="text-xl font-bold text-orange-600">別途お見積もり</div>
                                                ) : (
                                                    <>
                                                        <div className="text-xl font-bold">¥{item.price.totalPrice.toLocaleString()}</div>
                                                        <div className="text-sm text-gray-500">単価: ¥{item.price.unitPrice.toLocaleString()} × {item.specs.quantity}枚</div>
                                                        {item.price.designFee > 0 && (
                                                            <div className="text-xs text-blue-600 font-bold mt-1">
                                                                + デザイン制作費: ¥{item.price.designFee.toLocaleString()}
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Shipping Configuration for this Item */}
                                <div className="p-4 bg-gray-50 flex flex-col md:flex-row gap-4 items-start md:items-center">
                                    <div className="flex-1 w-full">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">お届け先</label>
                                        <div className="relative">
                                            <select
                                                className={`w-full p-3 pr-8 rounded-lg border-2 appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition
                                                    ${!item.shipping?.addressId ? 'border-red-300 bg-red-50 text-red-500' : 'border-gray-200 bg-white text-gray-900'}
                                                `}
                                                value={item.shipping?.addressId || ''}
                                                onChange={(e) => {
                                                    if (e.target.value === 'NEW') {
                                                        // Open Modal
                                                        setIsAddressModalOpen(true);
                                                    } else {
                                                        updateCartItemShipping(item.id, {
                                                            ...item.shipping!, // preserve valid keys
                                                            addressId: e.target.value,
                                                            deliveryMode: item.shipping?.deliveryMode || 'standard'
                                                        });
                                                    }
                                                }}
                                            >
                                                <option value="">(選択してください)</option>
                                                {addressList.map(addr => (
                                                    <option key={addr.id} value={addr.id}>
                                                        {addr.name} ({addr.city})
                                                    </option>
                                                ))}
                                                <option value="NEW" className="font-bold text-blue-600">+ 新しいお届け先を追加</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
                                        {assignedAddress && (
                                            <div className="mt-2 text-xs text-gray-600 ml-1">
                                                〒{assignedAddress.postalCode} {assignedAddress.prefecture}{assignedAddress.city}{assignedAddress.address1}
                                            </div>
                                        )}
                                    </div>

                                    <div className="w-full md:w-auto flex flex-col items-end">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block w-full text-right">配送プラン</label>
                                        <div className="flex bg-white rounded-lg p-1 border border-gray-200">
                                            <button
                                                onClick={() => updateCartItemShipping(item.id, { ...item.shipping, deliveryMode: 'standard' })}
                                                className={`px-4 py-2 rounded-md text-sm font-bold transition flex flex-col items-center
                                                    ${!isRush ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}
                                                `}
                                            >
                                                <span>通常便</span>
                                                <span className="text-[10px] font-normal">¥0</span>
                                            </button>
                                            <button
                                                onClick={() => updateCartItemShipping(item.id, { ...item.shipping, deliveryMode: 'rush' })}
                                                className={`px-4 py-2 rounded-md text-sm font-bold transition flex flex-col items-center
                                                    ${isRush ? 'bg-orange-100 text-orange-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}
                                                `}
                                            >
                                                <div className="flex items-center space-x-1">
                                                    <span>お急ぎ</span>
                                                    <span className="text-[10px] bg-white px-1 rounded-sm shadow-sm border border-orange-200">
                                                        +{Math.floor(deliverySettings.rushSurchargeRate * 100)}%
                                                    </span>
                                                </div>
                                                <span className="text-[10px] font-normal">+¥{Math.floor(item.price.totalPrice * deliverySettings.rushSurchargeRate).toLocaleString()}</span>
                                            </button>
                                        </div>
                                        <div className="mt-2 text-xs text-right text-gray-500">
                                            出荷予定: <span className="font-bold text-gray-900">{arrivalDate.getMonth() + 1}/{arrivalDate.getDate()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Item Delete */}
                                <div className="bg-gray-50 px-4 py-2 border-t border-gray-100 flex justify-end">
                                    <button
                                        onClick={() => {
                                            if (window.confirm('本当に削除しますか？')) {
                                                removeFromCart(item.id);
                                            }
                                        }}
                                        className="text-red-400 text-xs hover:text-red-600 hover:underline"
                                    >
                                        カートから削除
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    <button
                        onClick={onContinueShopping}
                        className="text-blue-600 font-medium hover:underline print:hidden block mt-4"
                    >
                        ← お見積もり・買い物を続ける
                    </button>
                </div>

                {/* Right Panel: Totals */}
                <div className="w-full lg:w-96 print:hidden">
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 sticky top-24">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">合計金額</h3>
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-gray-600">商品点数</span>
                            <span className="font-bold">{cart.length}点</span>
                        </div>

                        <div className="flex justify-between items-end mb-2 text-sm">
                            <span className="text-gray-600">小計</span>
                            <span className="font-medium">¥{subtotal.toLocaleString()}</span>
                        </div>
                        {totalSurcharge > 0 && (
                            <div className="flex justify-between items-end mb-4 text-sm text-orange-600">
                                <span className="flex items-center">オプション配送料 (お急ぎ)</span>
                                <span className="font-bold">+¥{totalSurcharge.toLocaleString()}</span>
                            </div>
                        )}

                        <div className="border-t border-dashed border-gray-200 my-4"></div>

                        <div className="flex justify-between items-end mb-8">
                            <span className="text-gray-600">お支払い合計 (税込)</span>
                            <span className="text-3xl font-black text-gray-900">
                                {hasQuoteItem ? (
                                    <span className="text-2xl text-orange-600">要別途お見積もり</span>
                                ) : (
                                    `¥${totalWithTax.toLocaleString()}`
                                )}
                            </span>
                        </div>

                        {hasQuoteItem && (
                            <div className="mb-4 text-sm text-orange-600 font-bold bg-orange-50 p-3 rounded-lg border border-orange-200">
                                ※ 規定外サイズを含むため、合計金額は別途お見積もりとなります。
                                「見積もり依頼」として送信してください。
                            </div>
                        )}

                        <div className="space-y-3">
                            <button
                                onClick={handlePrint}
                                className="w-full py-4 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-700 transition flex items-center justify-center space-x-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                <span>見積書を発行 (PDF)</span>
                            </button>

                            <button
                                onClick={handleCheckout}
                                disabled={!hasQuoteItem && !allItemsHaveAddress}
                                className={`w-full py-4 rounded-xl font-bold shadow-lg transform transition flex items-center justify-center
                                    ${(!hasQuoteItem && !allItemsHaveAddress)
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-0.5'
                                    }
                                `}
                            >
                                {hasQuoteItem ? '見積もりを依頼する' : '注文手続きへ進む'}
                            </button>
                            {!allItemsHaveAddress && !hasQuoteItem && (
                                <p className="text-xs text-red-500 text-center mt-2">
                                    ※ すべての商品にお届け先を指定してください
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ---------------- Print Layout (Visible only on Print) ---------------- */}
            <div className="hidden print:block p-8 bg-white text-black">
                <div className="border-b-2 border-gray-800 pb-4 mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">御見積書</h1>
                        <p className="text-sm">No. {Math.random().toString(36).substring(2, 8).toUpperCase()}</p>
                    </div>
                    <div className="text-right text-sm">
                        <p>発行日: {new Date().toLocaleDateString()}</p>
                        <p className="font-bold text-lg mt-2">株式会社サンプル 様</p>
                    </div>
                </div>

                <table className="w-full mb-8 border-collapse">
                    <thead>
                        <tr className="border-b-2 border-gray-400">
                            <th className="py-2 text-left">品名・仕様</th>
                            <th className="py-2 text-center">数量</th>
                            <th className="py-2 text-center">配送・送料</th>
                            <th className="py-2 text-right">単価</th>
                            <th className="py-2 text-right">金額</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cart.map((item, idx) => {
                            const sizeName = item.specs.size === 'custom'
                                ? `カスタムサイズ (${item.specs.customDimensions?.width}x${item.specs.customDimensions?.height}cm)`
                                : sizeMaster[item.specs.size]?.displayName;
                            const fabricName = fabricMaster[item.specs.fabric]?.displayName;
                            const optionsList = item.specs.options.length > 0
                                ? item.specs.options.map(oid => optionsMaster[oid]?.name).join(', ')
                                : 'なし';

                            const isRush = item.shipping?.deliveryMode === 'rush';
                            const surcharge = isRush ? Math.floor(item.price.totalPrice * deliverySettings.rushSurchargeRate) : 0;
                            const subtotal = item.price.totalPrice + surcharge;

                            return (
                                <tr key={idx} className="border-b border-gray-200">
                                    <td className="py-4">
                                        <div className="font-bold">のぼり旗</div>
                                        <div className="text-sm text-gray-600">
                                            サイズ: {sizeName}<br />
                                            生地: {fabricName}<br />
                                            オプション: {optionsList}
                                            {item.price.designFee > 0 && (
                                                <div className="mt-1 font-bold">
                                                    (デザイン制作費 ¥{item.price.designFee.toLocaleString()} 含む)
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-4 text-center">{item.specs.quantity}</td>
                                    <td className="py-4 text-center text-sm">
                                        {isRush ? (
                                            <>
                                                <div className="font-bold text-orange-700">お急ぎ便</div>
                                                <div className="text-xs">+¥{surcharge.toLocaleString()}</div>
                                            </>
                                        ) : "通常便"}
                                    </td>
                                    <td className="py-4 text-right">
                                        {item.price.quoteRequired ? '要見積' : `¥${item.price.unitPrice.toLocaleString()}`}
                                    </td>
                                    <td className="py-4 text-right font-medium">
                                        {item.price.quoteRequired ? '別途お見積もり' : `¥${subtotal.toLocaleString()}`}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan={3}></td>
                            <td className="py-4 text-right font-bold text-lg">合計金額 (税込)</td>
                            <td className="py-4 text-right font-bold text-2xl border-b-2 border-gray-800">
                                {hasQuoteItem ? '別途お見積もり' : `¥${totalWithTax.toLocaleString()}`}
                            </td>
                        </tr>
                        {hasQuoteItem && (
                            <tr>
                                <td colSpan={5} className="py-2 text-right text-sm text-red-600">
                                    ※ 規定サイズ超過の商品が含まれるため、金額は別途ご連絡いたします。
                                </td>
                            </tr>
                        )}
                    </tfoot>
                </table>

                <div className="mt-12 text-sm text-gray-500">
                    <p>※ 本見積書の有効期限は発行から2週間です。</p>
                    <p>※ 実際の製造にあたって、データ入稿が必要となります。</p>
                </div>
            </div >

            <AddressModal
                isOpen={isAddressModalOpen}
                onClose={() => setIsAddressModalOpen(false)}
                onSave={(newAddress) => {
                    addShippingAddress(newAddress);
                    // If triggered from specific item, assign immediately?
                    // Optional convenience:
                    // if (targetItemId) { 
                    //    const item = cart.find(i => i.id === targetItemId);
                    //    if(item) updateCartItemShipping(targetItemId, { ...item.shipping!, addressId: newAddress.id });
                    // }
                    // User might want to reuse this address for multiple items, so just adding to list is safer standard behavior,
                    // but auto-selecting the just-created address is good UX.
                    // Let's Find all items with NO address and assign this new one? No, that's magic.
                    // Just add to list. 
                }}
            />
        </div >
    );
}
