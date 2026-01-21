import optionReferenceImage from '@/../shopify-theme/assets/option-sample.jpg';
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
  const optionsMaster = useStore((state) => state.options);
  const exclusions = useStore((state) => state.exclusions);
  const optionVisibility = useStore((state) => state.optionVisibility); // New

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

  // Helper to calculate cost impact of a single option
  const getOptionPrice = (optionId: string): number => {
    // We calculate the delta between "No Options" and "Only This Option"
    // relative to the CURRENT specs (Size, Fabric, Qty).
    // Note: We use the *Current* quantity to get the correct multiplier,
    // but we return the *Per Unit* cost for display.

    // Base Spec (No options)
    const baseSpec = { ...specs, options: [] };
    const baseCalc = calculateNoboriPrice(baseSpec, { sizes, fabrics, options: optionsMaster, pricingTables, discountRules });

    // With Option Spec
    const withSpec = { ...specs, options: [optionId as OptionId] };
    const withCalc = calculateNoboriPrice(withSpec, { sizes, fabrics, options: optionsMaster, pricingTables, discountRules });

    // Total Difference
    const diffTotal = withCalc.totalPrice - baseCalc.totalPrice;

    // Per Unit Difference
    // Use Math.round to avoid floating point ugliness, though usually integers.
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
        <h2 className="text-2xl font-bold">オプション加工</h2>
      </div>

      <div className="flex flex-col xl:flex-row gap-8">
        <div className="space-y-3 flex-1">
          {Object.entries(optionsMaster).map(([id, option]) => {
            if (optionVisibility && optionVisibility[id] === false) return null;

            const price = getOptionPrice(id);
            const sign = price > 0 ? '+' : ''; // Negative has built-in minus

            return (
              <label
                key={id}
                className={`
                flex items-start p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200
                ${value.includes(id as OptionId)
                    ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-lg ring-4 ring-blue-100'
                    : 'border-gray-200 hover:border-blue-400 hover:shadow-md bg-white'
                  }
              `}
              >
                <div className="relative mt-1">
                  <input
                    type="checkbox"
                    checked={value.includes(id as OptionId)}
                    onChange={() => toggleOption(id as OptionId)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                </div>

                <div className="ml-4 mr-4 w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden hidden sm:block">
                  <img src="https://placehold.co/200x200?text=Option" alt="Option" className="w-full h-full object-cover" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-bold text-xl text-gray-900">{option.displayName}</div>
                    {value.includes(id as OptionId) && (
                      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 leading-relaxed mb-2">{option.description}</div>

                  {/* Option Image Injection Point */}
                  {option.imageUrl && (
                    <div className="mt-3 mb-1">
                      <img src={option.imageUrl} alt={option.displayName} className="h-32 object-contain rounded-lg border border-gray-100 shadow-sm" />
                    </div>
                  )}
                </div>

                <div className="ml-4 flex items-center">
                  <div className={`px-3 py-1 rounded-lg font-bold text-sm ${price < 0 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                    {sign}¥{price.toLocaleString()}
                  </div>
                </div>
              </label>
            );
          })}
        </div>

        <figure className="flex-shrink-0 w-full xl:w-80">
          <img
            src={optionReferenceImage}
            alt="オプション加工イメージ"
            className="w-full h-auto rounded-2xl shadow-md"
          />
          <figcaption className="mt-3 text-sm text-gray-500">
            棒袋縫製など代表的な加工イメージです。
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
