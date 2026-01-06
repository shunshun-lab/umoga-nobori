import { useStore } from '@/store';

interface Props {
    onCartClick: () => void;
    onHomeClick: () => void;
}

export function Header({ onCartClick, onHomeClick }: Props) {
    const cart = useStore((state) => state.cart);
    const cartItemCount = cart.length;

    return (
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50 print:hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div
                    onClick={onHomeClick}
                    className="cursor-pointer flex items-center space-x-2"
                >
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                        N
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-gray-900 tracking-tight leading-none">
                            のぼりのウモガ
                        </h1>
                        <p className="text-[10px] text-gray-500 font-medium leading-none mt-0.5">
                            見積もり・注文システム
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <button
                        onClick={onCartClick}
                        className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        {cartItemCount > 0 && (
                            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full min-w-[18px]">
                                {cartItemCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
}
