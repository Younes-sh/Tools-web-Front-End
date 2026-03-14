'use client';

import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { 
  ArrowUpTrayIcon, 
  XMarkIcon, 
  ArrowDownTrayIcon,
  ArrowPathIcon,
  PhotoIcon,
  SparklesIcon,
  SwatchIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { backgroundApi } from '../../lib/api';

// حداکثر سایز فایل (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// گزینه‌های پس‌زمینه
const BACKGROUND_OPTIONS = [
  { value: 'transparent', label: 'Transparent', color: null },
  { value: 'white', label: 'White', color: '#FFFFFF' },
  { value: 'black', label: 'Black', color: '#000000' },
  { value: 'gray', label: 'Gray', color: '#808080' },
  { value: 'blue', label: 'Blue', color: '#3B82F6' },
  { value: 'green', label: 'Green', color: '#10B981' },
  { value: 'red', label: 'Red', color: '#EF4444' },
  { value: 'purple', label: 'Purple', color: '#8B5CF6' },
  { value: 'yellow', label: 'Yellow', color: '#F59E0B' },
];

export default function BackgroundRemover() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [processedFile, setProcessedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backgroundColor, setBackgroundColor] = useState('transparent');
  const [customColor, setCustomColor] = useState('#3B82F6');
  const [outputFormat, setOutputFormat] = useState('png');
  const [showCustomColor, setShowCustomColor] = useState(false);
  const [processingMethod, setProcessingMethod] = useState<'api' | 'client'>('api');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    const selectedFile = acceptedFiles[0];
    
    // اعتبارسنجی
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }
    
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('Image size should be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setProcessedImage(null);
    setProcessedFile(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.bmp']
    },
    maxFiles: 1
  });

  const removeBackground = async () => {
    if (!file || !canvasRef.current) return;

    setLoading(true);
    setError(null);

    try {
      // روش 1: استفاده از API remove.bg (نیاز به API Key)
      if (processingMethod === 'api') {
        await removeBackgroundWithAPI();
      } 
      // روش 2: شبیه‌سازی (برای تست)
      else {
        await simulateBackgroundRemoval();
      }
    } catch (err) {
      console.error('Background removal error:', err);
      setError('Error removing background. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // در BackgroundRemover.tsx


  const removeBackgroundWithAPI = async () => {
    if (!file) {
      setError('No file selected');
      return;
    }

     // ذخیره در یک متغیر جدید که TypeScript می‌فهمد null نیست
     const selectedFile = file;

     setLoading(true);
     setError(null);

    try {
      const result = await backgroundApi.removeBackground(
        selectedFile,  // ✅ این دیگه خطا نمی‌دهد
        backgroundColor,
        outputFormat
      );
      const url = URL.createObjectURL(result);
      setProcessedImage(url);
      setProcessedFile(new File([result], `no-bg-${selectedFile.name}`, { type: result.type }));
    } catch (error: any) {
      console.error('Background removal error:', error);
      setError(error.message || 'Error removing background');
    } finally {
      setLoading(false);
    }
  };

  const simulateBackgroundRemoval = async () => {
    // شبیه‌سازی حذف پس‌زمینه برای تست
    // در نسخه واقعی، اینجا با API واقعی کار می‌کنیم
    return new Promise((resolve) => {
      setTimeout(async () => {
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          
          const img = new window.Image();
          img.src = preview!;
          
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            
            // رسم تصویر با افکت شبیه‌سازی شده
            ctx?.drawImage(img, 0, 0);
            
            // اضافه کردن نویز برای شبیه‌سازی (فقط برای تست)
            const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
            if (imageData) {
              // تغییر رنگ پس‌زمینه (شبیه‌سازی)
              for (let i = 0; i < imageData.data.length; i += 4) {
                // اینجا فقط برای تست است
                if (imageData.data[i] > 200 && imageData.data[i+1] > 200 && imageData.data[i+2] > 200) {
                  imageData.data[i+3] = 0; // شفاف
                }
              }
              ctx?.putImageData(imageData, 0, 0);
            }
            
            // اعمال رنگ پس‌زمینه
            if (backgroundColor !== 'transparent') {
              const bgColor = showCustomColor ? customColor : 
                BACKGROUND_OPTIONS.find(opt => opt.value === backgroundColor)?.color || '#FFFFFF';
              
              // اینجا منطق واقعی اعمال رنگ پس‌زمینه
            }
            
            canvas.toBlob((blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                const processedFile = new File([blob], `no-bg-${file.name}`, { type: blob.type });
                setProcessedImage(url);
                setProcessedFile(processedFile);
              }
              resolve(null);
            }, `image/${outputFormat}`, 0.95);
          };
        }
      }, 3000);
    });
  };

  const handleDownload = () => {
    if (!processedFile || !processedImage) return;
    
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = processedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetUpload = () => {
    setFile(null);
    setPreview(null);
    setProcessedImage(null);
    setProcessedFile(null);
    setError(null);
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-6xl mx-auto p-6 text-gray-600">
      {/* کانواس مخفی برای پردازش */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Background Remover
        </h1>
        <p className="text-gray-600">
          Remove image backgrounds instantly with AI
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        
        {/* Options */}
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex flex-wrap items-center gap-6">
            {/* Processing Method */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">
                Processing:
              </label>
              <select
                value={processingMethod}
                onChange={(e) => setProcessingMethod(e.target.value as 'api' | 'client')}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="api">API (Remove.bg)</option>
                <option value="client">Simulation (Demo)</option>
              </select>
            </div>

            {/* Background Color */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">
                Background:
              </label>
              <select
                value={backgroundColor}
                onChange={(e) => {
                  setBackgroundColor(e.target.value);
                  setShowCustomColor(e.target.value === 'custom');
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                {BACKGROUND_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
                <option value="custom">Custom Color...</option>
              </select>
            </div>

            {/* Custom Color Picker */}
            {showCustomColor && (
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer"
                />
                <span className="text-sm text-gray-600">{customColor}</span>
              </div>
            )}

            {/* Output Format */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">
                Format:
              </label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="png">PNG (Transparent)</option>
                <option value="jpg">JPG</option>
                <option value="webp">WebP</option>
              </select>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        {!preview ? (
          <div
            {...getRootProps()}
            className={`m-6 border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors
              ${isDragActive 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }`}
          >
            <input {...getInputProps()} />
            <PhotoIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-lg text-gray-700 mb-2">
              {isDragActive
                ? 'Drop your image here'
                : 'Drag & drop your image here'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              or click to browse
            </p>
            <p className="text-xs text-gray-400">
              Supports: JPG, PNG, WebP, BMP (Max 10MB)
            </p>
          </div>
        ) : (
          /* Preview Area */
          <div className="p-6">
            {/* Error Message */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Processing Method Info */}
            {processingMethod === 'api' && (
              <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
                <p className="flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5" />
                  AI
                </p>
              </div>
            )}

            {/* Image Comparison */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Original */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Original</h3>
                  <span className="text-xs text-gray-500">
                    {file && formatBytes(file.size)}
                  </span>
                </div>
                <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                  <Image
                    src={preview}
                    alt="Original"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Processed */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Background Removed</h3>
                  {processedFile && (
                    <span className="text-xs text-green-600">
                      {formatBytes(processedFile.size)}
                    </span>
                  )}
                </div>
                <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden border-2 border-blue-200">
                  {loading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                      <ArrowPathIcon className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                      <p className="text-gray-700 font-medium">Processing...</p>
                      <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
                    </div>
                  ) : processedImage ? (
                    <Image
                      src={processedImage}
                      alt="Background removed"
                      fill
                      className="object-contain"
                      style={{ backgroundColor: backgroundColor === 'transparent' ? '#f0f0f0' : undefined }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50">
                      <SparklesIcon className="w-12 h-12 text-gray-300 mb-2" />
                      <p className="text-gray-400">Click remove background to start</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Processed Image Info */}
            {processedFile && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg text-sm text-green-700">
                <p className="flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5" />
                  ✓ Background removed successfully
                </p>
              </div>
            )}

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={resetUpload}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                <XMarkIcon className="w-5 h-5 inline mr-1" />
                Remove
              </button>

              <div className="flex items-center gap-3">
                {!processedImage && (
                  <button
                    onClick={removeBackground}
                    disabled={loading}
                    className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <ArrowPathIcon className="w-5 h-5 animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5" />
                        Remove Background
                      </span>
                    )}
                  </button>
                )}
                
                {processedImage && (
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
                  >
                    <ArrowDownTrayIcon className="w-5 h-5" />
                    Download
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Features Info */}
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <div className="text-center">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <SparklesIcon className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-sm text-gray-600">AI-powered removal</p>
        </div>
        <div className="text-center">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <SwatchIcon className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-sm text-gray-600">Custom backgrounds</p>
        </div>
        <div className="text-center">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <DocumentArrowDownIcon className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-sm text-gray-600">Multiple formats</p>
        </div>
      </div>

      
    </div>
  );
}