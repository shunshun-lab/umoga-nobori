import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import type { DesignItem } from '@/types/nobori.types';

interface Props {
    designs: DesignItem[];
    onDesignsChange: (designs: DesignItem[]) => void;
}

export function DesignQuantitySelector({ designs, onDesignsChange }: Props) {
    const MAX_FILE_SIZE_MB = 200;
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
    const MAX_FILES = 5;

    const onDrop = useCallback((acceptedFiles: File[]) => {
        // Check total file count
        if (designs.length + acceptedFiles.length > MAX_FILES) {
            alert(`アップロードできるのは${MAX_FILES}ファイルまでです。\n6個以上のファイルはアップロードできません。\nギガファイル便などの外部ストレージをご利用ください。`);
            return;
        }

        // Check file sizes
        const oversizedFiles = acceptedFiles.filter(f => f.size > MAX_FILE_SIZE_BYTES);
        if (oversizedFiles.length > 0) {
            alert(`1ファイルあたり${MAX_FILE_SIZE_MB}MBまでです。\nギガファイル便などの外部ストレージにアップロードし、そのURLを入力してください。\n\n対象ファイル:\n${oversizedFiles.map(f => f.name).join('\n')}`);
            return;
        }

        const newDesigns: DesignItem[] = acceptedFiles.map((file) => ({
            id: Math.random().toString(36).substr(2, 9),
            file,
            previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
            quantity: 1,
        }));
        onDesignsChange([...designs, ...newDesigns]);
    }, [designs, onDesignsChange]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/postscript': ['.ai', '.eps'],
            'image/*': ['.png', '.jpg', '.jpeg'],
            'application/zip': ['.zip']
        },
        maxSize: MAX_FILE_SIZE_BYTES
    });

    const updateQuantity = (id: string, newQuantity: number) => {
        if (newQuantity < 1) return;
        onDesignsChange(designs.map(d =>
            d.id === id ? { ...d, quantity: newQuantity } : d
        ));
    };

    const removeDesign = (id: string) => {
        onDesignsChange(designs.filter(d => d.id !== id));
    };

    const totalQuantity = designs.reduce((sum, d) => sum + d.quantity, 0);

    return (
        <div>
            <div
                {...getRootProps()}
                className={`
                    border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 mb-6
                    ${isDragActive
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-400 bg-gray-50'
                    }
                `}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center space-y-2">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="font-bold text-gray-700">ファイルをドラッグ&ドロップまたはクリックして選択</p>
                    <p className="text-xs text-gray-500">対応形式: AI, EPS, PDF, PNG, JPG, ZIP（{MAX_FILES}ファイルまで・各{MAX_FILE_SIZE_MB}MBまで）</p>
                    <p className="text-xs text-gray-400">※ アップロードは任意です。後からメール等でもお送りいただけます。</p>
                </div>
            </div>

            {designs.length > 0 && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b">
                        <div className="font-bold text-gray-700">アップロード済み（{designs.length}/{MAX_FILES}）</div>
                        <div className="font-bold text-blue-600">合計: {totalQuantity}枚</div>
                    </div>

                    {designs.map((design) => (
                        <div key={design.id} className="flex items-center bg-gray-50 rounded-xl p-4 border border-gray-200">
                            {/* Preview */}
                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center mr-4 border border-gray-300">
                                {design.previewUrl ? (
                                    <img src={design.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xs text-gray-500 font-bold uppercase">
                                        {typeof design.file === 'string' ? design.file.split('.').pop() : design.file.name.split('.').pop()}
                                    </span>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0 mr-4">
                                <p className="font-bold text-gray-900 truncate text-sm">
                                    {typeof design.file === 'string' ? design.file : design.file.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {(design.file instanceof File) ? (design.file.size / 1024 / 1024).toFixed(2) + ' MB' : ''}
                                </p>
                            </div>

                            {/* Quantity Input */}
                            <div className="flex items-center space-x-2 mr-4">
                                <span className="text-sm font-bold text-gray-600">枚数:</span>
                                <input
                                    type="number"
                                    min="1"
                                    value={design.quantity}
                                    onChange={(e) => updateQuantity(design.id, parseInt(e.target.value) || 1)}
                                    className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-center font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* Remove Button */}
                            <button
                                onClick={() => removeDesign(design.id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                title="削除"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
