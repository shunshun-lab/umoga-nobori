import { useMemo } from 'react';
import { calculateNoboriPrice } from '@/utils/priceCalculator';
import type { NoboriSpecs, PriceBreakdown } from '@/types/nobori.types';
import { useStore } from '@/store';

export function useNoboriPrice(specs: NoboriSpecs): PriceBreakdown {
  // Storeからマスタデータを取得
  const sizes = useStore((state) => state.sizes);
  const fabrics = useStore((state) => state.fabrics);
  const options = useStore((state) => state.options);
  const pricingTables = useStore((state) => state.pricingTables);
  const discountRules = useStore((state) => state.discountRules);

  return useMemo(() => {
    return calculateNoboriPrice(specs, {
      sizes,
      fabrics,
      options,
      pricingTables,
      discountRules,
    });
  }, [specs, sizes, fabrics, options, pricingTables, discountRules]);
}
