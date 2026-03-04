import { useState } from 'react';
import optionReferenceImage from '@/lib/150x150.png';
import { type OptionId } from '@/utils/constants';
import { useStore } from '@/store';
import { calculateNoboriPrice } from '@/utils/priceCalculator';
import type { NoboriSpecs } from '@/types/nobori.types';

interface Props {
  value: OptionId[];
  specs: NoboriSpecs;
  onChange: (options: OptionId[]) => void;
}

export function OptionsSelector({ value, specs, onChange }: Props) {
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const optionsMaster = useStore((state) => state.options);
  const exclusions = useStore((state) => state.exclusions);
  const optionVisibility = useStore((state) => state.optionVisibility);

  // Master Data for Calculation
  const sizes = useStore(state => state.sizes);
  const fabrics = useStore(state => state.fabrics);
  const pricingTables = useStore(state => state.pricingTables);
  const discountRules = useStore(state => state.discountRules);

  const toggleOption = (optionId: OptionId) => {
    if (value.includes(optionId)) {
      onChange(value.filter(id => id !== optionId));
    } else {
      const incompatibleOptions = exclusions[optionId] || [];
      const hasConflict = value.some(id => incompatibleOptions.includes(id));

      if (hasConflict) {
        const newValue = value.filter(id => !incompatibleOptions.includes(id));
        onChange([...newValue, optionId]);
      } else {
        onChange([...value, optionId]);
      }
    }
  };

  const getOptionPrice = (optionId: string): number => {
    const baseSpec = { ...specs, options: [] };
    const baseCalc = calculateNoboriPrice(baseSpec, { sizes, fabrics, options: optionsMaster, pricingTables, discountRules });

    const withSpec = { ...specs, options: [optionId as OptionId] };
    const withCalc = calculateNoboriPrice(withSpec, { sizes, fabrics, options: optionsMaster, pricingTables, discountRules });

    const diffTotal = withCalc.totalPrice - baseCalc.totalPrice;
    return Math.round(diffTotal / specs.quantity);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-pink-100 rounded-xl">
          <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </div>
        <h2 className="text-xl font-bold">オプション加工</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {Object.entries(optionsMaster).map(([id, option]) => {
          if (optionVisibility && optionVisibility[id] === false) return null;

          const price = getOptionPrice(id);
          const sign = price > 0 ? '+' : '';
          const isSelected = value.includes(id as OptionId);

          return (
            <label
              key={id}
              className={`
                relative flex items-stretch p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200
                ${isSelected
                  ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-lg ring-4 ring-blue-100'
                  : 'border-gray-200 hover:border-blue-400 hover:shadow-md bg-white'
                }
              `}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleOption(id as OptionId)}
                className="sr-only"
              />

              <div className="flex items-stretch gap-4 w-full">
                {/* Left: check + text info */}
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    {isSelected ? (
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                    )}
                    <div className="font-bold text-base text-gray-900">{option.displayName}</div>
                  </div>
                  <div className="text-xs text-gray-600 leading-relaxed ml-7 mb-2">{option.description}</div>
                  <div className="ml-7 mt-auto">
                    <span className={`inline-block px-2 py-0.5 rounded text-sm font-bold ${price < 0 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                      {sign}¥{price.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Right: 1:1 square image */}
                <div
                  className="flex-shrink-0 w-20 h-20 rounded-lg border border-gray-100 shadow-sm bg-gray-50 overflow-hidden cursor-zoom-in"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setZoomedImage(option.imageUrl || optionReferenceImage);
                  }}
                >
                  <img
                    src={option.imageUrl || optionReferenceImage}
                    alt={option.displayName}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </label>
          );
        })}
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
