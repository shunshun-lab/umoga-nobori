export function useShopify() {
  const addToCart = async (
    variantId: string,
    quantity: number,
    customAttributes: Array<{ key: string; value: string }>
  ): Promise<string> => {
    try {
      // 1. グローバルID(gid://...)の場合は数値ID部分だけ取り出す
      const numericVariantId =
        variantId.startsWith('gid://')
          ? variantId.split('/').pop() || ''
          : variantId;

      if (!numericVariantId) {
        throw new Error('バリアントIDが不正です');
      }

      // 2. line item properties 形式に変換
      const properties: Record<string, string> = {};
      for (const attr of customAttributes) {
        if (attr.key) {
          properties[attr.key] = attr.value ?? '';
        }
      }

      const shopDomain = import.meta.env.VITE_SHOPIFY_DOMAIN;
      if (!shopDomain) {
        throw new Error('VITE_SHOPIFY_DOMAIN が設定されていません');
      }

      // 3. Shopify ストア本番ドメインの /cart/add.js を叩く
      const response = await fetch(`https://${shopDomain}/cart/add.js`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          items: [
            {
              id: numericVariantId,
              quantity,
              properties,
            },
          ],
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Shopify cart error (${response.status}): ${text}`);
      }

      // 4. 成功したらチェックアウト画面へのURLを返す
      //    Shopify のオンラインストア上で動いている前提なので、相対パスでOK。
      return '/checkout';
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    }
  };

  return { addToCart };
}
