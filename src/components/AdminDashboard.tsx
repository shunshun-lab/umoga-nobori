import { useState } from 'react';
import { useStore } from '@/store';
import { SheetSyncTab } from './SheetSyncTab';

type Tab = 'inventory' | 'pricing' | 'options' | 'calc' | 'logic' | 'sheet' | 'ai' | 'delivery';

export function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<Tab>('inventory');

    const inventory = useStore(state => state.inventory);
    const updateInventory = useStore(state => state.updateInventory);

    const sizes = useStore(state => state.sizes);
    const updateBasePrice = useStore(state => state.updateBasePrice);
    const updateSizeConfig = useStore(state => state.updateSizeConfig);
    const customUnitPrice = useStore(state => state.customSizeUnitPrice);
    const updateCustomUnitPrice = useStore(state => state.updateCustomUnitPrice);

    const exclusions = useStore(state => state.exclusions);
    const toggleExclusion = useStore(state => state.toggleExclusion);

    const deliverySettings = useStore(state => state.deliverySettings);
    const updateDeliverySettings = useStore(state => state.updateDeliverySettings);

    const options = useStore(state => state.options);
    const optionVisibility = useStore(state => state.optionVisibility);
    const toggleOptionVisibility = useStore(state => state.toggleOptionVisibility);

    // New Logic Hooks
    const discountRules = useStore(state => state.discountRules);
    const pricingTables = useStore(state => state.pricingTables);
    const updateDiscountRule = useStore(state => state.updateDiscountRule);
    const updateSegmentFactor = useStore(state => state.updateSegmentFactor);
    const resetMasterData = useStore(state => state.resetMasterData);

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">管理者ダッシュボード</h1>
                    <a href="/" className="text-blue-600 hover:underline">← アプリに戻る</a>
                </header>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 overflow-x-auto">
                        {[
                            { id: 'inventory', label: '在庫管理' },
                            { id: 'pricing', label: '価格・サイズ' },
                            { id: 'calc', label: '計算ロジック' }, // New
                            { id: 'options', label: 'オプション表示' },
                            { id: 'delivery', label: '納期・配送' },
                            { id: 'logic', label: '排他ルール' },
                            { id: 'ai', label: 'AI設定' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as Tab)}
                                className={`flex-1 py-4 px-2 text-center font-bold whitespace-nowrap transition-colors ${activeTab === tab.id
                                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        {/* 1. Inventory */}
                        {activeTab === 'inventory' && (
                            <div>
                                <h2 className="text-xl font-bold mb-4">生地在庫管理</h2>
                                <div className="space-y-4">
                                    {Object.entries(inventory).map(([id, count]) => (
                                        <div key={id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <span className="font-medium text-lg capitalize">{id}</span>
                                            <div className="flex items-center space-x-4">
                                                <span className={`text-sm ${count < 20 ? 'text-red-500 font-bold' : 'text-green-600'}`}>
                                                    {count < 20 ? '残りわずか' : '在庫あり'}
                                                </span>
                                                <input
                                                    type="number"
                                                    value={count}
                                                    onChange={(e) => updateInventory(id, parseInt(e.target.value) || 0)}
                                                    className="w-24 px-3 py-2 border rounded-md"
                                                />
                                                <span>枚分</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 2. Pricing */}
                        {activeTab === 'pricing' && (
                            <div>
                                <h2 className="text-xl font-bold mb-6">サイズ・価格設定</h2>

                                <section className="mb-8">
                                    <h3 className="text-lg font-bold mb-3 border-l-4 border-blue-500 pl-3">カスタムサイズ計算ロジック</h3>
                                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                                        <div>
                                            <div className="font-bold">面積単価</div>
                                            <div className="text-sm text-gray-600">カスタムサイズ入力時の1m²あたりの価格</div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span>¥</span>
                                            <input
                                                type="number"
                                                value={customUnitPrice}
                                                onChange={(e) => updateCustomUnitPrice(parseInt(e.target.value) || 0)}
                                                className="w-32 px-3 py-2 border border-blue-300 rounded-md font-bold text-right"
                                            />
                                            <span>/ m²</span>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-lg font-bold mb-3 border-l-4 border-green-500 pl-3">定型サイズ・画像枠設定</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.entries(sizes).map(([id, size]) => (
                                            <div key={id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-bold text-lg">{size.displayName}</span>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-xs text-gray-500">サイズ (cm)</label>
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                                type="number"
                                                                className="w-16 px-2 py-1 border rounded text-right text-sm"
                                                                value={size.width}
                                                                disabled // Hardcoded in constants usually
                                                            />
                                                            <span>x</span>
                                                            <input
                                                                type="number"
                                                                className="w-16 px-2 py-1 border rounded text-right text-sm"
                                                                value={size.height}
                                                                disabled
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <label className="text-xs text-gray-500">基本価格</label>
                                                        <div className="flex items-center space-x-1">
                                                            <span>¥</span>
                                                            <input
                                                                type="number"
                                                                value={size.basePrice}
                                                                onChange={(e) => updateBasePrice(id, parseInt(e.target.value) || 0)}
                                                                className="w-24 px-2 py-1 border rounded text-right font-bold"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="pt-2 border-t border-gray-100">
                                                        <label className="block text-xs font-bold text-gray-700 mb-1">商品画像フレーム (URL)</label>
                                                        <input
                                                            type="text"
                                                            placeholder="https://..."
                                                            className="w-full px-2 py-1 border rounded text-xs text-gray-600"
                                                            value={size.imageUrl || ''}
                                                            onChange={(e) => updateSizeConfig(id, { imageUrl: e.target.value })}
                                                        />
                                                        <div className="mt-1 flex justify-between">
                                                            <span className="text-[10px] text-gray-400">※ 入稿時のプレビュー枠として使用</span>
                                                            <button className="text-[10px] text-blue-600 hover:underline">位置・サイズ調整</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* 3. Delivery Settings */}
                        {activeTab === 'delivery' && (
                            <div>
                                <h2 className="text-xl font-bold mb-6">納期・お急ぎ便設定</h2>
                                <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">通常便の日数 (営業日)</label>
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="number"
                                                    value={deliverySettings.standardDays}
                                                    onChange={(e) => updateDeliverySettings({ standardDays: parseInt(e.target.value) || 0 })}
                                                    className="w-24 px-3 py-2 border rounded-md font-bold text-right"
                                                />
                                                <span>日後</span>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">追加料金なし</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">お急ぎ便の日数 (営業日)</label>
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="number"
                                                    value={deliverySettings.rushDays}
                                                    onChange={(e) => updateDeliverySettings({ rushDays: parseInt(e.target.value) || 0 })}
                                                    className="w-24 px-3 py-2 border rounded-md font-bold text-right text-orange-600"
                                                />
                                                <span>日後</span>
                                            </div>
                                            <p className="text-sm text-orange-600 mt-1 font-bold">
                                                追加料金: {(deliverySettings.rushSurchargeRate * 100).toFixed(0)}% 加算
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 4. Logic */}
                        {activeTab === 'logic' && (
                            <div>
                                <h2 className="text-xl font-bold mb-4">オプション排他制御</h2>
                                <p className="mb-6 text-gray-600">同時に選択できないオプションの組み合わせを設定します。</p>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white border">
                                        <thead>
                                            <tr>
                                                <th className="px-4 py-2 bg-gray-100 border"></th>
                                                {Object.values(options).map(opt => (
                                                    <th key={opt.id} className="px-4 py-2 bg-gray-100 border text-xs">{opt.name}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.values(options).map(rowOpt => (
                                                <tr key={rowOpt.id}>
                                                    <th className="px-4 py-2 bg-gray-50 border text-xs text-left">{rowOpt.name}</th>
                                                    {Object.values(options).map(colOpt => {
                                                        if (rowOpt.id === colOpt.id) return <td key={colOpt.id} className="bg-gray-200 border"></td>;
                                                        const isExcluded = exclusions[rowOpt.id]?.includes(colOpt.id);
                                                        return (
                                                            <td key={colOpt.id} className="p-2 border text-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={!!isExcluded}
                                                                    onChange={() => toggleExclusion(rowOpt.id, colOpt.id)}
                                                                    className="w-5 h-5 text-red-600 focus:ring-red-500 cursor-pointer"
                                                                />
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* 4. Sheet Sync */}
                        {activeTab === 'sheet' && (
                            <SheetSyncTab />
                        )}

                        {/* 2.5 Option Visibility */}
                        {activeTab === 'options' && (
                            <div>
                                <h2 className="text-xl font-bold mb-4">オプション表示設定</h2>
                                <p className="mb-6 text-gray-600">ユーザー画面に表示するオプションを選択できます。</p>

                                <div className="space-y-4">
                                    {Object.entries(options).map(([id, opt]) => {
                                        // Default to true if undefined
                                        const isVisible = optionVisibility[id] !== false;

                                        return (
                                            <div key={id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                <div>
                                                    <div className="font-bold flex items-center space-x-2">
                                                        <span>{opt.displayName}</span>
                                                        {!isVisible && <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded">非表示</span>}
                                                    </div>
                                                    <div className="text-xs text-gray-500">{opt.description}</div>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            className="sr-only peer"
                                                            checked={isVisible}
                                                            onChange={() => toggleOptionVisibility(id)}
                                                        />
                                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                        <span className="ml-3 text-sm font-medium text-gray-900">{isVisible ? '表示中' : '非表示'}</span>
                                                    </label>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}


                        {/* 4.5 Calculation Config (New) */}
                        {activeTab === 'calc' && (
                            <div>
                                <h2 className="text-xl font-bold mb-4">計算ロジック係数</h2>
                                <p className="mb-6 text-gray-600">価格計算に使用される係数や割引率を調整できます。</p>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                                    {/* Quantity Discounts */}
                                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                        <h3 className="text-lg font-bold mb-4 text-blue-700">数量割引ルール</h3>
                                        <table className="min-w-full text-sm">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-3 py-2 text-left">枚数</th>
                                                    <th className="px-3 py-2 text-left">ラベル</th>
                                                    <th className="px-3 py-2 text-right">掛率</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {discountRules.map((rule, idx) => (
                                                    <tr key={idx} className="border-t">
                                                        <td className="px-3 py-2">
                                                            {rule.minQuantity}枚〜
                                                        </td>
                                                        <td className="px-3 py-2 text-gray-500">
                                                            {rule.label}
                                                        </td>
                                                        <td className="px-3 py-2 text-right">
                                                            <div className="flex items-center justify-end space-x-1">
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={rule.rate}
                                                                    onChange={(e) => updateDiscountRule(idx, { ...rule, rate: parseFloat(e.target.value) || 1 })}
                                                                    className="w-16 px-2 py-1 border rounded text-right font-bold"
                                                                />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Segment Factors */}
                                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                        <h3 className="text-lg font-bold mb-4 text-green-700">分割係数 (面積調整)</h3>
                                        <p className="text-xs text-gray-500 mb-4">
                                            巨大サイズを複数枚に分割して製造する場合の係数です。
                                        </p>
                                        <div className="space-y-4">
                                            {[2, 3, 4].map((count) => (
                                                <div key={count} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                                    <span className="font-bold">{count}分割</span>
                                                    <div className="flex items-center space-x-2">
                                                        <span>×</span>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={pricingTables.segmentFactors[count] || 1}
                                                            onChange={(e) => updateSegmentFactor(count, parseFloat(e.target.value) || 1)}
                                                            className="w-20 px-2 py-1 border rounded text-right font-bold text-green-700"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-8 border-t border-gray-200">
                                    <h3 className="text-lg font-bold mb-2 text-gray-900">工場出荷設定に戻す</h3>
                                    <p className="text-sm text-gray-500 mb-4">
                                        全ての価格・係数・オプション設定を初期状態（JSONデータ）に戻します。
                                    </p>
                                    <button
                                        onClick={() => {
                                            if (window.confirm('本当に全ての設定を初期化しますか？')) {
                                                resetMasterData();
                                                alert('設定をリセットしました。');
                                            }
                                        }}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-bold"
                                    >
                                        全設定リセット
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 5. AI Config */}
                        {activeTab === 'ai' && (
                            <div>
                                <h2 className="text-xl font-bold mb-4">AI機能設定（コンセプト）</h2>

                                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 p-8 rounded-2xl">
                                    <div className="flex items-start space-x-6">
                                        <div className="p-4 bg-white rounded-full shadow-md">
                                            <span className="text-3xl">🤖</span>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">生成AIインテグレーション</h3>
                                            <p className="text-gray-600 mb-6">
                                                ここでは、将来的に以下のAI機能を管理・設定する予定です。
                                            </p>

                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm">
                                                    <h4 className="font-bold text-purple-700 mb-2">デザイン自動生成</h4>
                                                    <p className="text-xs text-gray-500 mb-2">プロンプトからデザイン案を生成するモデルの設定。</p>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                        <span className="text-sm font-mono text-gray-600">Model: Gemini Pro Vision (Planned)</span>
                                                    </div>
                                                </div>

                                                <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm">
                                                    <h4 className="font-bold text-purple-700 mb-2">価格最適化AI</h4>
                                                    <p className="text-xs text-gray-500 mb-2">過去の注文データから最適な単価を提案。</p>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                                                        <span className="text-sm font-mono text-gray-400">Status: Disconnected</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-6 pt-6 border-t border-purple-200">
                                                <label className="flex items-center space-x-3">
                                                    <input type="checkbox" disabled className="w-5 h-5 text-purple-600 rounded" />
                                                    <span className="text-gray-500">Enable Experimental AI Features (Coming Soon)</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
