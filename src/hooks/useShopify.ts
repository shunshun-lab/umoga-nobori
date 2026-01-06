import { useState } from 'react';
import { createCart, addToCart as addToCartAPI } from '@/lib/shopify';

export function useShopify() {
  const [cartId, setCartId] = useState<string | null>(
    localStorage.getItem('shopify_cart_id')
  );

  const addToCart = async (
    variantId: string,
    quantity: number,
    customAttributes: Array<{ key: string; value: string }>
  ): Promise<string> => {
    try {
      let checkoutUrl: string;

      if (!cartId) {
        // カート作成（Tokenless版）
        const result = await createCart(variantId, quantity, customAttributes);

        if (result.cartCreate.userErrors.length > 0) {
          throw new Error(result.cartCreate.userErrors[0].message);
        }

        const newCartId = result.cartCreate.cart.id;
        checkoutUrl = result.cartCreate.cart.checkoutUrl;

        setCartId(newCartId);
        localStorage.setItem('shopify_cart_id', newCartId);
      } else {
        // 既存カートに追加（Tokenless版）
        const result = await addToCartAPI(cartId, variantId, quantity, customAttributes);

        if (result.cartLinesAdd.userErrors.length > 0) {
          throw new Error(result.cartLinesAdd.userErrors[0].message);
        }

        checkoutUrl = result.cartLinesAdd.cart.checkoutUrl;
      }

      return checkoutUrl;
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    }
  };

  return { addToCart };
}
