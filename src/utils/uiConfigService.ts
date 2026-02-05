import type { UiConfig, BannerItem, TemplateItem, OptionImagesConfig, SizeImagesConfig, FabricImagesConfig } from './uiConfigTypes';

// 将来 Firestore 実装に差し替える前提のサービス層
// ここでは一旦、自前 API (`/api/ui-config`) を叩く想定だけ書く

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`UI Config API error (${res.status}): ${text}`);
  }
  return res.json() as Promise<T>;
}

export const uiConfigService = {
  // まとめて読み込む
  async loadUiConfig(): Promise<UiConfig> {
    return fetchJson<UiConfig>('/api/ui-config');
  },

  // バナーだけ更新
  async saveBanners(items: BannerItem[]): Promise<void> {
    await fetchJson('/api/ui-config/banners', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  },

  // テンプレートだけ更新
  async saveTemplates(items: TemplateItem[]): Promise<void> {
    await fetchJson('/api/ui-config/templates', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  },

  // 画像系（オプション・サイズ・生地）をまとめて更新
  async saveImages(payload: {
    optionImages: OptionImagesConfig;
    sizeImages: SizeImagesConfig;
    fabricImages: FabricImagesConfig;
  }): Promise<void> {
    await fetchJson('/api/ui-config/images', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

