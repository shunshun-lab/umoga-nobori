
import { useState, useEffect } from 'react';
import { SizeSelector } from './SizeSelector';
import { FabricSelector } from './FabricSelector';
import { QuantityInput } from './QuantityInput';
import { OptionsSelector } from './OptionsSelector';
import { PriceDisplay } from './PriceDisplay';
import { DesignQuantitySelector } from './DesignQuantitySelector';
import { useNoboriPrice } from '@/hooks/useNoboriPrice';
import { useStore } from '@/store';
import { StickyEstimateFooter } from './StickyEstimateFooter';
import { BannerSlider } from './BannerSlider';
import { ScheduleSelector } from './ScheduleSelector';
import { AccessoriesSelector } from './AccessoriesSelector';
import { TemplateDownload } from './TemplateDownload';
import { uiConfigService } from '@/utils/uiConfigService';
import type { NoboriSpecs } from '@/types/nobori.types';
import type { NoboriTextSettings } from '@/utils/uiConfigTypes';

interface Props {
  onAddToCart: () => void;
}

export function NoboriEstimator({ onAddToCart }: Props) {
  const [specs, setSpecs] = useState<NoboriSpecs>({
    size: 'standard', // Default is standard, but can be 'custom'
    fabric: 'polyester',
    printMethod: 'full_color',
    quantity: 1,
    designs: [],
    options: [],
    customDimensions: undefined,
    designDataMethod: 'self',
    rushSchedule: false,
    accessories: [],
  });

  const [showMobileQuote, setShowMobileQuote] = useState(false);
  const [noboriText, setNoboriText] = useState<NoboriTextSettings | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const config = await uiConfigService.loadUiConfig();
        if (!mounted) return;
        if (config.noboriText) {
          setNoboriText(config.noboriText);
        }
      } catch {
        // 読み込み失敗時はデフォルト文言のまま
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const price = useNoboriPrice(specs);
  const addToCart = useStore(state => state.addToCart);

  // designsの変更を検知して合計数量を更新
  useEffect(() => {
    if (specs.designDataMethod === 'self' && specs.designs && specs.designs.length > 0) {
      const totalQuantity = specs.designs.reduce((sum, d) => sum + d.quantity, 0);
      if (totalQuantity !== specs.quantity) {
        setSpecs(prev => ({ ...prev, quantity: totalQuantity }));
      }
    }
  }, [specs.designs, specs.designDataMethod]);

  const handleAddToCart = () => {
    addToCart({
      specs,
      price,
    });
    onAddToCart();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* ページヘッダー（商品ごとの見出し）＋バナー */}
        <div className="mb-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {noboriText?.title || 'のぼり製作 オンライン見積もり'}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              {noboriText?.subtitle || 'サイズ・生地・枚数を選ぶだけでその場で金額がわかります'}
            </p>
          </div>
          <BannerSlider />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-12 pb-40 lg:pb-24">

            {/* お届け予定 */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-bold text-green-800">お届け予定</span>
              </div>
              <div className="text-sm space-y-1">
                <div className="font-bold text-green-900">
                  {specs.rushSchedule
                    ? 'お急ぎ納期：3〜5営業日'
                    : '通常納期：7〜10営業日'
                  }
                </div>
                <div className="text-green-700">
                  {(() => {
                    const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];
                    const base = new Date();
                    const days = specs.rushSchedule ? 3 : 7;
                    base.setDate(base.getDate() + days);
                    return `発送予定日: ${base.getMonth() + 1}/${base.getDate()}(${WEEKDAYS[base.getDay()]}) 頃`;
                  })()}
                </div>
              </div>
            </div>

            {/* Step 1: 仕様選択 */}
            <section id="specs" className="space-y-12">
              <div className="flex items-center space-x-3 mb-6 border-b pb-2">
                <h2 className="text-xl font-bold text-gray-900">仕様を選択</h2>
              </div>

              <div id="size">
                <SizeSelector
                  value={specs.size}
                  specs={specs}
                  onChange={(size, dimensions) => setSpecs(prev => ({
                    ...prev,
                    size,
                    customDimensions: dimensions !== undefined ? dimensions : prev.customDimensions
                  }))}
                />
              </div>

              <div id="fabric">
                <FabricSelector
                  value={specs.fabric}
                  onChange={(fabric) => setSpecs({ ...specs, fabric })}
                />
              </div>

              <div id="options">
                <OptionsSelector
                  value={specs.options}
                  specs={specs}
                  onChange={(options) => setSpecs({ ...specs, options })}
                />
              </div>

              {/* 完全データ入稿の場合は個別の枚数指定を使うため、ここでは合計を表示（または非表示） */
              /* ただし、外部URL利用等でファイルがない場合は手入力できるようにする */}
              <div id="quantity">
                {(specs.designDataMethod !== 'self' || (specs.designs && specs.designs.length === 0)) && (
                  <QuantityInput
                    value={specs.quantity}
                    onChange={(quantity) => setSpecs({ ...specs, quantity })}
                  />
                )}
                {specs.designDataMethod === 'self' && specs.designs && specs.designs.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 flex items-center justify-between">
                    <div className="font-bold text-blue-900">合計数量</div>
                    <div className="text-xl font-bold text-blue-600">{specs.quantity}枚</div>
                  </div>
                )}
              </div>

              <div id="schedule">
                <ScheduleSelector
                  value={specs.rushSchedule || false}
                  onChange={(rush) => setSpecs({ ...specs, rushSchedule: rush })}
                />
                {/* ⑨ 出荷日の目安表示（簡易カレンダー） */}
                <div className="mt-4 bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-xs font-bold text-gray-600">出荷予定日の目安</div>
                      <div className="text-sm text-gray-700">
                        {(() => {
                          const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];
                          const base = new Date();
                          const days = specs.rushSchedule ? 3 : 7;
                          base.setDate(base.getDate() + days);
                          return `${base.getMonth() + 1}/${base.getDate()}(${WEEKDAYS[base.getDay()]}) 頃`;
                        })()}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="text-xs text-blue-600 hover:underline"
                      onClick={() => {
                        const today = new Date();
                        const iso = today.toISOString().slice(0, 10);
                        setSpecs(prev => ({
                          ...prev,
                          desiredShipDate: prev.desiredShipDate || iso,
                        }));
                      }}
                    >
                      希望出荷日を指定
                    </button>
                  </div>
                  {specs.desiredShipDate && (
                    <div className="mt-2 flex items-center space-x-2">
                      <input
                        type="date"
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                        value={specs.desiredShipDate}
                        onChange={(e) =>
                          setSpecs(prev => ({
                            ...prev,
                            desiredShipDate: e.target.value,
                          }))
                        }
                      />
                      <span className="text-xs text-gray-500">
                        ※ 実際の出荷可否はご注文後にご連絡します
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div id="accessories">
                <AccessoriesSelector
                  value={specs.accessories || []}
                  onChange={(acc) => setSpecs({ ...specs, accessories: acc })}
                  subtitle="のぼりの設置に必要な器具をお選びください"
                />
              </div>
            </section>

            {/* Step 2: デザインアップロード */}
            <section id="design" className="border-t pt-12">
              <div className="flex items-center space-x-3 mb-6 border-b pb-2">
                <h2 className="text-xl font-bold text-gray-900">デザインアップロード</h2>
              </div>

              <TemplateDownload />

              <div className="space-y-8 mt-6">
                {/* Method Selection */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div
                    onClick={() => setSpecs({ ...specs, designDataMethod: 'self', quantity: specs.designs?.reduce((s, d) => s + d.quantity, 0) || 1 })}
                    className={`cursor-pointer rounded-xl p-6 border-2 transition-all ${specs.designDataMethod === 'self' ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-100' : 'border-gray-200 hover:border-blue-300'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg text-gray-900">完全データ入稿</h3>
                      {specs.designDataMethod === 'self' && <div className="w-4 h-4 rounded-full bg-blue-600"></div>}
                      {specs.designDataMethod !== 'self' && <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>}
                    </div>
                    <p className="text-sm text-gray-500 mb-2">Illustrator(.ai)等の完成データをアップロード</p>
                    <div className="flex justify-between items-center">
                      <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-bold">無料</span>
                      <a href="/data-guide" target="_blank" className="text-xs text-blue-600 hover:underline flex items-center" onClick={(e) => e.stopPropagation()}>
                        入稿ガイドはこちら
                        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      </a>
                    </div>
                  </div>

                  <div
                    onClick={() => setSpecs({ ...specs, designDataMethod: 'request', quantity: 1 })}
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

                {/* Mode-specific content */}
                {specs.designDataMethod === 'request' && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h4 className="font-bold text-gray-900">制作のご要望</h4>
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-sm text-yellow-800 my-4">
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

                {/* File Upload (shared: both modes) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-1">ファイルアップロード（任意）</h4>
                  <p className="text-xs text-gray-500 mb-4">
                    {specs.designDataMethod === 'self'
                      ? '完成データをアップロードしてください。後からメール等でもお送りいただけます。'
                      : 'ラフ案や参考画像があればアップロードしてください。後からメール等でもお送りいただけます。'
                    }
                  </p>
                  <DesignQuantitySelector
                    designs={specs.designs || []}
                    onDesignsChange={(designs) => setSpecs({ ...specs, designs })}
                  />

                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mt-4">
                    <h4 className="font-bold text-gray-900 mb-2 text-sm flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      ファイルサイズが大きい場合
                    </h4>
                    <p className="text-xs text-gray-600 mb-3">
                      200MBを超えるファイルや、6個以上のファイルがある場合は、外部ストレージサービス（ギガファイル便など）をご利用ください。
                    </p>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">ダウンロードURL</label>
                      <input
                        type="url"
                        value={specs.externalDataUrl || ''}
                        onChange={(e) => setSpecs({ ...specs, externalDataUrl: e.target.value })}
                        placeholder="https://gigafile.nu/..."
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 text-sm"
                      />
                      {specs.externalDataUrl && (
                        <p className="mt-2 text-xs text-green-600 font-bold flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          外部URLが入力されました
                        </p>
                      )}
                    </div>
                  </div>
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

            {/* Customer Voice Section */}
            <section id="voice" className="border-t pt-12">
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-2 bg-yellow-100 rounded-full">
                  <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">お客様の声</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold mr-3">E</div>
                    <div>
                      <div className="font-bold text-gray-900">イベント運営会社 ご担当者様</div>
                      <div className="text-xs text-gray-500">2024年 春 ご利用</div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    「オンラインでその場ですぐに金額と納期がわかるので、社内承認もスムーズでした。枚数やサイズを変えても自動で再計算されるので、最適な条件をその場で相談できたのが良かったです。」
                  </p>
                  <div className="w-full aspect-[8/5] bg-gray-100 rounded-xl overflow-hidden">
                    <img
                      src="https://placehold.co/800x500/f3f4f6/9ca3af?text=Sample+Photo"
                      alt="のぼり設置事例"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold mr-3">S</div>
                    <div>
                      <div className="font-bold text-gray-900">小売店 オーナー様</div>
                      <div className="text-xs text-gray-500">2024年 夏 ご利用</div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    「初めてのぼりを注文しましたが、サイズや生地の違いが画面でわかりやすく説明されていて安心して選べました。付属品も一緒に選べるので、届いてすぐに設置できました。」
                  </p>
                  <div className="w-full aspect-[8/5] bg-gray-100 rounded-xl overflow-hidden">
                    <img
                      src="https://placehold.co/800x500/f3f4f6/9ca3af?text=Sample+Photo"
                      alt="のぼり設置事例"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Step 3: 確認 (Hidden, since PriceDisplay is sticky) */}
            <section id="confirm" className="pt-12">
              {/* Mobile Action Area */}
              <div className="lg:hidden">
                <button
                  onClick={handleAddToCart}
                  disabled={false}
                  className={`w-full py-4 text-white rounded-xl font-bold shadow-lg text-lg 
                        ${'bg-gradient-to-r from-blue-600 to-blue-500'}`}
                >
                  カートに入れる
                </button>
              </div>
            </section>

          </div>

          {/* Desktop Right Column: Sticky Price Display */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <PriceDisplay price={price} specs={specs} />

              <div className="mt-6">
                <button
                  onClick={handleAddToCart}
                  disabled={false}
                  className={`w-full py-4 text-white rounded-xl font-bold shadow-lg flex justify-center items-center space-x-2 text-lg transform transition-all duration-200 
                    ${'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 hover:-translate-y-1 hover:shadow-xl'}`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>カートに入れる</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Overlay) */}
      {showMobileQuote && (
        <div className="fixed inset-0 z-50 lg:hidden font-sans">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowMobileQuote(false)}
          />

          {/* Drawer Pane */}
          <div className="absolute top-0 right-0 h-full w-[85vw] max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col">
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
              <h3 className="font-bold text-lg text-gray-900 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                お見積もり詳細
              </h3>
              <button
                onClick={() => setShowMobileQuote(false)}
                className="p-2 text-gray-500 hover:bg-gray-200 rounded-full"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 bg-gray-50">
              <PriceDisplay price={price} specs={specs} />

              <div className="mt-8 pb-8">
                <button
                  onClick={handleAddToCart}
                  disabled={false}
                  className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-blue-700"
                >
                  カートに入れる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <StickyEstimateFooter
        price={price}
        specs={specs}
        onOpenDetail={() => setShowMobileQuote(true)}
        onAddToCart={handleAddToCart}
        disabled={false}
      />
    </div>
  );
}
