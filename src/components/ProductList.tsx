import noboriImage from '@/../shopify-theme/assets/option-sample.jpg';
interface Props {
    onSelectProduct: (productId: 'nobori' | 'admin') => void;
}

export function ProductList({ onSelectProduct }: Props) {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                        商品を選択してください
                    </h1>
                    <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
                        お見積もり・ご注文可能な商品一覧
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {/* のぼり旗カード */}
                    <div
                        onClick={() => onSelectProduct('nobori')}
                        className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 ring-2 ring-transparent hover:ring-blue-500"
                    >
                        <div className="aspect-w-3 aspect-h-2 bg-gray-200 group-hover:opacity-75 relative h-48 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden">
                            <img
                                src={noboriImage}
                                alt="のぼり旗 サンプル画像"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                のぼり旗・横断幕
                            </h3>
                            <p className="mt-2 text-sm text-gray-500">
                                店舗の集客に最適。サイズ・生地・加工オプションを自由にカスタマイズできます。
                            </p>
                            <div className="mt-4 flex items-center text-blue-600 font-medium">
                                <span>見積もりを作成</span>
                                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* 今後の商品（プレースホルダー） */}
                    <div className="bg-gray-100 rounded-2xl p-6 border border-gray-200 opacity-60">
                        <div className="h-48 bg-gray-200 rounded-xl mb-4 flex items-center justify-center">
                            <span className="text-gray-400 font-bold">Coming Soon</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-500">Tシャツプリント</h3>
                        <p className="mt-1 text-sm text-gray-400">準備中</p>
                    </div>

                    <div className="bg-gray-100 rounded-2xl p-6 border border-gray-200 opacity-60">
                        <div className="h-48 bg-gray-200 rounded-xl mb-4 flex items-center justify-center">
                            <span className="text-gray-400 font-bold">Coming Soon</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-500">チラシ・フライヤー</h3>
                        <p className="mt-1 text-sm text-gray-400">準備中</p>
                    </div>

                </div>

                <div className="mt-24 pt-8 border-t border-gray-200 text-center">
                    <p className="text-gray-400 text-sm mb-4">© 2025 umoga</p>
                    <button
                        onClick={() => onSelectProduct('admin' as any)}
                        className="text-xs text-gray-300 hover:text-gray-500 transition-colors"
                    >
                        管理者ログイン
                    </button>
                </div>
            </div>
        </div>
    );
}
