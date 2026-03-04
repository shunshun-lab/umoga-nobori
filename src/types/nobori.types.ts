import type { SizeId, FabricId, PrintMethodId, OptionId } from '@/utils/constants';

export interface DesignItem {
  id: string;
  file: File | string;
  previewUrl?: string;
  quantity: number;
}

export interface NoboriSpecs {
  size: SizeId | 'custom';
  customDimensions?: {
    width: number;
    height: number;
  };
  fabric: FabricId;
  printMethod: PrintMethodId;
  quantity: number;
  options: OptionId[];
  segments?: number; // 2, 3, or 4
  orderName?: string; // Optional: Reference name
  designDataMethod: 'self' | 'request'; // 'self' = AI/Upload, 'request' = Professional Design
  designRequestDetails?: string; // Text for design request
  rushSchedule?: boolean;
  designs?: DesignItem[];
  accessories?: { id: string; quantity: number }[];
  desiredShipDate?: string;
  externalDataUrl?: string;
}

export interface DeliveryInfo {
  name: string;
  phone: string;
  email: string;
}

export interface ShippingAddress {
  id?: string;
  name: string;
  companyName?: string;
  zip?: string;
  postalCode?: string;
  prefecture: string;
  city: string;
  address1: string;
  address2?: string;
  phone: string;
}

export interface PriceBreakdown {
  // 基本料金（サイズ×生地×印刷）
  basePrice: number;

  // 生地による追加料金
  fabricCost: number;

  // オプション料金合計
  optionsCost: number;

  // デザイン作成費
  designFee: number;

  // 小計（割引前）
  subtotal: number;

  // 数量割引額
  discount: number;

  // 合計金額
  totalPrice: number;

  // 1枚あたり単価
  unitPrice: number;

  // 適用された割引率
  discountRate: number;

  // 割引ラベル
  discountLabel: string;
  wholesalePrice: number;
  quoteRequired: boolean;
  accessoriesCost: number;
}
