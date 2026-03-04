
interface Props {
    value: boolean;
    onChange: (isRush: boolean) => void;
}

const WEEKDAY_NAMES = ['日', '月', '火', '水', '木', '金', '土'];

export function ScheduleSelector({ value, onChange }: Props) {
    const deliveryDateNormal = new Date();
    deliveryDateNormal.setDate(deliveryDateNormal.getDate() + 7);

    const deliveryDateRush = new Date();
    deliveryDateRush.setDate(deliveryDateRush.getDate() + 3);

    const formatDate = (date: Date) => {
        const weekday = WEEKDAY_NAMES[date.getDay()];
        return `${date.getMonth() + 1}/${date.getDate()}(${weekday})`;
    };

    return (
        <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center space-x-3 mb-2">
                <div className="p-3 bg-teal-100 rounded-xl">
                    <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-xl font-bold">納期について</h2>
                    <a href="#" className="text-xs text-blue-600 hover:underline">詳しくはこちら</a>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-4">
                {/* Normal Schedule */}
                <label className={`
                    relative flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all
                    ${!value
                        ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-100'
                        : 'border-gray-200 hover:border-blue-300'
                    }
                `}>
                    <input
                        type="radio"
                        name="schedule"
                        checked={!value}
                        onChange={() => onChange(false)}
                        className="sr-only"
                    />
                    <div className="flex items-center gap-2">
                        {!value ? (
                            <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                        )}
                        <div>
                            <div className="font-bold text-base text-gray-900">通常納期</div>
                            <div className="text-sm text-gray-500">発送予定: {formatDate(deliveryDateNormal)}頃</div>
                        </div>
                    </div>
                </label>

                {/* Rush Schedule */}
                <label className={`
                    relative flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all
                    ${value
                        ? 'border-orange-500 bg-orange-50/50 shadow-md ring-2 ring-orange-100'
                        : 'border-gray-200 hover:border-orange-300'
                    }
                `}>
                    <div className="absolute -top-3 right-4 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                        お急ぎ
                    </div>
                    <input
                        type="radio"
                        name="schedule"
                        checked={value}
                        onChange={() => onChange(true)}
                        className="sr-only"
                    />
                    <div className="flex items-center gap-2">
                        {value ? (
                            <svg className="w-5 h-5 text-orange-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                        )}
                        <div>
                            <div className="font-bold text-base text-gray-900 flex items-center">
                                特急出荷
                                <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">要相談</span>
                            </div>
                            <div className="text-sm text-gray-500">発送予定: {formatDate(deliveryDateRush)}頃</div>
                        </div>
                    </div>
                </label>
            </div>
        </div>
    );
}
