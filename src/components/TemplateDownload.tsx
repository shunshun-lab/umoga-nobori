import { useEffect, useState } from 'react';
import { uiConfigService } from '@/utils/uiConfigService';
import type { TemplateItem } from '@/utils/uiConfigTypes';

// フォールバック用プレースホルダー（4つ）
const FALLBACK_TEMPLATES: TemplateItem[] = [
    { id: 'fb-1', name: 'のぼり 左', fileUrl: '#', sortOrder: 1, active: true },
    { id: 'fb-2', name: 'のぼり 右', fileUrl: '#', sortOrder: 2, active: true },
    { id: 'fb-3', name: 'のぼり 左右', fileUrl: '#', sortOrder: 3, active: true },
    { id: 'fb-4', name: 'のぼり カスタム', fileUrl: '#', sortOrder: 4, active: true },
];

export function TemplateDownload() {
    const [templates, setTemplates] = useState<TemplateItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                const config = await uiConfigService.loadUiConfig();
                if (!mounted) return;
                const activeTemplates = (config.templates || [])
                    .filter((t) => t.active)
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .slice(0, 4);
                setTemplates(activeTemplates);
            } catch (e: any) {
                if (!mounted) return;
                console.warn('TemplateDownload: API error, using fallback', e.message);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    // エラー時はフォールバックを静かに使う
    const displayTemplates = templates.length > 0 ? templates : (loading ? [] : FALLBACK_TEMPLATES);

    return (
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 mt-4">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                デザインテンプレート（PDFダウンロード）
            </h4>

            {loading && (
                <p className="text-xs text-gray-500">テンプレートを読み込み中です...</p>
            )}

            {displayTemplates.length > 0 && (
                <div className="grid grid-cols-4 gap-3 mt-2">
                    {displayTemplates.map((tmpl) => (
                        <a
                            key={tmpl.id}
                            href={tmpl.fileUrl}
                            className="group flex flex-col items-center p-2 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <div className="w-full aspect-square bg-gray-100 rounded-md flex items-center justify-center mb-2 overflow-hidden">
                                <svg className="w-10 h-10 text-gray-300 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <span className="text-xs text-center text-gray-700 group-hover:text-blue-700 font-medium leading-tight truncate w-full">
                                {tmpl.name || tmpl.id}
                            </span>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}
