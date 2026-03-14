'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { 
  XMarkIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowsUpDownIcon
} from '@heroicons/react/24/outline';

// حداکثر تعداد فایل‌ها
const MAX_FILES = 10;
// حداکثر حجم هر فایل (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

interface PDFFile {
  id: string;
  file: File;
  name: string;
  size: number;
  pages?: number;
}

export default function PDFMerger() {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [mergedFile, setMergedFile] = useState<Blob | null>(null);
  const [mergedFileName, setMergedFileName] = useState<string>('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    
    // بررسی تعداد فایل‌ها
    if (files.length + acceptedFiles.length > MAX_FILES) {
      setError(`You can only upload up to ${MAX_FILES} files at a time`);
      return;
    }

    const newFiles = acceptedFiles
      .filter(file => {
        // بررسی فرمت PDF
        if (file.type !== 'application/pdf') {
          setError('Only PDF files are allowed');
          return false;
        }
        
        // بررسی حجم فایل
        if (file.size > MAX_FILE_SIZE) {
          setError(`File ${file.name} is larger than 50MB`);
          return false;
        }
        
        return true;
      })
      .map(file => ({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        name: file.name,
        size: file.size,
      }));

    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles]);
      setMergedFile(null);
      setSuccess(false);
      setTotalPages(0);
    }
  }, [files.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: MAX_FILES,
    maxSize: MAX_FILE_SIZE
  });

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    setMergedFile(null);
    setSuccess(false);
    setTotalPages(0);
  };

  const moveFile = (fromIndex: number, toIndex: number) => {
    const newFiles = [...files];
    const [movedFile] = newFiles.splice(fromIndex, 1);
    newFiles.splice(toIndex, 0, movedFile);
    setFiles(newFiles);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    moveFile(draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const mergePDFs = async () => {
  if (files.length < 2) {
    setError('Please select at least 2 PDF files');
    return;
  }

  setLoading(true);
  setError(null);

  try {
    console.log('📚 Merging PDFs...', files.length);
    
    const mergedPdf = await PDFDocument.create();
    let pageCount = 0;

    for (let i = 0; i < files.length; i++) {
      const pdfFile = files[i];
      console.log(`Processing file ${i + 1}/${files.length}: ${pdfFile.name}`);
      
      try {
        const fileBytes = await pdfFile.file.arrayBuffer();
        const pdf = await PDFDocument.load(fileBytes);
        const filePageCount = pdf.getPageCount();
        
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => {
          mergedPdf.addPage(page);
        });
        
        pageCount += filePageCount;
        console.log(`✅ Added ${filePageCount} pages from ${pdfFile.name}`);
      } catch (fileError) {
        console.error(`Error processing ${pdfFile.name}:`, fileError);
        throw new Error(`Invalid PDF file: ${pdfFile.name}`);
      }
    }

    console.log(`📄 Total pages in merged PDF: ${pageCount}`);
    setTotalPages(pageCount);
    
    const pdfBytes = await mergedPdf.save();
    
    // ✅ استفاده از Buffer به جای Blob (برای سازگاری با Node.js)
    const buffer = Buffer.from(pdfBytes);
    const blob = new Blob([buffer], { type: 'application/pdf' });
    
    setMergedFile(blob);
    setMergedFileName(`merged-${Date.now()}.pdf`);
    setSuccess(true);

  } catch (err) {
    console.error('❌ Merge error:', err);
    setError(err instanceof Error ? err.message : 'Error merging PDFs');
  } finally {
    setLoading(false);
  }
};
  const handleDownload = () => {
    if (!mergedFile) return;

    const url = window.URL.createObjectURL(mergedFile);
    const link = document.createElement('a');
    link.href = url;
    link.download = mergedFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const resetAll = () => {
    setFiles([]);
    setMergedFile(null);
    setSuccess(false);
    setError(null);
    setTotalPages(0);
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
          <DocumentDuplicateIcon className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          PDF Merger
        </h1>
        <p className="text-gray-600">
          Combine multiple PDF files into one document. Drag to reorder.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        
        {/* Upload Area */}
        {files.length === 0 ? (
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
                ? 'Drop your PDF files here'
                : 'Drag & drop PDF files here'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              or click to browse
            </p>
            <p className="text-xs text-gray-400">
              Supports up to {MAX_FILES} PDF files • Max 50MB each
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
            {success && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
                PDF files merged successfully! {totalPages > 0 && `(${totalPages} total pages)`}
              </div>
            )}

            {/* File List */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">
                  Selected Files ({files.length})
                </h3>
                <button
                  onClick={resetAll}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear all
                </button>
              </div>
              
              <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                {files.map((file, index) => (
                  <div
                    key={file.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center justify-between bg-gray-50 p-3 rounded-lg border-2 transition-colors cursor-move
                      ${draggedIndex === index ? 'border-blue-400 bg-blue-50' : 'border-transparent hover:border-gray-300'}`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <ArrowsUpDownIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <DocumentTextIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700 truncate">{file.name}</span>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        ({formatBytes(file.size)})
                      </span>
                    </div>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                      title="Remove"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add More Button */}
            <div className="mb-4">
              <div {...getRootProps()} className="cursor-pointer">
                <input {...getInputProps()} />
                <div className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                  <ArrowUpTrayIcon className="w-4 h-4" />
                  Add more PDF files
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {!mergedFile ? (
                <button
                  onClick={mergePDFs}
                  disabled={loading || files.length < 2}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <ArrowPathIcon className="w-5 h-5 animate-spin" />
                        <span>Merging...</span>
                      </>
                    ) : (
                      <>
                        <DocumentDuplicateIcon className="w-5 h-5" />
                        <span>Merge PDFs</span>
                      </>
                    )}
                  </div>
                </button>
              ) : (
                <button
                  onClick={handleDownload}
                  className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
                >
                  <div className="flex items-center justify-center gap-2">
                    <ArrowDownTrayIcon className="w-5 h-5" />
                    <span>Download Merged PDF</span>
                  </div>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Features Info */}
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <div className="text-center">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <DocumentDuplicateIcon className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-sm text-gray-600">Merge up to {MAX_FILES} PDF files</p>
        </div>
        <div className="text-center">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <ArrowsUpDownIcon className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-sm text-gray-600">Drag to reorder pages</p>
        </div>
        <div className="text-center">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <CheckCircleIcon className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-sm text-gray-600">Free & secure processing</p>
        </div>
      </div>

      {/* Note */}
      <p className="text-xs text-gray-400 text-center mt-8">
        Your files are processed locally in your browser and never uploaded to any server. Max file size: 50MB.
      </p>
    </div>
  );
}