// サイズ仕様
export const SIZES = {
  standard: {
    id: 'standard',
    name: 'レギュラー',
    displayName: '60×180cm（レギュラー）',
    width: 60,
    height: 180,
    basePrice: 1200,
    description: '最も一般的なサイズ。店舗前や道路沿いに最適',
  },
  slim: {
    id: 'slim',
    name: 'スリム',
    displayName: '45×180cm（スリム）',
    width: 45,
    height: 180,
    basePrice: 1000,
    description: '幅が狭く設置場所を選ばない。省スペース',
  },
  short: {
    id: 'short',
    name: 'ショート',
    displayName: '60×150cm（ショート）',
    width: 60,
    height: 150,
    basePrice: 1100,
    description: '高さ控えめ。風の影響を受けにくい',
  },
  mini: {
    id: 'mini',
    name: 'ミニ',
    displayName: '45×150cm（ミニ）',
    width: 45,
    height: 150,
    basePrice: 900,
    description: 'コンパクトサイズ。店内・卓上用に',
  },
  custom: {
    id: 'custom',
    name: 'カスタム',
    displayName: 'サイズ指定',
    width: 0,
    height: 0,
    basePrice: 1200,
    description: 'ご希望のサイズで製作（10cm単位）',
  },
} as const;

export type SizeId = keyof typeof SIZES;

// 生地仕様
export const FABRICS = {
  polyester: {
    id: 'polyester',
    name: 'ポンジ',
    displayName: 'ポンジ（標準）',
    multiplier: 1.0,
    description: '軽量で安価。一般的な用途に最適',
    features: ['軽い', '安価', '乾きやすい'],
    recommended: true, // デフォルト推奨
  },
  tropical: {
    id: 'tropical',
    name: 'トロピカル',
    displayName: 'トロピカル',
    multiplier: 1.3, // Used for Standard Sizes. Custom sizes use Matrix.
    description: 'ポンジより少し厚手。発色が良く耐久性もUP',
    features: ['発色良', '耐久性', '少し厚手'],
    recommended: false,
  },
} as const;

export type FabricId = keyof typeof FABRICS;

// 印刷方法
export const PRINT_METHODS = {
  full_color: {
    id: 'full_color',
    name: 'フルカラー印刷',
    multiplier: 1.0,
    description: '写真やグラデーションも美しく再現',
    recommended: true,
  },
  single_color: {
    id: 'single_color',
    name: '単色印刷',
    multiplier: 0.7,
    description: '1色のみ。シンプルなデザインに最適',
    recommended: false,
  },
} as const;

export type PrintMethodId = keyof typeof PRINT_METHODS;

// オプション加工
export const OPTIONS = {
  pole_pocket: {
    id: 'pole_pocket',
    name: '棒袋加工',
    displayName: '棒袋加工（上下）',
    price: 0,
    displayPrice: 'サイズによる',
    description: 'のぼりポールを通す袋を上下に縫製',
    required: false,
    type: 'bagging'
  },
  chichi: {
    id: 'chichi',
    name: 'チチ加工',
    displayName: 'チチ加工（ハトメ）',
    price: 100,
    description: 'ポールに取り付けるための輪（チチ）を付ける',
    required: false,
    type: 'standard'
  },
  heat_cut: {
    id: 'heat_cut',
    name: 'ヒートカット',
    displayName: 'ヒートカット仕上げ',
    price: 0,
    displayPrice: '単価の10%引',
    description: '熱で裁断しほつれを防止。綺麗な仕上がり',
    required: false,
    type: 'heat_cut'
  },
  reinforcement: {
    id: 'reinforcement',
    name: '両面遮光材',
    displayName: '両面遮光材',
    price: 600,
    displayPrice: '単価+600円/枚',
    description: '裏抜けしない遮光材を使用',
    required: false,
    type: 'reinforcement'
  },
  waterproof: {
    id: 'waterproof',
    name: '防水加工',
    displayName: '防水加工',
    price: 300,
    description: '屋外での使用に。雨に強い',
    required: false,
    type: 'standard'
  },
} as const;

export type OptionId = keyof typeof OPTIONS;

// 数量割引テーブル
// 数量割引テーブル (Updated to match detailed requirements)
export const QUANTITY_DISCOUNTS = [
  { min: 1, max: 1, rate: 0, label: '割引なし' },
  { min: 2, max: 4, rate: 0.20, label: '20%OFF' },
  { min: 5, max: 9, rate: 0.35, label: '35%OFF' },
  { min: 10, max: 19, rate: 0.50, label: '50%OFF' },
  { min: 20, max: 29, rate: 0.55, label: '55%OFF' },
  { min: 30, max: 39, rate: 0.60, label: '60%OFF' },
  { min: 40, max: 49, rate: 0.65, label: '65%OFF' },
  { min: 50, max: 59, rate: 0.70, label: '70%OFF' },
  { min: 60, max: 69, rate: 0.75, label: '75%OFF' },
  { min: 70, max: 79, rate: 0.77, label: '77%OFF' },
  { min: 80, max: 89, rate: 0.78, label: '78%OFF' },
  { min: 90, max: 99, rate: 0.79, label: '79%OFF' },
  { min: 100, max: 199, rate: 0.80, label: '80%OFF' },
  { min: 200, max: 299, rate: 0.81, label: '81%OFF' },
  { min: 300, max: 399, rate: 0.811, label: '81.1%OFF' },
  { min: 400, max: Infinity, rate: 0.8115, label: '81.15%OFF' },
] as const;

// 割引適用の判定
export function getDiscountRate(quantity: number): number {
  const bracket = QUANTITY_DISCOUNTS.find(
    d => quantity >= d.min && quantity <= d.max
  );
  return bracket?.rate || 0;
}

export function getDiscountLabel(quantity: number): string {
  const bracket = QUANTITY_DISCOUNTS.find(
    d => quantity >= d.min && quantity <= d.max
  );
  return bracket?.label || '';
}
