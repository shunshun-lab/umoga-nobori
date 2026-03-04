import { useState } from 'react';
import optionReferenceImage from '@/lib/150x150.png';
import { FABRICS, type FabricId } from '@/utils/constants';

interface Props {
  value: FabricId;
  onChange: (fabric: FabricId) => void;
}

export function FabricSelector({ value, onChange }: Props) {
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-orange-100 rounded-xl">
          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        </div>
        <h2 className="text-xl font-bold">生地を選択</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {Object.entries(FABRICS).map(([id, fabric]) => (
          <label
            key={id}
            className={`
              relative flex items-stretch p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200
              ${value === id
                ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-lg ring-4 ring-blue-100'
                : 'border-gray-200 hover:border-blue-400 hover:shadow-md bg-white'
              }
            `}
          >
            <input
              type="radio"
              name="fabric"
              checked={value === id}
              onChange={() => onChange(id as FabricId)}
              className="sr-only"
            />

            <div className="flex items-stretch gap-4 w-full">
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
                  <div className="font-bold text-base text-gray-900">{fabric.displayName}</div>
                  {fabric.multiplier > 1.0 && (
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-bold">
                      +{Math.round((fabric.multiplier - 1) * 100)}%
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-600 leading-relaxed ml-7 mb-2">{fabric.description}</div>
                <div className="flex flex-wrap gap-1.5 ml-7 mt-auto">
                  {fabric.features.map((feature) => (
                    <span key={feature} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right: 1:1 square image */}
              <div
                className="flex-shrink-0 w-20 h-20 rounded-lg border border-gray-100 shadow-sm bg-gray-50 overflow-hidden cursor-zoom-in"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setZoomedImage(optionReferenceImage);
                }}
              >
                <img
                  src={optionReferenceImage}
                  alt={`${fabric.displayName} のイメージ`}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </label>
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
