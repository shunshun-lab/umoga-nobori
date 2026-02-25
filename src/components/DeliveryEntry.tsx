import { useState } from 'react';
import { useShopify } from '@/hooks/useShopify';
import { useStore } from '@/store';

interface Props {
    onBack: () => void;
    onComplete: () => void;
}

export function DeliveryEntry({ onBack, onComplete }: Props) {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: ''
    });
    const [devSuccess, setDevSuccess] = useState(false);

    const cart = useStore(state => state.cart);
    const cartDeliveryMode = useStore(state => state.cartDeliveryMode);
    const deliverySettings = useStore(state => state.deliverySettings);
    const clearCart = useStore(state => state.clearCart);

    const { submitOrder, isSubmitting, error } = useShopify();

    const isFormValid = formData.name.trim() && formData.phone.trim() && formData.email.trim();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid || isSubmitting) return;

        const result = await submitOrder(
            cart,
            { name: formData.name, phone: formData.phone, email: formData.email },
            cartDeliveryMode,
            deliverySettings.rushSurchargeRate
        );

        if (result.success) {
            if (result.devMode) {
                // DEV_MODE: show success panel
                setDevSuccess(true);
            } else if (result.invoiceUrl) {
                // Production: redirect to Shopify invoice
                clearCart();
                window.location.href = result.invoiceUrl;
            }
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <button
                onClick={onBack}
                className="mb-6 text-gray-500 hover:text-gray-900 flex items-center"
            >
                ← カートに戻る
            </button>

            <h1 className="text-2xl font-bold mb-8">お客様情報の入力</h1>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                </div>
            )}

            {devSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                    <p className="font-bold">DEV MODE: 送信成功</p>
                    <p className="text-sm mt-1">Draft Order ペイロードはコンソールを確認してください。</p>
                    <button
                        onClick={onComplete}
                        className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700"
                    >
                        商品一覧に戻る
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">お名前 <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="山田 太郎"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">電話番号 <span className="text-red-500">*</span></label>
                            <input
                                type="tel"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="090-1234-5678"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">メールアドレス <span className="text-red-500">*</span></label>
                            <input
                                type="email"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="example@email.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={!isFormValid || isSubmitting}
                            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition flex items-center justify-center
                                ${isFormValid && !isSubmitting ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}
                            `}
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    送信中...
                                </>
                            ) : (
                                'Shopify決済へ進む'
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
