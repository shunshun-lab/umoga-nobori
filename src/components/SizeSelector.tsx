import { useState } from 'react';
import optionReferenceImage from '@/lib/150x150.png';
import { type SizeId } from '@/utils/constants';
import { useStore } from '@/store';
import { calculateNoboriPrice } from '@/utils/priceCalculator';
import type { NoboriSpecs } from '@/types/nobori.types';

interface Props {
  value: SizeId | 'custom';
  specs: NoboriSpecs;
  onChange: (size: SizeId | 'custom', dimensions?: { width: number; height: number }) => void;
}

export function SizeSelector({ value, specs, onChange }: Props) {
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // Master Data
  const sizesMaster = useStore(state => state.sizes);
  const fabrics = useStore(state => state.fabrics);
  const options = useStore(state => state.options);
  const pricingTables = useStore(state => state.pricingTables);
  const discountRules = useStore(state => state.discountRules);
  const fabricLimits = useStore(state => state.fabricLimits);

  // Get current limits
  const currentFabricId = specs.fabric || 'polyester';
  const limits = fabricLimits[currentFabricId] || { maxWidth: 150, maxHeight: 1200 };

  const getDynamicPrice = (sizeId: string): string => {
    if (sizeId === 'custom') {
      if (specs.customDimensions && specs.customDimensions.width && specs.customDimensions.height) {
        const tempSpec = { ...specs, size: 'custom' as const, customDimensions: specs.customDimensions };
        const calc = calculateNoboriPrice(tempSpec, { sizes: sizesMaster, fabrics, options, pricingTables, discountRules });
        return `¥${calc.unitPrice.toLocaleString()}`;
      }
      return '都度見積';
    }

    const tempSpec = { ...specs, size: sizeId as SizeId, options: [] };
    const calc = calculateNoboriPrice(tempSpec, { sizes: sizesMaster, fabrics, options, pricingTables, discountRules });
    return `¥${calc.unitPrice.toLocaleString()}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-purple-100 rounded-xl">
          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </div>
        <h2 className="text-xl font-bold">サイズを選択</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {Object.entries(sizesMaster).map(([id, size]) => (
          <div key={id} className={`flex flex-col ${id === 'custom' && value === 'custom' ? 'col-span-1 md:col-span-2' : ''}`}>
            <button
              onClick={() => onChange(id as SizeId)}
              className={`
                w-full group relative p-4 rounded-2xl border-2 text-left transition-all duration-200 h-full
                ${value === id
                  ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-lg ring-4 ring-blue-100'
                  : 'border-gray-200 hover:border-blue-400 hover:shadow-md bg-white'
                }
              `}
            >
              <div className="flex items-stretch gap-4">
                {/* Left: check + text info */}
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    {value === id ? (
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                    )}
                    <div className="font-bold text-base text-gray-900">{size.displayName}</div>
                  </div>
                  <div className="text-xs text-gray-600 leading-relaxed ml-7 mb-2">{size.description}</div>
                  <div className="flex items-baseline space-x-1 ml-7 mt-auto">
                    <span className="text-blue-600 font-black text-lg">
                      {getDynamicPrice(id)}
                    </span>
                    <span className="text-gray-500 text-xs">〜</span>
                  </div>
                </div>

                {/* Right: 1:1 square image */}
                <div
                  className="flex-shrink-0 w-20 h-20 rounded-lg border border-gray-100 shadow-sm bg-gray-50 overflow-hidden cursor-zoom-in"
                  onClick={(e) => {
                    e.stopPropagation();
                    setZoomedImage(optionReferenceImage);
                  }}
                >
                  <img
                    src={optionReferenceImage}
                    alt={`${size.displayName} の仕上がりイメージ`}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </button>

            {/* カスタムサイズ入力エリア */}
            {id === 'custom' && value === 'custom' && (
              <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100 animate-fadeIn">
                <p className="text-sm font-bold text-gray-700 mb-2">サイズを入力してください (cm)</p>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">
                      横幅 (W) <span className="text-red-500">Max: {limits.maxWidth}</span>
                    </label>
                    <input
                      id="custom-width"
                      type="number"
                      max={limits.maxWidth}
                      placeholder={`Max ${limits.maxWidth}`}
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      onChange={(e) => {
                        let w = parseInt(e.target.value) || 0;
                        const hInput = document.getElementById('custom-height') as HTMLInputElement;
                        const h = parseInt(hInput?.value) || 0;
                        onChange('custom', { width: w, height: h });
                      }}
                    />
                  </div>
                  <span className="mt-5 text-gray-400">×</span>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">
                      高さ (H) <span className="text-red-500">Max: {limits.maxHeight}</span>
                    </label>
                    <input
                      id="custom-height"
                      type="number"
                      max={limits.maxHeight}
                      placeholder={`Max ${limits.maxHeight}`}
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      onChange={(e) => {
                        let h = parseInt(e.target.value) || 0;
                        const wInput = document.getElementById('custom-width') as HTMLInputElement;
                        const w = parseInt(wInput?.value) || 0;
                        onChange('custom', { width: w, height: h });
                      }}
                    />
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  ※ {limits.maxWidth}cm × {limits.maxHeight}cm までの範囲で指定可能です。
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Image zoom modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-8"
          onClick={() => setZoomedImage(null)}
        >
          <img
            src={zoomedImage}
            alt="拡大画像"
            className="max-w-full max-h-full rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
