import { useEffect, useState } from 'react';
import { uiConfigService } from '@/utils/uiConfigService';
import type { TemplateItem } from '@/utils/uiConfigTypes';

export function TemplateDownload() {
    const [templates, setTemplates] = useState<TemplateItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
                    .slice(0, 10);
                setTemplates(activeTemplates);
            } catch (e: any) {
                if (!mounted) return;
                setError(e.message || 'テンプレートの読み込みに失敗しました');
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    return (
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 mt-4">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                デザインテンプレート（ダウンロード）
            </h4>

            {loading && (
                <p className="text-xs text-gray-500">テンプレートを読み込み中です...</p>
            )}

            {error && (
                <p className="text-xs text-red-600">{error}</p>
            )}

            {!loading && !error && templates.length === 0 && (
                <p className="text-xs text-gray-400">登録されているテンプレートはまだありません。</p>
            )}

            {templates.length > 0 && (
                <div className="grid md:grid-cols-2 gap-2 mt-2">
                    {templates.map((tmpl) => (
                        <a
                            key={tmpl.id}
                            href={tmpl.fileUrl}
                            className="flex items-center p-3 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-sm text-blue-700 font-medium"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span className="mr-2">📄</span>
                            <span className="truncate">{tmpl.name || tmpl.id}</span>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}

