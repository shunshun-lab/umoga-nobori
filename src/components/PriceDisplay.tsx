import type { PriceBreakdown, NoboriSpecs } from '@/types/nobori.types';
import { useStore } from '@/store';

interface Props {
  price: PriceBreakdown;
  specs: NoboriSpecs;
}

export function PriceDisplay({ price, specs }: Props) {
  const sizes = useStore((state) => state.sizes);
  const fabrics = useStore((state) => state.fabrics);
  const options = useStore((state) => state.options);

  const selectedSize = sizes[specs.size] || sizes.standard;
  const selectedFabric = fabrics[specs.fabric] || fabrics.polリエステル;
  const selectedOptions = specs.options.map(id => options[id]).filter(Boolean);

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200 p-6 sticky top-4">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-blue-100 rounded-xl">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold">お見積もり</h3>
      </div>

      {/* 仕様詳細 (Summary Breakdown) */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm divide-y divide-gray-200">
        <div className="flex justify-between py-2">
          <span className="text-gray-500 font-medium">サイズ</span>
          <span className="font-bold text-gray-900 text-right">
            {specs.size === 'custom'
              ? `サイズ指定 ${specs.customDimensions?.width}x${specs.customDimensions?.height}cm`
              : selectedSize.name}
          </span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-gray-500 font-medium">生地</span>
          <span className="font-bold text-gray-900 text-right">{selectedFabric.name}</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-gray-500 font-medium">オプション</span>
          <span className="font-bold text-gray-900 text-right">
            {selectedOptions.length > 0
              ? selectedOptions.map(o => o.name).join('、')
              : 'なし'}
          </span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-gray-500 font-medium">数量</span>
          <span className="font-bold text-gray-900 text-right">{specs.quantity} 枚</span>
        </div>
        {price.designFee > 0 && (
          <div className="flex justify-between py-2 text-blue-600 bg-blue-50/50 rounded px-1">
            <span className="font-bold">データ制作依頼</span>
            <span className="font-bold text-right">+ ¥{price.designFee.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* 合計 */}
      <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl">
        <div className="text-sm text-gray-700 font-medium mb-2">合計金額（税込）</div>
        <div className="text-5xl font-black text-blue-600 mb-3">
          {price.quoteRequired ? (
            <span className="text-4xl text-orange-600">別途お見積もり</span>
          ) : (
            `¥${price.totalPrice.toLocaleString()}`
          )}
        </div>
        {!price.quoteRequired && (
          <div className="flex items-center space-x-2 text-sm text-gray-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-bold">1枚あたり ¥{price.unitPrice.toLocaleString()}</span>
          </div>
        )}
        {price.quoteRequired && (
          <p className="text-sm text-orange-600 font-bold">
            ※ 規定サイズ（150×3000cm）を超えるため、別途お見積もりとなります。
          </p>
        )}
      </div>

      {/* 納期 */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-100">
        <div className="flex items-center space-x-3 mb-2">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <div className="text-sm font-bold text-green-800">お届け予定</div>
        </div>
        <div className="text-lg font-bold text-green-900">
          ご注文から7〜10営業日
        </div>
      </div>
    </div>
  );
}
