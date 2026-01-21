
import { useState, useEffect } from 'react';

import { ACCESSORIES } from '@/utils/constants';

// Convert object to array for display
const ACCESSORIES_LIST = Object.values(ACCESSORIES);

interface Props {
    value: { id: string; quantity: number }[];
    onChange: (accessories: { id: string; quantity: number }[]) => void;
}

export function AccessoriesSelector({ value, onChange }: Props) {
    const [selectedItems, setSelectedItems] = useState<{ [key: string]: number }>({});

    useEffect(() => {
        // Init state from props
        const map: { [key: string]: number } = {};
        value.forEach(item => {
            map[item.id] = item.quantity;
        });
        setSelectedItems(map);
    }, [value]);

    const updateQuantity = (id: string, qty: number) => {
        const newMap = { ...selectedItems, [id]: qty };
        if (qty <= 0) {
            delete newMap[id];
        }
        setSelectedItems(newMap);

        // Convert back to array for parent
        const newArray = Object.entries(newMap).map(([k, v]) => ({ id: k, quantity: v })).filter(i => i.quantity > 0);
        onChange(newArray);
    };

    return (
        <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-indigo-100 rounded-xl">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold">器具・付属品</h2>
            </div>

            <div className="grid gap-4">
                {ACCESSORIES_LIST.map((item) => {
                    const qty = selectedItems[item.id] || 0;
                    return (
                        <div key={item.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                            <div className="flex items-center space-x-4">
                                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                                <div>
                                    <div className="font-bold text-gray-900">{item.name}</div>
                                    <div className="text-sm text-gray-500">¥{item.price.toLocaleString()}</div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => updateQuantity(item.id, Math.max(0, qty - 1))}
                                    className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                                >-</button>
                                <span className="font-bold w-8 text-center">{qty}</span>
                                <button
                                    onClick={() => updateQuantity(item.id, qty + 1)}
                                    className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200"
                                >+</button>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="mt-4 text-right">
                <a href="#" className="text-blue-600 font-bold hover:underline text-sm">その他付属品一覧はこちら &rarr;</a>
            </div>
        </div>
    );
}
