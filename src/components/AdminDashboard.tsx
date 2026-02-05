import { useState } from 'react';
import { useStore } from '@/store';
import { SheetSyncTab } from './SheetSyncTab';
import { uiConfigService } from '@/utils/uiConfigService';
import type { UiConfig, BannerItem, TemplateItem } from '@/utils/uiConfigTypes';

type Tab = 'inventory' | 'pricing' | 'options' | 'calc' | 'logic' | 'sheet' | 'ai' | 'delivery' | 'ui' | 'orders';

interface AdminOrder {
    id: string | number;
    name: string;
    createdAt: string;
    totalPrice: string;
    currency: string;
    financialStatus: string;
    fulfillmentStatus: string | null;
    customer: {
        name?: string;
        email?: string;
    } | null;
    tags?: string;
    lineItems: {
        id: string | number;
        title: string;
        quantity: number;
        price: string;
        sku?: string;
        properties: { name: string; value: string }[];
    }[];
}

export function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<Tab>('inventory');
    const [uiConfig, setUiConfig] = useState<UiConfig | null>(null);
    const [uiLoading, setUiLoading] = useState(false);
    const [uiError, setUiError] = useState<string | null>(null);
    const [uiSaving, setUiSaving] = useState(false);

    // Orders (Shopify)
    const [orders, setOrders] = useState<AdminOrder[] | null>(null);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [ordersError, setOrdersError] = useState<string | null>(null);
    const [ordersFilter, setOrdersFilter] = useState('');

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
                            { id: 'ui', label: 'UI設定（画像・テンプレ）' },
                            { id: 'orders', label: '注文管理（Shopify）' },
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
                        {/* UI Config (Lazy Load) */}
                        {activeTab === 'ui' && (
                            <div>
                                <h2 className="text-xl font-bold mb-4">UI設定（バナー・テンプレート・画像）</h2>
                                {!uiConfig && !uiLoading && (
                                    <button
                                        onClick={async () => {
                                            try {
                                                setUiLoading(true);
                                                setUiError(null);
                                                const data = await uiConfigService.loadUiConfig();
                                                setUiConfig(data);
                                            } catch (e: any) {
                                                setUiError(e.message || 'UI設定の読み込みに失敗しました');
                                            } finally {
                                                setUiLoading(false);
                                            }
                                        }}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                                    >
                                        設定を読み込む
                                    </button>
                                )}

                                {uiLoading && (
                                    <p className="text-sm text-gray-500 mt-2">読み込み中です...</p>
                                )}

                                {uiError && (
                                    <p className="text-sm text-red-600 mt-2">{uiError}</p>
                                )}

                                {uiConfig && (
                                    <div className="mt-6 space-y-8">
                                        {uiSaving && (
                                            <p className="text-xs text-gray-500 mb-2">保存中です...</p>
                                        )}

                                        {/* Banners */}
                                        <section>
                                            <h3 className="text-lg font-bold mb-3 border-l-4 border-blue-500 pl-3">バナー一覧</h3>
                                            <p className="text-xs text-gray-500 mb-3">バナーの画像URL・リンク・表示順を編集できます。</p>
                                            <div className="space-y-3">
                                                {uiConfig.banners
                                                    .slice()
                                                    .sort((a, b) => a.sortOrder - b.sortOrder)
                                                    .map((b) => (
                                                        <div key={b.id} className="p-3 bg-gray-50 rounded-lg border space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center space-x-3">
                                                                    <img src={b.imageUrl} alt={b.id} className="w-24 h-12 object-cover rounded bg-gray-200" />
                                                                    <div>
                                                                        <div className="font-bold text-sm">ID: {b.id}</div>
                                                                        <div className="text-xs text-gray-500">
                                                                            並び順:
                                                                            <input
                                                                                type="number"
                                                                                className="w-16 ml-2 px-2 py-1 border rounded text-xs text-right"
                                                                                value={b.sortOrder}
                                                                                onChange={(e) => {
                                                                                    const sortOrder = parseInt(e.target.value) || 0;
                                                                                    setUiConfig({
                                                                                        ...uiConfig,
                                                                                        banners: uiConfig.banners.map((x) =>
                                                                                            x.id === b.id ? { ...x, sortOrder } : x
                                                                                        ),
                                                                                    });
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <label className="flex items-center text-xs">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={b.active}
                                                                            onChange={(e) => {
                                                                                setUiConfig({
                                                                                    ...uiConfig,
                                                                                    banners: uiConfig.banners.map((x) =>
                                                                                        x.id === b.id ? { ...x, active: e.target.checked } : x
                                                                                    ),
                                                                                });
                                                                            }}
                                                                            className="mr-1"
                                                                        />
                                                                        表示
                                                                    </label>
                                                                    <button
                                                                        className="text-xs text-red-600 hover:underline"
                                                                        onClick={() => {
                                                                            if (!confirm('このバナーを削除しますか？')) return;
                                                                            setUiConfig({
                                                                                ...uiConfig,
                                                                                banners: uiConfig.banners.filter((x) => x.id !== b.id),
                                                                            });
                                                                        }}
                                                                    >
                                                                        削除
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                <div>
                                                                    <label className="block text-[10px] text-gray-500 mb-1">画像URL</label>
                                                                    <input
                                                                        type="text"
                                                                        className="w-full px-2 py-1 border rounded text-xs"
                                                                        value={b.imageUrl}
                                                                        onChange={(e) => {
                                                                            const imageUrl = e.target.value;
                                                                            setUiConfig({
                                                                                ...uiConfig,
                                                                                banners: uiConfig.banners.map((x) =>
                                                                                    x.id === b.id ? { ...x, imageUrl } : x
                                                                                ),
                                                                            });
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-[10px] text-gray-500 mb-1">リンクURL（任意）</label>
                                                                    <input
                                                                        type="text"
                                                                        className="w-full px-2 py-1 border rounded text-xs"
                                                                        value={b.linkUrl || ''}
                                                                        onChange={(e) => {
                                                                            const linkUrl = e.target.value;
                                                                            setUiConfig({
                                                                                ...uiConfig,
                                                                                banners: uiConfig.banners.map((x) =>
                                                                                    x.id === b.id ? { ...x, linkUrl } : x
                                                                                ),
                                                                            });
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                {uiConfig.banners.length === 0 && (
                                                    <p className="text-xs text-gray-400 mb-2">バナーはまだ登録されていません。</p>
                                                )}
                                                <button
                                                    className="mt-2 px-3 py-1.5 bg-white border border-dashed border-blue-300 text-blue-600 text-xs rounded-lg hover:bg-blue-50 font-bold"
                                                    onClick={() => {
                                                        const newBanner: BannerItem = {
                                                            id: `banner-${Date.now()}`,
                                                            imageUrl: '',
                                                            sortOrder:
                                                                (uiConfig.banners.reduce((max, b) => Math.max(max, b.sortOrder), 0) || 0) + 1,
                                                            active: true,
                                                        };
                                                        setUiConfig({ ...uiConfig, banners: [...uiConfig.banners, newBanner] });
                                                    }}
                                                >
                                                    ＋ バナーを追加
                                                </button>
                                                <button
                                                    className="mt-2 ml-2 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 font-bold"
                                                    disabled={uiSaving}
                                                    onClick={async () => {
                                                        try {
                                                            setUiSaving(true);
                                                            await uiConfigService.saveBanners(uiConfig.banners);
                                                            alert('バナー設定を保存しました');
                                                        } catch (e: any) {
                                                            alert(`バナー保存に失敗しました: ${e.message || e}`);
                                                        } finally {
                                                            setUiSaving(false);
                                                        }
                                                    }}
                                                >
                                                    バナー設定を保存
                                                </button>
                                            </div>
                                        </section>

                                        {/* Templates */}
                                        <section>
                                            <h3 className="text-lg font-bold mb-3 border-l-4 border-green-500 pl-3">テンプレート一覧（完全データ入稿用）</h3>
                                            <p className="text-xs text-gray-500 mb-3">最大10件まで登録を想定しています。</p>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full text-sm bg-white border rounded-lg">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-3 py-2 text-left border">ID</th>
                                                            <th className="px-3 py-2 text-left border">表示名</th>
                                                            <th className="px-3 py-2 text-left border">サイズID</th>
                                                            <th className="px-3 py-2 text-left border">URL</th>
                                                            <th className="px-3 py-2 text-left border">並び順</th>
                                                            <th className="px-3 py-2 text-left border">状態</th>
                                                            <th className="px-3 py-2 text-left border">操作</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {uiConfig.templates
                                                            .slice()
                                                            .sort((a, b) => a.sortOrder - b.sortOrder)
                                                            .map((t) => (
                                                                <tr key={t.id} className="border-t align-top">
                                                                    <td className="px-3 py-2 border font-mono text-xs break-all">
                                                                        <input
                                                                            type="text"
                                                                            className="w-full px-1 py-0.5 border rounded text-[11px]"
                                                                            value={t.id}
                                                                            onChange={(e) => {
                                                                                const id = e.target.value;
                                                                                setUiConfig({
                                                                                    ...uiConfig,
                                                                                    templates: uiConfig.templates.map((x) =>
                                                                                        x === t ? { ...x, id } : x
                                                                                    ),
                                                                                });
                                                                            }}
                                                                        />
                                                                    </td>
                                                                    <td className="px-3 py-2 border">
                                                                        <input
                                                                            type="text"
                                                                            className="w-full px-1 py-0.5 border rounded text-xs"
                                                                            value={t.name}
                                                                            onChange={(e) => {
                                                                                const name = e.target.value;
                                                                                setUiConfig({
                                                                                    ...uiConfig,
                                                                                    templates: uiConfig.templates.map((x) =>
                                                                                        x === t ? { ...x, name } : x
                                                                                    ),
                                                                                });
                                                                            }}
                                                                        />
                                                                    </td>
                                                                    <td className="px-3 py-2 border text-xs">
                                                                        <input
                                                                            type="text"
                                                                            className="w-full px-1 py-0.5 border rounded text-xs"
                                                                            placeholder="standard / slim など"
                                                                            value={t.sizeId || ''}
                                                                            onChange={(e) => {
                                                                                const sizeId = e.target.value || undefined;
                                                                                setUiConfig({
                                                                                    ...uiConfig,
                                                                                    templates: uiConfig.templates.map((x) =>
                                                                                        x === t ? { ...x, sizeId } : x
                                                                                    ),
                                                                                });
                                                                            }}
                                                                        />
                                                                    </td>
                                                                    <td className="px-3 py-2 border text-xs">
                                                                        <input
                                                                            type="text"
                                                                            className="w-full px-1 py-0.5 border rounded text-xs"
                                                                            value={t.fileUrl}
                                                                            onChange={(e) => {
                                                                                const fileUrl = e.target.value;
                                                                                setUiConfig({
                                                                                    ...uiConfig,
                                                                                    templates: uiConfig.templates.map((x) =>
                                                                                        x === t ? { ...x, fileUrl } : x
                                                                                    ),
                                                                                });
                                                                            }}
                                                                        />
                                                                    </td>
                                                                    <td className="px-3 py-2 border text-center">
                                                                        <input
                                                                            type="number"
                                                                            className="w-16 px-1 py-0.5 border rounded text-xs text-right"
                                                                            value={t.sortOrder}
                                                                            onChange={(e) => {
                                                                                const sortOrder = parseInt(e.target.value) || 0;
                                                                                setUiConfig({
                                                                                    ...uiConfig,
                                                                                    templates: uiConfig.templates.map((x) =>
                                                                                        x === t ? { ...x, sortOrder } : x
                                                                                    ),
                                                                                });
                                                                            }}
                                                                        />
                                                                    </td>
                                                                    <td className="px-3 py-2 border text-center text-xs">
                                                                        <label className="flex items-center justify-center space-x-1">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={t.active}
                                                                                onChange={(e) => {
                                                                                    setUiConfig({
                                                                                        ...uiConfig,
                                                                                        templates: uiConfig.templates.map((x) =>
                                                                                            x === t ? { ...x, active: e.target.checked } : x
                                                                                        ),
                                                                                    });
                                                                                }}
                                                                            />
                                                                            <span>{t.active ? '有効' : '無効'}</span>
                                                                        </label>
                                                                    </td>
                                                                    <td className="px-3 py-2 border text-center text-xs">
                                                                        <button
                                                                            className="text-red-600 hover:underline"
                                                                            onClick={() => {
                                                                                if (!confirm('このテンプレートを削除しますか？')) return;
                                                                                setUiConfig({
                                                                                    ...uiConfig,
                                                                                    templates: uiConfig.templates.filter((x) => x !== t),
                                                                                });
                                                                            }}
                                                                        >
                                                                            削除
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        {uiConfig.templates.length === 0 && (
                                                            <tr>
                                                                <td colSpan={7} className="px-3 py-4 text-center text-xs text-gray-400">
                                                                    テンプレートはまだ登録されていません。
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="mt-2 flex items-center space-x-2">
                                                <button
                                                    className="px-3 py-1.5 bg-white border border-dashed border-green-300 text-green-700 text-xs rounded-lg hover:bg-green-50 font-bold"
                                                    disabled={uiConfig.templates.length >= 10}
                                                    onClick={() => {
                                                        if (uiConfig.templates.length >= 10) {
                                                            alert('テンプレートは最大10件までです');
                                                            return;
                                                        }
                                                        const newTemplate: TemplateItem = {
                                                            id: `tmpl-${Date.now()}`,
                                                            name: '',
                                                            fileUrl: '',
                                                            sortOrder:
                                                                (uiConfig.templates.reduce(
                                                                    (max, t) => Math.max(max, t.sortOrder),
                                                                    0,
                                                                ) || 0) + 1,
                                                            active: true,
                                                        };
                                                        setUiConfig({
                                                            ...uiConfig,
                                                            templates: [...uiConfig.templates, newTemplate],
                                                        });
                                                    }}
                                                >
                                                    ＋ テンプレートを追加
                                                </button>
                                                <button
                                                    className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 font-bold"
                                                    disabled={uiSaving}
                                                    onClick={async () => {
                                                        try {
                                                            setUiSaving(true);
                                                            await uiConfigService.saveTemplates(uiConfig.templates);
                                                            alert('テンプレート設定を保存しました');
                                                        } catch (e: any) {
                                                            alert(`テンプレート保存に失敗しました: ${e.message || e}`);
                                                        } finally {
                                                            setUiSaving(false);
                                                        }
                                                    }}
                                                >
                                                    テンプレート設定を保存
                                                </button>
                                            </div>
                                        </section>

                                        {/* Images (Size / Fabric / Option) */}
                                        <section>
                                            <h3 className="text-lg font-bold mb-3 border-l-4 border-purple-500 pl-3">画像設定（サイズ・生地・オプション）</h3>
                                            <p className="text-xs text-gray-500 mb-4">
                                                Firestore / Storage にアップロードした画像のURLを登録します。各IDごとに最大3枚まで登録できます。
                                            </p>

                                            {/* Size Images */}
                                            <div className="mb-6">
                                                <h4 className="text-sm font-bold mb-2 text-gray-800">サイズ別画像（bySizeId）</h4>
                                                <div className="space-y-3">
                                                    {Object.entries(uiConfig.sizeImages.bySizeId || {}).map(([sizeId, payload]) => (
                                                        <div key={sizeId} className="p-3 bg-gray-50 rounded-lg border">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-xs font-mono bg-white px-2 py-1 rounded border text-gray-700">sizeId: {sizeId}</span>
                                                                <button
                                                                    className="text-[11px] text-red-500 hover:underline"
                                                                    onClick={() => {
                                                                        const { [sizeId]: _removed, ...rest } = uiConfig.sizeImages.bySizeId;
                                                                        setUiConfig({
                                                                            ...uiConfig,
                                                                            sizeImages: { ...uiConfig.sizeImages, bySizeId: rest },
                                                                        });
                                                                    }}
                                                                >
                                                                    削除
                                                                </button>
                                                            </div>
                                                            <div className="space-y-2">
                                                                {payload.images.map((img, idx) => (
                                                                    <div key={idx} className="grid grid-cols-[1fr_auto_auto] gap-2 items-center">
                                                                        <input
                                                                            type="text"
                                                                            className="px-2 py-1 border rounded text-xs"
                                                                            placeholder="https://..."
                                                                            value={img.imageUrl}
                                                                            onChange={(e) => {
                                                                                const imageUrl = e.target.value;
                                                                                const next = [...payload.images];
                                                                                next[idx] = { ...img, imageUrl };
                                                                                setUiConfig({
                                                                                    ...uiConfig,
                                                                                    sizeImages: {
                                                                                        ...uiConfig.sizeImages,
                                                                                        bySizeId: {
                                                                                            ...uiConfig.sizeImages.bySizeId,
                                                                                            [sizeId]: { images: next },
                                                                                        },
                                                                                    },
                                                                                });
                                                                            }}
                                                                        />
                                                                        <input
                                                                            type="number"
                                                                            className="w-16 px-2 py-1 border rounded text-xs text-right"
                                                                            value={img.sortOrder}
                                                                            onChange={(e) => {
                                                                                const sortOrder = parseInt(e.target.value) || 0;
                                                                                const next = [...payload.images];
                                                                                next[idx] = { ...img, sortOrder };
                                                                                setUiConfig({
                                                                                    ...uiConfig,
                                                                                    sizeImages: {
                                                                                        ...uiConfig.sizeImages,
                                                                                        bySizeId: {
                                                                                            ...uiConfig.sizeImages.bySizeId,
                                                                                            [sizeId]: { images: next },
                                                                                        },
                                                                                    },
                                                                                });
                                                                            }}
                                                                        />
                                                                        <label className="flex items-center text-[11px]">
                                                                            <input
                                                                                type="checkbox"
                                                                                className="mr-1"
                                                                                checked={img.active}
                                                                                onChange={(e) => {
                                                                                    const next = [...payload.images];
                                                                                    next[idx] = { ...img, active: e.target.checked };
                                                                                    setUiConfig({
                                                                                        ...uiConfig,
                                                                                        sizeImages: {
                                                                                            ...uiConfig.sizeImages,
                                                                                            bySizeId: {
                                                                                                ...uiConfig.sizeImages.bySizeId,
                                                                                                [sizeId]: { images: next },
                                                                                            },
                                                                                        },
                                                                                    });
                                                                                }}
                                                                            />
                                                                            有効
                                                                        </label>
                                                                    </div>
                                                                ))}
                                                                {payload.images.length < 3 && (
                                                                    <button
                                                                        className="mt-1 px-2 py-1 border border-dashed border-purple-300 rounded text-[11px] text-purple-700 hover:bg-purple-50"
                                                                        onClick={() => {
                                                                            const next = [
                                                                                ...payload.images,
                                                                                { imageUrl: '', sortOrder: (payload.images[payload.images.length - 1]?.sortOrder || 0) + 1, active: true },
                                                                            ];
                                                                            setUiConfig({
                                                                                ...uiConfig,
                                                                                sizeImages: {
                                                                                    ...uiConfig.sizeImages,
                                                                                    bySizeId: {
                                                                                        ...uiConfig.sizeImages.bySizeId,
                                                                                        [sizeId]: { images: next },
                                                                                    },
                                                                                },
                                                                            });
                                                                        }}
                                                                    >
                                                                        ＋ 画像を追加
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <button
                                                        className="px-3 py-1.5 bg-white border border-dashed border-gray-300 text-xs rounded-lg hover:bg-gray-50"
                                                        onClick={() => {
                                                            const newId = prompt('サイズID（standard / slim など）を入力してください');
                                                            if (!newId) return;
                                                            if (uiConfig.sizeImages.bySizeId[newId]) {
                                                                alert('既に同じIDが存在します');
                                                                return;
                                                            }
                                                            setUiConfig({
                                                                ...uiConfig,
                                                                sizeImages: {
                                                                    ...uiConfig.sizeImages,
                                                                    bySizeId: {
                                                                        ...uiConfig.sizeImages.bySizeId,
                                                                        [newId]: { images: [] },
                                                                    },
                                                                },
                                                            });
                                                        }}
                                                    >
                                                        ＋ サイズIDを追加
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Fabric Images */}
                                            <div className="mb-6">
                                                <h4 className="text-sm font-bold mb-2 text-gray-800">生地別画像（byFabricId）</h4>
                                                <div className="space-y-3">
                                                    {Object.entries(uiConfig.fabricImages.byFabricId || {}).map(([fabricId, payload]) => (
                                                        <div key={fabricId} className="p-3 bg-gray-50 rounded-lg border">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-xs font-mono bg-white px-2 py-1 rounded border text-gray-700">fabricId: {fabricId}</span>
                                                                <button
                                                                    className="text-[11px] text-red-500 hover:underline"
                                                                    onClick={() => {
                                                                        const { [fabricId]: _removed, ...rest } = uiConfig.fabricImages.byFabricId;
                                                                        setUiConfig({
                                                                            ...uiConfig,
                                                                            fabricImages: { ...uiConfig.fabricImages, byFabricId: rest },
                                                                        });
                                                                    }}
                                                                >
                                                                    削除
                                                                </button>
                                                            </div>
                                                            <div className="space-y-2">
                                                                {payload.images.map((img, idx) => (
                                                                    <div key={idx} className="grid grid-cols-[1fr_auto_auto] gap-2 items-center">
                                                                        <input
                                                                            type="text"
                                                                            className="px-2 py-1 border rounded text-xs"
                                                                            placeholder="https://..."
                                                                            value={img.imageUrl}
                                                                            onChange={(e) => {
                                                                                const imageUrl = e.target.value;
                                                                                const next = [...payload.images];
                                                                                next[idx] = { ...img, imageUrl };
                                                                                setUiConfig({
                                                                                    ...uiConfig,
                                                                                    fabricImages: {
                                                                                        ...uiConfig.fabricImages,
                                                                                        byFabricId: {
                                                                                            ...uiConfig.fabricImages.byFabricId,
                                                                                            [fabricId]: { images: next },
                                                                                        },
                                                                                    },
                                                                                });
                                                                            }}
                                                                        />
                                                                        <input
                                                                            type="number"
                                                                            className="w-16 px-2 py-1 border rounded text-xs text-right"
                                                                            value={img.sortOrder}
                                                                            onChange={(e) => {
                                                                                const sortOrder = parseInt(e.target.value) || 0;
                                                                                const next = [...payload.images];
                                                                                next[idx] = { ...img, sortOrder };
                                                                                setUiConfig({
                                                                                    ...uiConfig,
                                                                                    fabricImages: {
                                                                                        ...uiConfig.fabricImages,
                                                                                        byFabricId: {
                                                                                            ...uiConfig.fabricImages.byFabricId,
                                                                                            [fabricId]: { images: next },
                                                                                        },
                                                                                    },
                                                                                });
                                                                            }}
                                                                        />
                                                                        <label className="flex items-center text-[11px]">
                                                                            <input
                                                                                type="checkbox"
                                                                                className="mr-1"
                                                                                checked={img.active}
                                                                                onChange={(e) => {
                                                                                    const next = [...payload.images];
                                                                                    next[idx] = { ...img, active: e.target.checked };
                                                                                    setUiConfig({
                                                                                        ...uiConfig,
                                                                                        fabricImages: {
                                                                                            ...uiConfig.fabricImages,
                                                                                            byFabricId: {
                                                                                                ...uiConfig.fabricImages.byFabricId,
                                                                                                [fabricId]: { images: next },
                                                                                            },
                                                                                        },
                                                                                    });
                                                                                }}
                                                                            />
                                                                            有効
                                                                        </label>
                                                                    </div>
                                                                ))}
                                                                {payload.images.length < 3 && (
                                                                    <button
                                                                        className="mt-1 px-2 py-1 border border-dashed border-purple-300 rounded text-[11px] text-purple-700 hover:bg-purple-50"
                                                                        onClick={() => {
                                                                            const next = [
                                                                                ...payload.images,
                                                                                { imageUrl: '', sortOrder: (payload.images[payload.images.length - 1]?.sortOrder || 0) + 1, active: true },
                                                                            ];
                                                                            setUiConfig({
                                                                                ...uiConfig,
                                                                                fabricImages: {
                                                                                    ...uiConfig.fabricImages,
                                                                                    byFabricId: {
                                                                                        ...uiConfig.fabricImages.byFabricId,
                                                                                        [fabricId]: { images: next },
                                                                                    },
                                                                                },
                                                                            });
                                                                        }}
                                                                    >
                                                                        ＋ 画像を追加
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <button
                                                        className="px-3 py-1.5 bg-white border border-dashed border-gray-300 text-xs rounded-lg hover:bg-gray-50"
                                                        onClick={() => {
                                                            const newId = prompt('生地ID（polyester / tropical など）を入力してください');
                                                            if (!newId) return;
                                                            if (uiConfig.fabricImages.byFabricId[newId]) {
                                                                alert('既に同じIDが存在します');
                                                                return;
                                                            }
                                                            setUiConfig({
                                                                ...uiConfig,
                                                                fabricImages: {
                                                                    ...uiConfig.fabricImages,
                                                                    byFabricId: {
                                                                        ...uiConfig.fabricImages.byFabricId,
                                                                        [newId]: { images: [] },
                                                                    },
                                                                },
                                                            });
                                                        }}
                                                    >
                                                        ＋ 生地IDを追加
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Option Images */}
                                            <div className="mb-4">
                                                <h4 className="text-sm font-bold mb-2 text-gray-800">オプション別画像（byOptionId）</h4>
                                                <div className="space-y-3">
                                                    {Object.entries(uiConfig.optionImages.byOptionId || {}).map(([optionId, payload]) => (
                                                        <div key={optionId} className="p-3 bg-gray-50 rounded-lg border">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-xs font-mono bg-white px-2 py-1 rounded border text-gray-700">optionId: {optionId}</span>
                                                                <button
                                                                    className="text-[11px] text-red-500 hover:underline"
                                                                    onClick={() => {
                                                                        const { [optionId]: _removed, ...rest } = uiConfig.optionImages.byOptionId;
                                                                        setUiConfig({
                                                                            ...uiConfig,
                                                                            optionImages: { ...uiConfig.optionImages, byOptionId: rest },
                                                                        });
                                                                    }}
                                                                >
                                                                    削除
                                                                </button>
                                                            </div>
                                                            <div className="space-y-2">
                                                                {payload.images.map((img, idx) => (
                                                                    <div key={idx} className="grid grid-cols-[1fr_auto_auto] gap-2 items-center">
                                                                        <input
                                                                            type="text"
                                                                            className="px-2 py-1 border rounded text-xs"
                                                                            placeholder="https://..."
                                                                            value={img.imageUrl}
                                                                            onChange={(e) => {
                                                                                const imageUrl = e.target.value;
                                                                                const next = [...payload.images];
                                                                                next[idx] = { ...img, imageUrl };
                                                                                setUiConfig({
                                                                                    ...uiConfig,
                                                                                    optionImages: {
                                                                                        ...uiConfig.optionImages,
                                                                                        byOptionId: {
                                                                                            ...uiConfig.optionImages.byOptionId,
                                                                                            [optionId]: { images: next },
                                                                                        },
                                                                                    },
                                                                                });
                                                                            }}
                                                                        />
                                                                        <input
                                                                            type="number"
                                                                            className="w-16 px-2 py-1 border rounded text-xs text-right"
                                                                            value={img.sortOrder}
                                                                            onChange={(e) => {
                                                                                const sortOrder = parseInt(e.target.value) || 0;
                                                                                const next = [...payload.images];
                                                                                next[idx] = { ...img, sortOrder };
                                                                                setUiConfig({
                                                                                    ...uiConfig,
                                                                                    optionImages: {
                                                                                        ...uiConfig.optionImages,
                                                                                        byOptionId: {
                                                                                            ...uiConfig.optionImages.byOptionId,
                                                                                            [optionId]: { images: next },
                                                                                        },
                                                                                    },
                                                                                });
                                                                            }}
                                                                        />
                                                                        <label className="flex items-center text-[11px]">
                                                                            <input
                                                                                type="checkbox"
                                                                                className="mr-1"
                                                                                checked={img.active}
                                                                                onChange={(e) => {
                                                                                    const next = [...payload.images];
                                                                                    next[idx] = { ...img, active: e.target.checked };
                                                                                    setUiConfig({
                                                                                        ...uiConfig,
                                                                                        optionImages: {
                                                                                            ...uiConfig.optionImages,
                                                                                            byOptionId: {
                                                                                                ...uiConfig.optionImages.byOptionId,
                                                                                                [optionId]: { images: next },
                                                                                            },
                                                                                        },
                                                                                    });
                                                                                }}
                                                                            />
                                                                            有効
                                                                        </label>
                                                                    </div>
                                                                ))}
                                                                {payload.images.length < 3 && (
                                                                    <button
                                                                        className="mt-1 px-2 py-1 border border-dashed border-purple-300 rounded text-[11px] text-purple-700 hover:bg-purple-50"
                                                                        onClick={() => {
                                                                            const next = [
                                                                                ...payload.images,
                                                                                { imageUrl: '', sortOrder: (payload.images[payload.images.length - 1]?.sortOrder || 0) + 1, active: true },
                                                                            ];
                                                                            setUiConfig({
                                                                                ...uiConfig,
                                                                                optionImages: {
                                                                                    ...uiConfig.optionImages,
                                                                                    byOptionId: {
                                                                                        ...uiConfig.optionImages.byOptionId,
                                                                                        [optionId]: { images: next },
                                                                                    },
                                                                                },
                                                                            });
                                                                        }}
                                                                    >
                                                                        ＋ 画像を追加
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <button
                                                        className="px-3 py-1.5 bg-white border border-dashed border-gray-300 text-xs rounded-lg hover:bg-gray-50"
                                                        onClick={() => {
                                                            const newId = prompt('オプションID（pole_pocket / chichi など）を入力してください');
                                                            if (!newId) return;
                                                            if (uiConfig.optionImages.byOptionId[newId]) {
                                                                alert('既に同じIDが存在します');
                                                                return;
                                                            }
                                                            setUiConfig({
                                                                ...uiConfig,
                                                                optionImages: {
                                                                    ...uiConfig.optionImages,
                                                                    byOptionId: {
                                                                        ...uiConfig.optionImages.byOptionId,
                                                                        [newId]: { images: [] },
                                                                    },
                                                                },
                                                            });
                                                        }}
                                                    >
                                                        ＋ オプションIDを追加
                                                    </button>
                                                </div>
                                            </div>

                                            <button
                                                className="px-4 py-2 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 font-bold"
                                                disabled={uiSaving}
                                                onClick={async () => {
                                                    try {
                                                        setUiSaving(true);
                                                        await uiConfigService.saveImages({
                                                            optionImages: uiConfig.optionImages,
                                                            sizeImages: uiConfig.sizeImages,
                                                            fabricImages: uiConfig.fabricImages,
                                                        });
                                                        alert('画像設定を保存しました');
                                                    } catch (e: any) {
                                                        alert(`画像設定の保存に失敗しました: ${e.message || e}`);
                                                    } finally {
                                                        setUiSaving(false);
                                                    }
                                                }}
                                            >
                                                画像設定を保存
                                            </button>
                                        </section>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Orders (Shopify) */}
                        {activeTab === 'orders' && (
                            <div>
                                <h2 className="text-xl font-bold mb-4">注文管理（Shopify連携）</h2>
                                <p className="mb-4 text-sm text-gray-600">
                                    Shopify 管理画面に登録された注文情報を読み込み、のぼり見積もりアプリ経由の注文内容（line item properties）を確認できます。
                                </p>

                                {!orders && !ordersLoading && (
                                    <button
                                        onClick={async () => {
                                            try {
                                                setOrdersLoading(true);
                                                setOrdersError(null);
                                                const res = await fetch('/api/admin-orders');
                                                if (!res.ok) {
                                                    const text = await res.text();
                                                    throw new Error(text || `Failed to load orders (${res.status})`);
                                                }
                                                const data = await res.json();
                                                setOrders(data.orders || []);
                                            } catch (e: any) {
                                                setOrdersError(e.message || '注文情報の読み込みに失敗しました');
                                            } finally {
                                                setOrdersLoading(false);
                                            }
                                        }}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                                    >
                                        Shopify から注文を読み込む
                                    </button>
                                )}

                                {ordersLoading && (
                                    <p className="mt-2 text-sm text-gray-500">読み込み中です...</p>
                                )}

                                {ordersError && (
                                    <p className="mt-2 text-sm text-red-600">{ordersError}</p>
                                )}

                                {orders && (
                                    <div className="mt-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-xs text-gray-500">
                                                取得件数: <span className="font-bold">{orders.length}</span>件（最新順・最大50件）
                                            </p>
                                            <input
                                                type="text"
                                                className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
                                                placeholder="注文名 / 顧客 / メール / タグ でフィルタ"
                                                value={ordersFilter}
                                                onChange={(e) => setOrdersFilter(e.target.value)}
                                            />
                                        </div>

                                        <div className="overflow-x-auto border rounded-lg bg-white">
                                            <table className="min-w-full text-xs">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-3 py-2 text-left border-b">注文</th>
                                                        <th className="px-3 py-2 text-left border-b">ステータス</th>
                                                        <th className="px-3 py-2 text-left border-b">顧客</th>
                                                        <th className="px-3 py-2 text-left border-b">金額</th>
                                                        <th className="px-3 py-2 text-left border-b">商品 / line item properties</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {orders
                                                        .filter(o => {
                                                            if (!ordersFilter.trim()) return true;
                                                            const q = ordersFilter.toLowerCase();
                                                            const target = [
                                                                o.name,
                                                                o.customer?.name,
                                                                o.customer?.email,
                                                                o.tags,
                                                            ]
                                                                .filter(Boolean)
                                                                .join(' ')
                                                                .toLowerCase();
                                                            return target.includes(q);
                                                        })
                                                        .map(order => {
                                                            const noboriLine = order.lineItems.find(li =>
                                                                (li.properties || []).some(p => p.name === 'サイズ')
                                                            );
                                                            return (
                                                                <tr key={order.id} className="border-t align-top hover:bg-gray-50">
                                                                    <td className="px-3 py-2">
                                                                        <div className="font-mono font-bold text-gray-800">{order.name}</div>
                                                                        <div className="text-[11px] text-gray-500">
                                                                            {new Date(order.createdAt).toLocaleString()}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-3 py-2 text-[11px]">
                                                                        <div className="mb-1">
                                                                            <span className="inline-block px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold">
                                                                                {order.financialStatus || '不明'}
                                                                            </span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="inline-block px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                                                                                {order.fulfillmentStatus || '未出荷'}
                                                                            </span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-3 py-2 text-[11px]">
                                                                        <div className="font-medium text-gray-800">
                                                                            {order.customer?.name || '-'}
                                                                        </div>
                                                                        <div className="text-gray-500">
                                                                            {order.customer?.email || ''}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-3 py-2 text-[11px] whitespace-nowrap">
                                                                        <div className="font-bold">
                                                                            {order.totalPrice} {order.currency}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-3 py-2 text-[11px]">
                                                                        {order.lineItems.map(li => (
                                                                            <div
                                                                                key={li.id}
                                                                                className={`mb-2 p-2 rounded border ${li === noboriLine ? 'border-blue-300 bg-blue-50/60' : 'border-gray-200 bg-gray-50'
                                                                                    }`}
                                                                            >
                                                                                <div className="flex justify-between">
                                                                                    <span className="font-semibold text-gray-800">
                                                                                        {li.title} × {li.quantity}
                                                                                    </span>
                                                                                    <span className="text-gray-600">
                                                                                        ¥{Number(li.price).toLocaleString()}
                                                                                    </span>
                                                                                </div>
                                                                                {li.properties && li.properties.length > 0 && (
                                                                                    <dl className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5">
                                                                                        {li.properties.map((p) => (
                                                                                            <div key={`${li.id}-${p.name}`} className="flex">
                                                                                                <dt className="text-gray-500 mr-1">{p.name}:</dt>
                                                                                                <dd className="text-gray-800 truncate max-w-[160px]" title={p.value}>
                                                                                                    {p.value || '-'}
                                                                                                </dd>
                                                                                            </div>
                                                                                        ))}
                                                                                    </dl>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                </tbody>
                                            </table>
                                        </div>
                                        <p className="mt-2 text-[11px] text-gray-500">
                                            ※ ここは表示専用です。出荷処理やステータス更新は、これまで通り Shopify 管理画面側で行ってください。
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

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
