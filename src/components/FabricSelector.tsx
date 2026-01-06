import { FABRICS, type FabricId } from '@/utils/constants';

interface Props {
  value: FabricId;
  onChange: (fabric: FabricId) => void;
}

export function FabricSelector({ value, onChange }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-orange-100 rounded-xl">
          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold">生地を選択</h2>
      </div>

      <div className="space-y-3">
        {Object.entries(FABRICS).map(([id, fabric]) => (
          <label
            key={id}
            className={`
              flex items-start p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200
              ${value === id
                ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-lg ring-4 ring-blue-100'
                : 'border-gray-200 hover:border-blue-400 hover:shadow-md bg-white'
              }
            `}
          >
            <div className="relative mt-1">
              <input
                type="radio"
                name="fabric"
                checked={value === id}
                onChange={() => onChange(id as FabricId)}
                className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
              />
            </div>

            <div className="flex-1 ml-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-xl text-gray-900">{fabric.displayName}</div>
                {value === id && (
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="text-sm text-gray-600 mb-3 leading-relaxed">{fabric.description}</div>
              <div className="flex flex-wrap gap-2">
                {fabric.features.map((feature) => (
                  <span key={feature} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            {fabric.multiplier > 1.0 && (
              <div className="ml-4 flex flex-col items-end">
                <div className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg font-bold text-sm">
                  +{Math.round((fabric.multiplier - 1) * 100)}%
                </div>
              </div>
            )}
          </label>
        ))}
      </div>
    </div>
  );
}
