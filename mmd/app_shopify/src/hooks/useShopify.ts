import { useState } from 'react';
import type { DeliveryInfo } from '@/types/nobori.types';
import type { CartItem } from '@/store';

const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';

interface SubmitResult {
  success: boolean;
  invoiceUrl?: string;
  devMode?: boolean;
  error?: string;
}

export function useShopify() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitOrder = async (
    cartItems: CartItem[],
    deliveryInfo: DeliveryInfo,
    rushSurchargeRate: number
  ): Promise<SubmitResult> => {
    setError(null);
    setIsSubmitting(true);

    try {
      // Calculate surcharge (per-item: only rush items)
      const rushSubtotal = cartItems
        .filter(item => item.deliveryMode === 'rush')
        .reduce((sum, item) => sum + item.price.totalPrice, 0);
      const surcharge = Math.floor(rushSubtotal * rushSurchargeRate);

      const payload = {
        cart: cartItems,
        deliveryInfo,
        surcharge,
      };

      // DEV_MODE: skip API call
      if (DEV_MODE) {
        console.log('=== DEV MODE: Draft Order Payload ===');
        console.log(JSON.stringify(payload, null, 2));
        return { success: true, devMode: true };
      }

      // Production: call backend
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Checkout failed');
      }

      const data = await response.json();
      if (!data.invoiceUrl) {
        throw new Error('No invoice URL returned');
      }

      return { success: true, invoiceUrl: data.invoiceUrl };
    } catch (err: any) {
      const message = err.message || '注文の送信に失敗しました';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitOrder, isSubmitting, error };
}
