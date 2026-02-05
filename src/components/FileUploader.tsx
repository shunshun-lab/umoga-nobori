import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface Props {
  files: string[];
  onFilesChange: (files: string[]) => void;
}

export function FileUploader({ files, onFilesChange }: Props) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // ここでは簡易的にファイル名だけ保存
    // 実際のアップロードはCloudflare R2などに実装
    const fileNames = acceptedFiles.map(f => f.name);
    onFilesChange([...files, ...fileNames]);
  }, [files, onFilesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/postscript': ['.ai', '.eps'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/zip': ['.zip', '.lzh', '.rar'],
    }
  });

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-indigo-100 rounded-xl">
          <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold">デザインデータ</h2>
      </div>

      {/* ドロップゾーン */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200
          ${isDragActive
            ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-lg ring-4 ring-blue-100'
            : 'border-gray-300 hover:border-blue-400 hover:shadow-md bg-white'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-4">
          {isDragActive ? (
            <>
              <svg className="w-16 h-16 text-blue-600 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              <p className="text-lg font-bold text-blue-700">ここにドロップしてください</p>
            </>
          ) : (
            <>
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <div>
                <p className="text-lg font-bold text-gray-700 mb-1">ファイルをドラッグ&ドロップ</p>
                <p className="text-sm text-gray-500">または クリックしてファイルを選択</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {['PDF', 'AI', 'EPS', 'PNG', 'JPG', 'ZIP'].map((format) => (
                  <span key={format} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold">
                    {format}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* アップロード済みファイル一覧 */}
      {files.length > 0 && (
        <div className="mt-6 space-y-2">
          <div className="flex items-center space-x-2 mb-3">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div className="font-bold text-gray-900">アップロード済み ({files.length})</div>
          </div>
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm font-medium text-gray-900">{file}</span>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="flex items-center space-x-1 px-3 py-1.5 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>削除</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 後日入稿オプション */}
      <div className="mt-6 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-100">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <div className="font-bold text-blue-900 mb-1">後日入稿も可能です</div>
            <div className="text-sm text-blue-800">
              デザインデータは後日ご入稿いただくことも可能です。注文時に「後日入稿」を選択してください。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
