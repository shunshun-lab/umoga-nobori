import { useState } from 'react';
import { useStore } from '@/store';

export function SheetSyncTab() {
    const discountRules = useStore((state) => state.discountRules);
    const fetchDiscountRules = useStore((state) => state.fetchDiscountRules);

    const [email, setEmail] = useState('');
    const [key, setKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSync = async () => {
        setLoading(true);
        setError(null);
        setSuccess(false);
        try {
            await fetchDiscountRules(email, key);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Sync failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-blue-900 mb-2">Google Sheet 連携</h3>
                <div className="mb-4 bg-white p-3 rounded-lg border border-blue-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600">価格ロジック・マスタデータはこちらのシートで管理しています。</p>
                        <a
                            href="https://docs.google.com/spreadsheets/d/1vVLc_q4F4i186AuzSo82N-9VBs1rQt3DQKRtFiM7r-8/edit?usp=sharing"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline font-bold mt-1 inline-block"
                        >
                            Google Sheetを開く ↗
                        </a>
                    </div>
                </div>

                <p className="text-sm text-blue-700 mb-4">
                    シートから最新ルールを取得し、システムに反映します。<br />
                    <strong>参照形式 (A〜C列):</strong><br />
                    A列: 適用枚数 (min_qty)<br />
                    B列: 価格倍率 (rate, 例: 0.8)<br />
                    C列: ラベル (label, 例: 20%OFF)
                </p>

                <div className="space-y-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Service Account Email</label>
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="(空欄の場合、環境変数の GOOGLE_SERVICE_ACCOUNT_EMAIL を使用します)"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Private Key</label>
                        <textarea
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            placeholder="(空欄の場合、環境変数の GOOGLE_PRIVATE_KEY を使用します)"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 h-24 font-mono text-xs"
                        />
                    </div>
                    <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                        ※ Vercelの環境変数が設定されている場合、上記は空欄で「同期」を押すと自動的に環境変数が使用されます。
                    </div>
                </div>

                <button
                    onClick={handleSync}
                    disabled={loading}
                    className={`
            px-6 py-2 rounded-lg font-bold text-white transition-colors flex items-center space-x-2
            ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
          `}
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>同期中...</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>シートから最新ルールを取得</span>
                        </>
                    )}
                </button>

                {error && (
                    <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg text-sm">
                        エラー: {error}
                    </div>
                )}
                {success && (
                    <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-lg text-sm">
                        同期に成功しました！最新の割引ルールが適用されています。
                    </div>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <h3 className="px-6 py-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-700">
                    現在の割引ルール (Read Only)
                </h3>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">適用数量 (Min Qty)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">割引後の価格率 (Rate)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ラベル</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">単価例 (通常¥2,000の場合)</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {discountRules.map((rule, idx) => (
                            <tr key={idx}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                    {rule.minQuantity}枚 〜
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {rule.rate * 100}%
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        {rule.label}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                                    ¥{(2000 * rule.rate).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
