'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import { 
  DocumentTextIcon,
  ArrowUpTrayIcon, 
  XMarkIcon, 
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ScissorsIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentDuplicateIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

// حداکثر حجم فایل (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// حالت‌های تقسیم
type SplitMode = 'range' | 'every' | 'custom';

interface SplitResult {
  blob: Blob;
  name: string;
  pageRange: string;
}

export default function PDFSplitter() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // حالت تقسیم
  const [splitMode, setSplitMode] = useState<SplitMode>('range');
  const [startPage, setStartPage] = useState<number>(1);
  const [endPage, setEndPage] = useState<number>(1);
  const [pagesPerFile, setPagesPerFile] = useState<number>(2);
  const [customPages, setCustomPages] = useState<string>('');
  
  // نتایج
  const [splitResults, setSplitResults] = useState<SplitResult[]>([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState<number>(-1);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null);
    const selectedFile = acceptedFiles[0];
    
    // بررسی فرمت PDF
    if (selectedFile.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      return;
    }
    
    // بررسی حجم فایل
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('File size should be less than 50MB');
      return;
    }

    setFile(selectedFile);
    setFileName(selectedFile.name);
    setFileSize(selectedFile.size);
    setLoading(true);
    setSplitResults([]);
    setSelectedResultIndex(-1);
    setZipBlob(null);

    try {
      // خواندن فایل و دریافت تعداد صفحات
      const fileBytes = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileBytes);
      const pageCount = pdfDoc.getPageCount();
      
      setTotalPages(pageCount);
      setEndPage(pageCount);
      setStartPage(1);
      
      console.log(`📄 PDF loaded: ${pageCount} pages`);
    } catch (err) {
      console.error('Error loading PDF:', err);
      setError('Invalid or corrupted PDF file');
    } finally {
      setLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE
  });

  const resetUpload = () => {
    setFile(null);
    setFileName('');
    setFileSize(0);
    setTotalPages(0);
    setError(null);
    setSuccess(false);
    setSplitResults([]);
    setSelectedResultIndex(-1);
    setZipBlob(null);
  };

  const validateCustomPages = (input: string): number[] => {
    const pages: number[] = [];
    const parts = input.split(',').map(part => part.trim());
    
    for (const part of parts) {
      if (part.includes('-')) {
        // بازه مثلاً 1-5
        const [start, end] = part.split('-').map(num => parseInt(num));
        if (isNaN(start) || isNaN(end) || start < 1 || end > totalPages || start > end) {
          throw new Error(`Invalid range: ${part}`);
        }
        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
      } else {
        // صفحه تکی
        const page = parseInt(part);
        if (isNaN(page) || page < 1 || page > totalPages) {
          throw new Error(`Invalid page number: ${part}`);
        }
        pages.push(page);
      }
    }
    
    return pages;
  };

  const splitPDF = async () => {
    if (!file || totalPages === 0) {
      setError('Please upload a PDF file first');
      return;
    }

    setProcessing(true);
    setError(null);
    setSplitResults([]);
    setSelectedResultIndex(-1);
    setZipBlob(null);

    try {
      const fileBytes = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(fileBytes);
      const results: SplitResult[] = [];

      if (splitMode === 'range') {
        // تقسیم یک بازه خاص
        if (startPage < 1 || endPage > totalPages || startPage > endPage) {
          throw new Error('Invalid page range');
        }

        const newPdf = await PDFDocument.create();
        const pages = await newPdf.copyPages(
          sourcePdf,
          Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage - 1 + i)
        );
        pages.forEach(page => newPdf.addPage(page));
        
        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        
        results.push({
          blob,
          name: `pages-${startPage}-${endPage}.pdf`,
          pageRange: `${startPage}-${endPage}`
        });
      } 
      else if (splitMode === 'every') {
        // تقسیم به فایل‌های چند صفحه‌ای
        for (let i = 1; i <= totalPages; i += pagesPerFile) {
          const end = Math.min(i + pagesPerFile - 1, totalPages);
          const newPdf = await PDFDocument.create();
          const pages = await newPdf.copyPages(
            sourcePdf,
            Array.from({ length: end - i + 1 }, (_, idx) => i - 1 + idx)
          );
          pages.forEach(page => newPdf.addPage(page));
          
          const pdfBytes = await newPdf.save();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          
          results.push({
            blob,
            name: `pages-${i}-${end}.pdf`,
            pageRange: `${i}-${end}`
          });
        }
      } 
      else if (splitMode === 'custom') {
        // تقسیم بر اساس صفحات مشخص شده
        try {
          const pages = validateCustomPages(customPages);
          
          // گروه‌بندی صفحات متوالی
          const groups: number[][] = [];
          let currentGroup: number[] = [];
          
          for (let i = 0; i < pages.length; i++) {
            if (i === 0 || pages[i] === pages[i-1] + 1) {
              currentGroup.push(pages[i]);
            } else {
              groups.push([...currentGroup]);
              currentGroup = [pages[i]];
            }
          }
          if (currentGroup.length > 0) {
            groups.push(currentGroup);
          }
          
          // ایجاد فایل برای هر گروه
          for (const group of groups) {
            const newPdf = await PDFDocument.create();
            const copiedPages = await newPdf.copyPages(
              sourcePdf,
              group.map(p => p - 1)
            );
            copiedPages.forEach(page => newPdf.addPage(page));
            
            const pdfBytes = await newPdf.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            
            const range = group.length === 1 
              ? `${group[0]}` 
              : `${group[0]}-${group[group.length-1]}`;
            
            results.push({
              blob,
              name: `pages-${range}.pdf`,
              pageRange: range
            });
          }
        } catch (err) {
          throw new Error(err instanceof Error ? err.message : 'Invalid custom pages input');
        }
      }

      setSplitResults(results);
      setSuccess(true);
      console.log(`✅ PDF split into ${results.length} files`);

    } catch (err) {
      console.error('❌ Split error:', err);
      setError(err instanceof Error ? err.message : 'Error splitting PDF');
    } finally {
      setProcessing(false);
    }
  };

  const downloadSingleFile = (result: SplitResult) => {
    const url = window.URL.createObjectURL(result.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const downloadAllFiles = async () => {
    if (splitResults.length === 0) return;
    
    if (splitResults.length === 1) {
      downloadSingleFile(splitResults[0]);
      return;
    }

    // برای چند فایل، همه رو جداگانه دانلود می‌کنیم
    // (در نسخه پیشرفته‌تر می‌تونید از JSZip استفاده کنید)
    for (const result of splitResults) {
      downloadSingleFile(result);
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl mb-4">
          <ScissorsIcon className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Split PDF
        </h1>
        <p className="text-gray-600">
          Split a PDF file into multiple documents
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        
        {/* Upload Area */}
        {!file ? (
          <div
            {...getRootProps()}
            className={`m-6 border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors
              ${isDragActive 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }`}
          >
            <input {...getInputProps()} />
            <DocumentTextIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-lg text-gray-700 mb-2">
              {isDragActive
                ? 'Drop your PDF file here'
                : 'Drag & drop your PDF file here'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              or click to browse
            </p>
            <p className="text-xs text-gray-400">
              Max file size: 50MB
            </p>
          </div>
        ) : (
          <div className="p-6">
            {/* Error Message */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2">
                <XCircleIcon className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && splitResults.length > 0 && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
                PDF split into {splitResults.length} files successfully!
              </div>
            )}

            {/* File Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <DocumentTextIcon className="w-8 h-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{fileName}</h3>
                    <p className="text-sm text-gray-500">
                      {formatBytes(fileSize)} • {loading ? 'Loading...' : `${totalPages} pages`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={resetUpload}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                  title="Remove file"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {!loading && totalPages > 0 && (
              <>
                {/* Split Options */}
                <div className="mb-6 space-y-4">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="range"
                        checked={splitMode === 'range'}
                        onChange={(e) => setSplitMode(e.target.value as SplitMode)}
                        className="text-blue-600"
                      />
                      <span className="text-sm text-gray-700">Extract pages</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="every"
                        checked={splitMode === 'every'}
                        onChange={(e) => setSplitMode(e.target.value as SplitMode)}
                        className="text-blue-600"
                      />
                      <span className="text-sm text-gray-700">Split every N pages</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="custom"
                        checked={splitMode === 'custom'}
                        onChange={(e) => setSplitMode(e.target.value as SplitMode)}
                        className="text-blue-600"
                      />
                      <span className="text-sm text-gray-700">Custom pages</span>
                    </label>
                  </div>

                  {splitMode === 'range' && (
                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
                      <span className="text-sm text-gray-700">Pages:</span>
                      <div className="flex items-center gap-2 text-gray-500">
                        <input
                          type="number"
                          min="1"
                          max={totalPages}
                          value={startPage}
                          onChange={(e) => setStartPage(Math.min(parseInt(e.target.value) || 1, totalPages))}
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="number"
                          min={startPage}
                          max={totalPages}
                          value={endPage}
                          onChange={(e) => setEndPage(Math.min(parseInt(e.target.value) || startPage, totalPages))}
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center"
                        />
                      </div>
                      <span className="text-sm text-gray-500">
                        (Total: {totalPages} pages)
                      </span>
                    </div>
                  )}

                  {splitMode === 'every' && (
                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
                      <span className="text-sm text-gray-700">Pages per file:</span>
                      <input
                        type="number"
                        min="1"
                        max={totalPages}
                        value={pagesPerFile}
                        onChange={(e) => setPagesPerFile(Math.min(parseInt(e.target.value) || 1, totalPages))}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center"
                      />
                      <span className="text-sm text-gray-500">
                        (Will create {Math.ceil(totalPages / pagesPerFile)} files)
                      </span>
                    </div>
                  )}

                  {splitMode === 'custom' && (
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="block text-sm text-gray-700 mb-2">
                        Enter page numbers/ranges (e.g., 1,3,5-8,10):
                      </label>
                      <input
                        type="text"
                        value={customPages}
                        onChange={(e) => setCustomPages(e.target.value)}
                        placeholder="1,3,5-8,10"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Use commas for separate pages, hyphens for ranges
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={splitPDF}
                    disabled={processing}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-center gap-2">
                      {processing ? (
                        <>
                          <ArrowPathIcon className="w-5 h-5 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <ScissorsIcon className="w-5 h-5" />
                          <span>Split PDF</span>
                        </>
                      )}
                    </div>
                  </button>

                  {splitResults.length > 0 && (
                    <button
                      onClick={downloadAllFiles}
                      className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        <span>Download All ({splitResults.length} files)</span>
                      </div>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {splitResults.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold text-gray-900 mb-3">Split Results:</h3>
          <div className="grid gap-2 max-h-60 overflow-y-auto pr-2">
            {splitResults.map((result, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <DocumentDuplicateIcon className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-700">{result.name}</span>
                  <span className="text-xs text-gray-500">
                    (Pages {result.pageRange})
                  </span>
                </div>
                <button
                  onClick={() => downloadSingleFile(result)}
                  className="text-blue-600 hover:text-blue-700"
                  title="Download"
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Features Info */}
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <div className="text-center">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <ScissorsIcon className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-sm text-gray-600">Multiple split modes</p>
        </div>
        <div className="text-center">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <DocumentDuplicateIcon className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-sm text-gray-600">Extract specific pages</p>
        </div>
        <div className="text-center">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <CheckCircleIcon className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-sm text-gray-600">Free & secure</p>
        </div>
      </div>

      {/* Note */}
      <p className="text-xs text-gray-400 text-center mt-8">
        Your files are processed locally in your browser and never uploaded to any server. Max file size: 50MB.
      </p>
    </div>
  );
}