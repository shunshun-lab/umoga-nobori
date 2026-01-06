import { useState } from 'react';

interface Props {
    onBack: () => void;
    onComplete: () => void;
}

export function DeliveryEntry({ onBack, onComplete }: Props) {
    const [formData, setFormData] = useState({
        name: '',
        postalCode: '',
        prefecture: '',
        city: '',
        address1: '',
        address2: '',
        phone: '',
        email: ''
    });

    const isFormValid = formData.name && formData.phone && formData.email; // Simplified validation

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

            <h1 className="text-2xl font-bold mb-8">お届け先の入力</h1>

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

                    <div className="border-t border-gray-100 pt-6">
                        <h3 className="text-lg font-bold mb-4">住所</h3>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">郵便番号</label>
                                <input
                                    type="text"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="123-4567"
                                    value={formData.postalCode}
                                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">都道府県</label>
                                <select
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    value={formData.prefecture}
                                    onChange={(e) => setFormData({ ...formData, prefecture: e.target.value })}
                                >
                                    <option value="">選択してください</option>
                                    <option value="東京都">東京都</option>
                                    <option value="大阪府">大阪府</option>
                                    {/* Mock list */}
                                </select>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-bold text-gray-700 mb-1">市区町村・番地</label>
                            <input
                                type="text"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="千代田区1-1-1"
                                value={formData.address1}
                                onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">建物名・部屋番号</label>
                            <input
                                type="text"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="メゾン千代田 101"
                                value={formData.address2}
                                onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
                            />
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
                            注文内容を確認する（決済へ）
                        </button>
                        <p className="text-center text-sm text-gray-500 mt-2">
                            ※次の画面で決済は行われません（本日ここまで）
                        </p>
                    </div>
                </div>
            </form>
        </div>
    );
}
