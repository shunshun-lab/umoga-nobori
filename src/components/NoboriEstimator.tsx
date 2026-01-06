import { useState } from 'react';
import { SizeSelector } from './SizeSelector';
import { FabricSelector } from './FabricSelector';
import { QuantityInput } from './QuantityInput';
import { OptionsSelector } from './OptionsSelector';
import { PriceDisplay } from './PriceDisplay';
import { FileUploader } from './FileUploader';
import { useNoboriPrice } from '@/hooks/useNoboriPrice';
import { useStore } from '@/store';
import type { NoboriSpecs } from '@/types/nobori.types';

interface Props {
  onAddToCart: () => void;
}

export function NoboriEstimator({ onAddToCart }: Props) {
  const [specs, setSpecs] = useState<NoboriSpecs>({
    size: 'standard', // Default is standard, but can be 'custom'
    fabric: 'polyester',
    printMethod: 'full_color',
    quantity: 1,
    options: [],
    customDimensions: undefined,
    designDataMethod: 'self',
  });

  const [files, setFiles] = useState<string[]>([]);

  const price = useNoboriPrice(specs);
  const addToCart = useStore(state => state.addToCart);
  const sizes = useStore(state => state.sizes);

  const handleAddToCart = () => {
    // Cartに追加
    addToCart({
      specs,
      price,
    });

    // 親コンポーネントに通知（画面遷移など）
    onAddToCart();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-12 pb-24">

            {/* Step 1: 仕様選択 */}
            <section id="specs">
              <div className="flex items-center space-x-3 mb-6 border-b pb-2">
                <h2 className="text-2xl font-bold text-gray-900">仕様を選択</h2>
              </div>

              <div className="space-y-8">
                <SizeSelector
                  value={specs.size}
                  specs={specs}
                  onChange={(size, dimensions) => setSpecs({
                    ...specs,
                    size,
                    customDimensions: dimensions
                  })}
                />

                <FabricSelector
                  value={specs.fabric}
                  onChange={(fabric) => setSpecs({ ...specs, fabric })}
                />

                <QuantityInput
                  value={specs.quantity}
                  onChange={(quantity) => setSpecs({ ...specs, quantity })}
                />

                <OptionsSelector
                  value={specs.options}
                  specs={specs}
                  onChange={(options) => setSpecs({ ...specs, options })}
                />
              </div>
            </section>

            {/* Step 2: データ入稿・デザイン */}
            <section id="design" className="border-t pt-12">
              <div className="flex items-center space-x-3 mb-6 border-b pb-2">
                <h2 className="text-2xl font-bold text-gray-900">データ・デザイン選択</h2>
              </div>

              <div className="space-y-8">
                {/* Method Selection */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div
                    onClick={() => setSpecs({ ...specs, designDataMethod: 'self' })}
                    className={`cursor-pointer rounded-xl p-6 border-2 transition-all ${specs.designDataMethod === 'self' ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-100' : 'border-gray-200 hover:border-blue-300'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg text-gray-900">完全データ入稿</h3>
                      {specs.designDataMethod === 'self' && <div className="w-4 h-4 rounded-full bg-blue-600"></div>}
                      {specs.designDataMethod !== 'self' && <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>}
                    </div>
                    <p className="text-sm text-gray-500 mb-2">Illustrator(.ai)等の完成データをアップロード</p>
                    <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-bold">無料</span>
                  </div>

                  <div
                    onClick={() => setSpecs({ ...specs, designDataMethod: 'request' })}
                    className={`cursor-pointer rounded-xl p-6 border-2 transition-all ${specs.designDataMethod === 'request' ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-100' : 'border-gray-200 hover:border-blue-300'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg text-gray-900">デザイン制作依頼</h3>
                      {specs.designDataMethod === 'request' && <div className="w-4 h-4 rounded-full bg-blue-600"></div>}
                      {specs.designDataMethod !== 'request' && <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>}
                    </div>
                    <p className="text-sm text-gray-500 mb-2">ラフ案や文字情報からプロがデザイン作成</p>
                    <span className="inline-block bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded font-bold">+5,500円</span>
                  </div>
                </div>

                {/* Dynamic Content */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  {specs.designDataMethod === 'self' ? (
                    <div className="space-y-4">
                      <h4 className="font-bold text-gray-900">データアップロード</h4>
                      <FileUploader
                        files={files}
                        onFilesChange={setFiles}
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h4 className="font-bold text-gray-900">制作のご要望</h4>
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-sm text-yellow-800 mb-4">
                        <p className="font-bold mb-1">【流れについて】</p>
                        <p>ご注文完了後、担当者よりメールにて詳細なヒアリングを行います。ここでは大まかなイメージや入れたい文字をご入力ください。</p>
                      </div>
                      <textarea
                        value={specs.designRequestDetails || ''}
                        onChange={(e) => setSpecs({ ...specs, designRequestDetails: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all min-h-[150px]"
                        placeholder="例：赤色をベースに「大売り出し」という文字を入れてください。ロゴは後でメールで送ります。"
                      />
                    </div>
                  )}
                </div>

                {/* Common Options */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4">オプション情報（任意）</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">案件名・データ名</label>
                      <input
                        type="text"
                        value={specs.orderName || ''}
                        onChange={(e) => setSpecs({ ...specs, orderName: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                        placeholder="管理用名称（例: 7月イベント用）"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Step 3: 確認 */}
            <section id="confirm" className="border-t pt-12">
              <div className="flex items-center space-x-3 mb-6 border-b pb-2">
                <h2 className="text-2xl font-bold text-gray-900">注文内容の確認</h2>
              </div>

              <div className="bg-white rounded-2xl shadow-md p-6">
                {/* Print Header */}
                <div className="hidden print:block mb-8 border-b-2 border-gray-800 pb-4">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">御見積書</h1>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>発行日: {new Date().toLocaleDateString()}</span>
                    <span>株式会社サンプル</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold">ご入力内容</h2>
                </div>

                <dl className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <dt className="text-gray-600 font-medium">案件名・データ名</dt>
                    <dd className="font-bold text-gray-900">{specs.orderName || '（未入力）'}</dd>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <dt className="text-gray-600 font-medium">サイズ</dt>
                    <dd className="font-bold text-gray-900">
                      {specs.size === 'custom'
                        ? `サイズ指定 ${specs.customDimensions?.width || '?'}x${specs.customDimensions?.height || '?'}cm`
                        : (sizes[specs.size]?.displayName || sizes[specs.size]?.name || specs.size)}
                    </dd>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <dt className="text-gray-600 font-medium">生地</dt>
                    <dd className="font-bold text-gray-900">{specs.fabric}</dd>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <dt className="text-gray-600 font-medium">数量</dt>
                    <dd className="font-bold text-gray-900">{specs.quantity}枚</dd>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <dt className="text-gray-600 font-medium">オプション</dt>
                    <dd className="font-bold text-gray-900">
                      {specs.options.length > 0
                        ? specs.options.join(', ')
                        : 'なし'}
                    </dd>
                  </div>

                  {/* Design / Data Section */}
                  <div className="py-3">
                    <dt className="text-gray-600 font-medium mb-1">入稿・デザイン</dt>
                    {specs.designDataMethod === 'self' ? (
                      <dd className="font-bold text-gray-900">
                        完全データ入稿
                        <div className="mt-1 text-sm font-normal text-gray-600 flex items-center">
                          {files.length > 0 ? (
                            <>
                              <svg className="w-4 h-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                              {files.length}ファイル アップロード済み
                            </>
                          ) : (
                            <span className="text-orange-500">※後日メール等で入稿してください</span>
                          )}
                        </div>
                      </dd>
                    ) : (
                      <dd>
                        <div className="font-bold text-blue-600">デザイン制作依頼 (+¥5,500)</div>
                        {specs.designRequestDetails && (
                          <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
                            {specs.designRequestDetails}
                          </div>
                        )}
                        <div className="mt-1 text-xs text-gray-500">※詳細なヒアリングは注文後にメールで行います</div>
                      </dd>
                    )}
                  </div>
                </dl>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleAddToCart}
                  className="px-8 py-4 text-white rounded-xl font-bold shadow-lg flex items-center space-x-2 text-lg transform transition-all duration-200 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 hover:-translate-y-1 hover:shadow-xl"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>カートに入れる</span>
                </button>
              </div>
            </section>

          </div>

          {/* 右側: 価格表示 (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <PriceDisplay price={price} specs={specs} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
