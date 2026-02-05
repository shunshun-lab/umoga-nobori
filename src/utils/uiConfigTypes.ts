// UI 設定用の型定義（Firestore / API 共有）

export interface BannerItem {
  id: string;
  imageUrl: string;
  linkUrl?: string;
  sortOrder: number;
  active: boolean;
}

export interface TemplateItem {
  id: string;
  name: string;
  fileUrl: string;
  sizeId?: string; // 'standard' など
  sortOrder: number;
  active: boolean;
}

export interface SimpleImageItem {
  imageUrl: string;
  sortOrder: number;
  active: boolean;
}

export interface OptionImagesConfig {
  byOptionId: {
    [optionId: string]: {
      images: SimpleImageItem[];
    };
  };
}

export interface SizeImagesConfig {
  bySizeId: {
    [sizeId: string]: {
      images: SimpleImageItem[];
    };
  };
}

export interface FabricImagesConfig {
  byFabricId: {
    [fabricId: string]: {
      images: SimpleImageItem[];
    };
  };
}

export interface NoboriTextSettings {
  title: string;
  subtitle?: string;
}

// まとめて取得する場合のUI設定
export interface UiConfig {
  banners: BannerItem[];
  templates: TemplateItem[];
  optionImages: OptionImagesConfig;
  sizeImages: SizeImagesConfig;
  fabricImages: FabricImagesConfig;
  noboriText: NoboriTextSettings;
}

