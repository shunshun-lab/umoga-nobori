import { QUANTITY_DISCOUNTS } from '@/utils/constants';

interface Props {
  value: number;
  onChange: (quantity: number) => void;
}

export function QuantityInput({ value, onChange }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-green-100 rounded-xl">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold">数量</h2>
      </div>

      {/* クイック選択 */}
      <div className="mb-5">
        <div className="text-sm font-medium text-gray-700 mb-3">クイック選択</div>
        <div className="flex flex-wrap gap-3">
          {[1, 10, 30, 50, 100].map((qty) => (
            <button
              key={qty}
              onClick={() => onChange(qty)}
              className={`
                px-6 py-3 rounded-xl border-2 font-bold transition-all duration-200
                ${value === qty
                  ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100/50 text-blue-700 shadow-lg ring-4 ring-blue-100'
                  : 'border-gray-200 bg-white hover:border-blue-400 hover:shadow-md text-gray-700'
                }
              `}
            >
              {qty}枚
            </button>
          ))}
        </div>
      </div>

      {/* 数値入力 */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          カスタム数量を入力
        </label>
        <input
          type="number"
          min="1"
          max="10000"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || 1)}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 placeholder-gray-400 text-lg font-semibold"
          placeholder="数量を入力"
        />
      </div>

      {/* 数量割引案内 */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-5 border-2 border-yellow-100">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <div className="font-bold text-orange-800">数量割引適用</div>
        </div>
        <p className="text-sm text-gray-700 mt-2">
          枚数に応じて割引が自動適用されます（最大81.15%OFF）
        </p>
      </div>
    </div>
  );
}
