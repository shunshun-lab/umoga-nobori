import { useStore } from '@/store';

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

    // Delivery State
    const deliverySettings = useStore((state) => state.deliverySettings);
    const cartDeliveryMode = useStore((state) => state.cartDeliveryMode);
    const setCartDeliveryMode = useStore((state) => state.setCartDeliveryMode);

    // Totals
    const subtotal = cart.reduce((sum, item) => sum + item.price.totalPrice, 0);

    // Surcharge Logic
    const surcharge = cartDeliveryMode === 'rush'
        ? Math.floor(subtotal * deliverySettings.rushSurchargeRate)
        : 0;

    const grandTotal = subtotal + surcharge;
    const tax = Math.floor(grandTotal * 0.1);
    const totalWithTax = grandTotal + tax;

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
            // Ideally we should also skip Holidays (Need a holiday list, but for now simple weekend skip)
            if (date.getDay() !== 0 && date.getDay() !== 6) {
                added++;
            }
        }
        return date;
    };

    const arrivalDate = getShipmentDate(
        cartDeliveryMode === 'rush' ? deliverySettings.rushDays : deliverySettings.standardDays
    );

    const handlePrint = () => {
        window.print();
    };

    const handleCheckout = async () => {
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

-------------
配送希望: ${cartDeliveryMode === 'rush' ? 'お急ぎ便' : '通常便'}
`);
            window.location.href = `mailto:info@example.com?subject=${subject}&body=${body}`;
            return;
        }
        // Standard Flow: Proceed to Delivery Entry
        onProceedToDelivery();
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

                        return (
                            <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-6 print:hidden">
                                <div className="w-full sm:w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span className="text-2xl">🚩</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">のぼり旗</h3>
                                            <p className="text-sm text-gray-500">{sizeName} / {fabricName}</p>
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

                                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                                        <div className="text-sm text-gray-600">
                                            {item.specs.options.length > 0 ? (
                                                <span>Op: {item.specs.options.map(oid => optionsMaster[oid]?.name).join(', ')}</span>
                                            ) : <span className="text-gray-400">オプションなし</span>}
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (window.confirm('本当に削除しますか？')) {
                                                    removeFromCart(item.id);
                                                }
                                            }}
                                            className="text-red-500 text-sm hover:underline"
                                        >
                                            削除
                                        </button>
                                    </div>
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

                {/* Action Panel */}
                <div className="w-full lg:w-96 print:hidden">
                    {/* Delivery Options */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
                        <h2 className="text-lg font-bold mb-4">配送方法</h2>

                        <div className="space-y-3">
                            <label className={`
                        relative flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all
                        ${cartDeliveryMode === 'standard' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
                    `}>
                                <input
                                    type="radio"
                                    name="delivery"
                                    className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                                    checked={cartDeliveryMode === 'standard'}
                                    onChange={() => setCartDeliveryMode('standard')}
                                />
                                <div className="ml-3 flex-1">
                                    <span className="block font-bold text-gray-900">通常便</span>
                                    <span className="block text-sm text-gray-500">
                                        {deliverySettings.standardDays}営業日後 発送
                                    </span>
                                </div>
                                <span className="font-bold text-gray-900">¥0</span>
                            </label>

                            <label className={`
                        relative flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all
                        ${cartDeliveryMode === 'rush' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}
                    `}>
                                <input
                                    type="radio"
                                    name="delivery"
                                    className="w-5 h-5 text-orange-600 focus:ring-orange-500"
                                    checked={cartDeliveryMode === 'rush'}
                                    onChange={() => setCartDeliveryMode('rush')}
                                />
                                <div className="ml-3 flex-1">
                                    <div className="flex items-center space-x-2">
                                        <span className="block font-bold text-gray-900">お急ぎ便</span>
                                        <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-bold">
                                            {(deliverySettings.rushSurchargeRate * 100).toFixed(0)}%割増
                                        </span>
                                    </div>
                                    <span className="block text-sm text-orange-800">
                                        {deliverySettings.rushDays}営業日後 発送
                                    </span>
                                </div>
                                <span className="font-bold text-orange-600">+¥{Math.floor(subtotal * deliverySettings.rushSurchargeRate).toLocaleString()}</span>
                            </label>
                        </div>


                        {/* Shipment Date Visualization */}
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">出荷予定日 (目安)</span>
                            </div>

                            <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
                                <div className="text-center font-bold text-gray-800 mb-2">
                                    {arrivalDate.getFullYear()}年 {arrivalDate.getMonth() + 1}月
                                </div>
                                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                                    {['日', '月', '火', '水', '木', '金', '土'].map(d => (
                                        <div key={d} className="text-gray-400 py-1">{d}</div>
                                    ))}
                                    {(() => {
                                        const year = arrivalDate.getFullYear();
                                        const month = arrivalDate.getMonth();
                                        const firstDay = new Date(year, month, 1);
                                        const lastDay = new Date(year, month + 1, 0);
                                        const daysInMonth = lastDay.getDate();
                                        const startDayOfWeek = firstDay.getDay();

                                        const days = [];
                                        for (let i = 0; i < startDayOfWeek; i++) {
                                            days.push(<div key={`empty-${i}`} className="p-1"></div>);
                                        }

                                        const today = new Date();

                                        for (let d = 1; d <= daysInMonth; d++) {
                                            const current = new Date(year, month, d);
                                            const isDate = current.toDateString() === arrivalDate.toDateString();
                                            const isToday = current.toDateString() === today.toDateString();

                                            let className = "h-8 flex items-center justify-center rounded-full text-xs text-gray-600";

                                            if (isDate) {
                                                className = "h-8 flex flex-col items-center justify-center rounded-lg bg-blue-600 text-white font-bold shadow-md transform scale-110 z-10";
                                            } else if (isToday) {
                                                className = "h-8 flex items-center justify-center rounded-full bg-gray-200 font-bold border border-gray-300";
                                            }

                                            days.push(
                                                <div key={d} className={className}>
                                                    {isDate ? (
                                                        <>
                                                            <span className="text-[9px] leading-none">出荷</span>
                                                            <span className="leading-none">{d}</span>
                                                        </>
                                                    ) : d}
                                                </div>
                                            );
                                        }
                                        return days;
                                    })()}
                                </div>
                                <div className="mt-3 text-center border-t border-gray-100 pt-2">
                                    <span className="block text-xs text-gray-500">出荷予定</span>
                                    <span className="text-xl font-bold text-blue-600">
                                        {arrivalDate.getMonth() + 1}/{arrivalDate.getDate()}
                                        <span className="text-sm font-normal text-gray-500 ml-1">
                                            ({['日', '月', '火', '水', '木', '金', '土'][arrivalDate.getDay()]})
                                        </span>
                                    </span>
                                </div>
                            </div>

                            <div className="mt-3 text-[11px] text-gray-500 space-y-1">
                                <p>※ 12:00までのご注文確定(データ入稿・決済完了)を基準としています。</p>
                                <p>※ 12:00以降のご注文は翌営業日扱い (+1日) となります。</p>
                                <p>※ 土日祝日は営業日に含まれません。</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 sticky top-24">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">合計金額</h3>
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-gray-600">商品点数</span>
                            <span className="font-bold">{cart.length}点</span>
                        </div>
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
                                className="w-full py-4 rounded-xl font-bold shadow-lg transform transition flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-0.5"
                            >
                                {hasQuoteItem ? '見積もりを依頼する' : '注文手続きへ進む'}
                            </button>
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
                                    <td className="py-4 text-right">
                                        {item.price.quoteRequired ? '要見積' : `¥${item.price.unitPrice.toLocaleString()}`}
                                    </td>
                                    <td className="py-4 text-right font-medium">
                                        {item.price.quoteRequired ? '別途お見積もり' : `¥${item.price.totalPrice.toLocaleString()}`}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan={2}></td>
                            <td className="py-4 text-right font-bold text-lg">合計金額 (税込)</td>
                            <td className="py-4 text-right font-bold text-2xl border-b-2 border-gray-800">
                                {hasQuoteItem ? '別途お見積もり' : `¥${totalWithTax.toLocaleString()}`}
                            </td>
                        </tr>
                        {hasQuoteItem && (
                            <tr>
                                <td colSpan={4} className="py-2 text-right text-sm text-red-600">
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

        </div >
    );
}
