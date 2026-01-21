import { SIZES, FABRICS, ACCESSORIES } from './constants';
import type { NoboriSpecs, PriceBreakdown } from '@/types/nobori.types';
import type { PricingTables, DiscountRule } from '@/store';

// Helper: 10cm rounding (Ceil logic as requested by user)
// e.g. 45 -> 50. 62 -> 70.
const ceil10 = (n: number) => Math.ceil(n / 10) * 10;

export interface CalculatorContext {
  sizes: typeof SIZES | Record<string, any>;
  fabrics: typeof FABRICS | Record<string, any>;
  options: Record<string, any>;
  accessories?: typeof ACCESSORIES | Record<string, any>; // Added
  pricingTables: PricingTables;
  discountRules: DiscountRule[];
}

export function calculateNoboriPrice(
  specs: NoboriSpecs,
  context: CalculatorContext
): PriceBreakdown {
  const { sizes, fabrics, options, pricingTables, discountRules } = context;

  // 1. Determine Base Dimensions & Price from Matrix
  let width = 0;
  let height = 0;
  let basePrice = 0;

  if (specs.size === 'custom' && specs.customDimensions) {
    width = specs.customDimensions.width;
    height = specs.customDimensions.height;
  } else {
    const s = sizes[specs.size];
    width = s?.width || 0;
    height = s?.height || 0;
  }

  // Matrix Lookup
  const fabricKey = specs.fabric;
  const matrix = pricingTables.priceMatrix[fabricKey];

  // We check if "matrix" has the detailed structure
  if (specs.size === 'custom' && matrix && matrix.widths_cm && matrix.heights_cm && matrix.prices_yen) {
    if (width > 0 && height > 0) {
      // Use ceil10 for Round Up behavior
      const lookupW = ceil10(width);
      const lookupH = ceil10(height);

      const wIndex = matrix.widths_cm.indexOf(lookupW);
      const hIndex = matrix.heights_cm.indexOf(lookupH);

      if (wIndex !== -1 && hIndex !== -1 && matrix.prices_yen[hIndex]) {
        basePrice = matrix.prices_yen[hIndex][wIndex] || 0;
      }
    }
  } else {
    // Standard Size or Matrix Fallback
    const s = sizes[specs.size];
    if (s?.basePrice) {
      // Apply Fabric Multiplier explicitly since we are not using Matrix
      const fabricMult = fabrics[fabricKey]?.multiplier || (fabricKey === 'tropical' ? 1.4 : 1.0); // Rough estimate 1.4 for Tropical if not defined
      basePrice = Math.floor(s.basePrice * fabricMult);
    }
  }

  // Fabric Multiplier Fallback (Only if basePrice is 0 or matrix missing?)
  // Actually, if Matrix is missing, basePrice is 0. 
  // We can try to use standard size basePrice from constants as fallback?
  if (basePrice === 0) {
    const s = sizes[specs.size];
    if (s?.basePrice) {
      const fabricMult = fabrics[fabricKey]?.multiplier || 1.0;
      basePrice = Math.floor(s.basePrice * fabricMult);
    }
  }


  // Check for size limits (Quote Required)
  // Constraint: 150cm x 3000cm for main fabrics
  const isOversized = (width > 150 && height > 150) || width > 3000 || height > 3000;
  const quoteRequired = isOversized;

  // 2. Quantity Discount Multiplier
  const quantity = specs.quantity || 1;
  // discountRules are sorted ASC. Finds last rule where qty >= min.
  // e.g. [ {1, 1.0}, {10, 0.5} ] -> Qty 5 uses 1.0. Qty 11 uses 0.5.
  const rules = discountRules || [];
  let applicableRule = rules[0];

  for (const r of rules) {
    if (quantity >= r.minQuantity) {
      applicableRule = r;
    }
  }

  const multiplier = applicableRule ? applicableRule.rate : 1.0;
  const unitPriceBase = Math.floor(basePrice * multiplier);

  // 3. Segment Factor
  const segments = specs.segments || 1; // Default to 1 (Standard Nobori is 1 piece)
  const segmentFactor = pricingTables.segmentFactors?.[segments] || 1.0;
  const bodyPrice = Math.floor(unitPriceBase * segments * segmentFactor);

  // 4. Options
  let optionsTotal = 0;

  (specs.options || []).forEach(optId => {
    const opt = options[optId];
    if (!opt) return;

    let optCost = 0;

    if (opt.type === 'heat_cut') {
      // -10% of Unit Price Base
      const discount = Math.floor(unitPriceBase * -0.1);
      optCost = discount * segments;
    } else if (opt.type === 'reinforcement') {
      // Unit + 600 Additive Cost
      optCost = 600 * segments;
    } else if (opt.type === 'bagging') {
      // Area based
      const area = width * height;
      const raw = Math.floor(area / 40);
      const rounded = Math.floor(raw / 10) * 10;
      optCost = rounded * segments;
    } else {
      // Standard fixed price
      optCost = opt.price * segments;
    }
    optionsTotal += optCost;
  });

  // 5. Accessories
  let accessoriesTotal = 0;
  if (specs.accessories) {
    specs.accessories.forEach(acc => {
      // Use imported constant directly
      // @ts-ignore
      const item = ACCESSORIES[acc.id];
      if (item) {
        accessoriesTotal += item.price * acc.quantity;
      }
    });
  }

  // Final Sum
  const unitPriceTotal = quoteRequired ? 0 : (bodyPrice + optionsTotal);

  // Design Fee (One-time, Per Order)
  const designFee = specs.designDataMethod === 'request' ? 5500 : 0;

  const totalPrice = (unitPriceTotal * quantity) + designFee + accessoriesTotal;
  const wholesalePrice = Math.floor(totalPrice * 0.8);

  return {
    basePrice,
    fabricCost: 0,
    optionsCost: optionsTotal * quantity,
    designFee,
    discount: 0,
    discountLabel: applicableRule?.label || '',
    unitPrice: unitPriceTotal,
    totalPrice,
    wholesalePrice,
    // Legacy fields for compatibility
    subtotal: totalPrice,
    discountRate: multiplier,
    quoteRequired
  };
}
