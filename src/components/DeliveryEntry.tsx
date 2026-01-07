import { useState } from 'react';
import { useStore } from '@/store';

interface Props {
    onBack: () => void;
    onComplete: () => void;
}

export function DeliveryEntry({ onBack, onComplete }: Props) {
    // We can pre-fill this with the first shipping address for convenience if available
    const shippingAddresses = useStore(state => state.shippingAddresses);
    const cart = useStore(state => state.cart);

    // Find first used address to prefill
    const firstUsedAddressId = cart[0]?.shipping?.addressId;
    const initialAddress = firstUsedAddressId ? shippingAddresses[firstUsedAddressId] : null;

    const [formData, setFormData] = useState({
        name: initialAddress?.name || '',
        phone: initialAddress?.phone || '',
        email: '',
        companyName: initialAddress?.companyName || '',
    });

    const isFormValid = formData.name && formData.phone && formData.email;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onComplete();
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <button
                onClick={onBack}
                className="mb-6 text-gray-500 hover:text-gray-900 flex items-center"
            >
                ← カートに戻る
            </button>

            <h1 className="text-2xl font-bold mb-8">注文者情報・決済（デモ）</h1>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                <p className="text-sm text-blue-800">
                    ※ 商品の配送先はカート画面で指定済みです。<br />
                    ここでは、<strong>ご注文者様（請求先）のご連絡先</strong>を入力してください。
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">お名前 (ご担当者様) <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="山田 太郎"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">会社名 (任意)</label>
                            <input
                                type="text"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="株式会社サンプル"
                                value={formData.companyName}
                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                            />
                        </div>
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

                    <div className="pt-6 border-t border-gray-100">
                        <label className="block text-sm font-bold text-gray-700 mb-4">お支払い方法</label>
                        <div className="space-y-3">
                            <label className="flex items-center p-4 border rounded-lg cursor-pointer bg-blue-50 border-blue-200">
                                <input type="radio" name="payment" className="w-5 h-5 text-blue-600" checked readOnly />
                                <span className="ml-3 font-bold text-gray-900">クレジットカード (デモ動作)</span>
                            </label>
                            <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                                <input type="radio" name="payment" className="w-5 h-5 text-blue-600" disabled />
                                <span className="ml-3 text-gray-500">銀行振込 (準備中)</span>
                            </label>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={!isFormValid}
                            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition
                                ${isFormValid ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}
                            `}
                        >
                            注文を確定する
                        </button>
                        <p className="text-center text-sm text-gray-500 mt-2">
                            ※これはデモシステムです。実際の注文・決済は行われません。
                        </p>
                    </div>
                </div>
            </form>
        </div>
    );
}
