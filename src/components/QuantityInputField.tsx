
import { useState, useEffect } from 'react';

export function QuantityInputField({ value, onChange }: { value: number; onChange: (val: number) => void }) {
    const [localValue, setLocalValue] = useState(value.toString());

    useEffect(() => {
        // Only update local value if the number value changes significantly 
        // (avoiding cursor jump issues requires more complex logic, but this is basic sync)
        // However, if we are typing "12", local is "12", value becomes 12. No change needed.
        // If external update happens (e.g. quick select), we must update local.
        // We can check if parseInt(localValue) !== value to detect external change.
        const parsed = parseInt(localValue);
        if (isNaN(parsed) || parsed !== value) {
            setLocalValue(value.toString());
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setLocalValue(val);
        if (val === '') return;
        const num = parseInt(val);
        if (!isNaN(num)) {
            onChange(num);
        }
    };

    const handleBlur = () => {
        if (localValue === '' || isNaN(parseInt(localValue))) {
            setLocalValue(value.toString());
            onChange(value); // Re-trigger update to be safe
        }
    };

    return (
        <input
            type="number"
            min="1"
            max="10000"
            value={localValue}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 placeholder-gray-400 text-lg font-semibold"
            placeholder="数量を入力"
        />
    );
}
