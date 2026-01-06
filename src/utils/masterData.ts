import masterJson from '@/lib/Umoga Webapp Tables.json';
import { OPTIONS, type OptionId } from '@/utils/constants';

// Type helper for JSON structure
interface MasterJson {
    tables: {
        quantity_discounts: { // Fixed key name
            bands: { min_qty: number; multiplier: number; label: string; }[];
        };
        segments: {
            factors: Record<string, number>;
        };
        price_matrices: Record<string, {
            widths_cm: number[];
            heights_cm: number[];
            prices_yen: number[][];
        }>;
        option_groups: any[];
    };
}

const data = masterJson as unknown as MasterJson;

// 1. Parse Discount Rules
// 1. Parse Discount Rules (Overridden by hardcoded requirements for now)
export const initialDiscountRules = [
    { minQuantity: 1, rate: 1.0, label: '通常価格' },
    { minQuantity: 2, rate: 0.8, label: '2枚〜 (20%OFF)' },
    { minQuantity: 5, rate: 0.65, label: '5枚〜 (35%OFF)' },
    { minQuantity: 10, rate: 0.5, label: '10枚〜 (50%OFF)' },
    { minQuantity: 20, rate: 0.45, label: '20枚〜 (55%OFF)' },
    { minQuantity: 30, rate: 0.4, label: '30枚〜 (60%OFF)' },
    { minQuantity: 40, rate: 0.35, label: '40枚〜 (65%OFF)' },
    { minQuantity: 50, rate: 0.3, label: '50枚〜 (70%OFF)' },
    { minQuantity: 60, rate: 0.25, label: '60枚〜 (75%OFF)' },
    { minQuantity: 70, rate: 0.23, label: '70枚〜 (77%OFF)' },
    { minQuantity: 80, rate: 0.22, label: '80枚〜 (78%OFF)' },
    { minQuantity: 90, rate: 0.21, label: '90枚〜 (79%OFF)' },
    { minQuantity: 100, rate: 0.2, label: '100枚〜 (80%OFF)' },
    { minQuantity: 200, rate: 0.19, label: '200枚〜 (81%OFF)' },
    { minQuantity: 300, rate: 0.189, label: '300枚〜 (81.1%OFF)' },
    { minQuantity: 400, rate: 0.1885, label: '400枚〜 (81.15%OFF)' },
].sort((a, b) => a.minQuantity - b.minQuantity);

// 2. Parse Segment Factors
export const initialSegmentFactors = Object.entries(data.tables.segments.factors).reduce((acc, [k, v]) => ({
    ...acc,
    [Number(k)]: v
}), {} as Record<number, number>);

// 3. Parse Price Matrix & Map Keys
const FABRIC_MAP: Record<string, string> = {
    'ポンジ': 'polyester',
    'ポンジ1': 'polyester', // Handle variations
    'トロピカル': 'tropical',
};

// Export the Mapped Matrix directly for the store
export const mappedPriceMatrix: Record<string, any> = {};

Object.entries(data.tables.price_matrices).forEach(([jsonKey, matrix]) => {
    // Find matching ID
    const fabricId = FABRIC_MAP[jsonKey];
    if (fabricId) {
        mappedPriceMatrix[fabricId] = matrix;
    }
});

export const fabricLimits: Record<string, { maxWidth: number; maxHeight: number }> = {};
Object.entries(mappedPriceMatrix).forEach(([id, matrix]) => {
    fabricLimits[id] = {
        maxWidth: Math.max(...(matrix.widths_cm || [0])),
        maxHeight: Math.max(...(matrix.heights_cm || [0])),
    };
});


// 4. Parse Options
export const initialOptions: Record<string, any> = {};

// Map Label to ID to preserve existing UI configs (icons etc)
const OPTION_NAME_MAP: Record<string, OptionId> = {
    'ヒートカット': 'heat_cut',
    '2つ折り　袋仕立て': 'pole_pocket',
    '両面遮光材': 'reinforcement',
    'チチ': 'chichi',
};

// Helper to determine type
const getOptionType = (ruleType: string): string => {
    if (ruleType === 'unit_price_multiplier') return 'heat_cut';
    if (ruleType === 'bag_cost_area_based') return 'bagging';
    if (ruleType === 'unit_price_plus_fixed') return 'reinforcement';
    return 'standard';
};

data.tables.option_groups.forEach((group: any, gIdx: number) => {
    group.options.forEach((opt: any, oIdx: number) => {
        // Exclude specific unwanted options
        if (opt.label === '30秒' || opt.label === '1分') return;

        // Try to match existing ID
        let id = Object.entries(OPTION_NAME_MAP).find(([key]) => opt.label.includes(key))?.[1] || `opt_${gIdx}_${oIdx}`;

        // Explicit overrides
        if (opt.label.includes('ヒートカット')) id = 'heat_cut';
        if (opt.label.includes('両面遮光材')) id = 'reinforcement';
        // Bagging logic check
        if (opt.pricing_rule?.type === 'bag_cost_area_based') id = 'pole_pocket';

        const existing = OPTIONS[id as OptionId];

        initialOptions[id] = {
            id,
            name: opt.label,
            price: opt.unit_price_yen || 0,
            type: getOptionType(opt.pricing_rule?.type),
            displayPrice: undefined,
            displayName: existing?.displayName || opt.label,
            description: existing?.description || '',
            required: false,
        };

        // Custom fix for specific dynamic displays
        if (initialOptions[id].type === 'heat_cut') initialOptions[id].displayPrice = '単価の10%引';
        if (initialOptions[id].type === 'bagging') initialOptions[id].displayPrice = 'サイズによる';
        if (initialOptions[id].type === 'reinforcement') initialOptions[id].displayPrice = '単価+600円/枚';
    });
});
