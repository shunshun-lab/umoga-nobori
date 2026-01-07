import { useState } from 'react';
import type { ShippingAddress } from '@/types/nobori.types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (address: ShippingAddress) => void;
    initialAddress?: ShippingAddress;
}

export function AddressModal({ isOpen, onClose, onSave, initialAddress }: Props) {
    const [formData, setFormData] = useState<Partial<ShippingAddress>>(initialAddress || {
        name: '',
        companyName: '',
        phone: '',
        postalCode: '',
        prefecture: '',
        city: '',
        address1: '',
        address2: '',
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.phone || !formData.postalCode || !formData.prefecture) {
            alert('必須項目を入力してください');
            return;
        }

        onSave({
            ...formData as ShippingAddress,
            id: initialAddress?.id || Math.random().toString(36).substring(2, 9),
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit} className="p-6 md:p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {initialAddress ? 'お届け先の編集' : '新しいお届け先を追加'}
                        </h2>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">お名前 <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition"
                                    placeholder="山田 太郎"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">会社名・部署名 (任意)</label>
                                <input
                                    type="text"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition"
                                    placeholder="株式会社サンプル"
                                    value={formData.companyName}
                                    onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">電話番号 <span className="text-red-500">*</span></label>
                            <input
                                type="tel"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition"
                                placeholder="090-1234-5678"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                required
                            />
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                住所情報
                            </h3>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">郵便番号 <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition"
                                        placeholder="123-4567"
                                        value={formData.postalCode}
                                        onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">都道府県 <span className="text-red-500">*</span></label>
                                    <select
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition"
                                        value={formData.prefecture}
                                        onChange={e => setFormData({ ...formData, prefecture: e.target.value })}
                                        required
                                    >
                                        <option value="">選択</option>
                                        <option value="北海道">北海道</option>
                                        <option value="東京都">東京都</option>
                                        <option value="大阪府">大阪府</option>
                                        <option value="福岡県">福岡県</option>
                                        {/* Simplified list for now */}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">市区町村・番地 <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition"
                                        placeholder="千代田区1-1-1"
                                        value={formData.address1}
                                        onChange={e => setFormData({ ...formData, address1: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">建物名・部屋番号</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition"
                                        placeholder="メゾン千代田 101"
                                        value={formData.address2}
                                        onChange={e => setFormData({ ...formData, address2: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-lg font-bold text-gray-600 hover:bg-gray-100 transition"
                        >
                            キャンセル
                        </button>
                        <button
                            type="submit"
                            className="px-8 py-3 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5"
                        >
                            保存する
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
