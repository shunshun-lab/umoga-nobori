
const TEMPLATES = [
    { name: 'レギュラーのぼり (60x180cm).ai', url: '#' },
    { name: 'スリムのぼり (45x180cm).ai', url: '#' },
    { name: 'ショートのぼり (60x150cm).ai', url: '#' },
];

export function TemplateDownload() {
    return (
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 mt-4">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                デザインテンプレート（ダウンロード）
            </h4>
            <div className="grid md:grid-cols-2 gap-2">
                {TEMPLATES.map((tmpl, idx) => (
                    <a
                        key={idx}
                        href={tmpl.url}
                        className="flex items-center p-3 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-sm text-blue-700 font-medium"
                        onClick={(e) => e.preventDefault()} // Placeholder behavior
                    >
                        <span className="mr-2">📄</span>
                        {tmpl.name}
                    </a>
                ))}
            </div>
        </div>
    );
}
