'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { 
  // ArrowUpTrayIcon, 
  XMarkIcon, 
  ArrowDownTrayIcon,
  ArrowPathIcon,
  PhotoIcon,
  ScaleIcon,
  DocumentArrowDownIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

// حداکثر سایز فایل (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// فرمت‌های پشتیبانی شده
const SUPPORTED_FORMATS = [
  { value: 'jpeg', label: 'JPEG', mime: 'image/jpeg', description: 'Best for photos' },
  { value: 'png', label: 'PNG', mime: 'image/png', description: 'Best for graphics' },
  { value: 'webp', label: 'WebP', mime: 'image/webp', description: 'Best compression' },
];

export default function ImageCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quality, setQuality] = useState(80);
  const [outputFormat, setOutputFormat] = useState('jpeg');
  const [maintainDimensions, setMaintainDimensions] = useState(true);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [maxHeight, setMaxHeight] = useState(1080);
  const [originalSize, setOriginalSize] = useState(0);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
  setError(null);
  const selectedFile = acceptedFiles[0];
  
  // اعتبارسنجی
  if (!selectedFile.type.startsWith('image/')) {
    setError('Please select a valid image file');
    return;
  }
  
  if (selectedFile.size > MAX_FILE_SIZE) {
    setError('Image size should be less than 50MB');
    return;
  }

  setFile(selectedFile);
  setOriginalSize(selectedFile.size);
  setPreview(URL.createObjectURL(selectedFile));
  setCompressedImage(null);
  setCompressedFile(null);

  // دریافت ابعاد اصلی تصویر
  const img = new window.Image();  // ✅ اصلاح شده
  img.onload = () => {
    setOriginalDimensions({ width: img.width, height: img.height });
    URL.revokeObjectURL(img.src);
  };
  img.src = URL.createObjectURL(selectedFile);
}, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif', '.bmp']
    },
    maxFiles: 1
  });

  const compressImage = async () => {
    if (!file || !canvasRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const img = new window.Image();
      img.src = preview!;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const canvas = canvasRef.current;
      let width = img.width;
      let height = img.height;

      // تغییر ابعاد اگر لازم باشد
      if (maintainDimensions) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);

      // تعیین MIME type
      let mimeType: string;
      let fileExtension: string;
      
      switch (outputFormat) {
        case 'jpeg':
          mimeType = 'image/jpeg';
          fileExtension = 'jpg';
          break;
        case 'png':
          mimeType = 'image/png';
          fileExtension = 'png';
          break;
        case 'webp':
          mimeType = 'image/webp';
          fileExtension = 'webp';
          break;
        default:
          mimeType = 'image/jpeg';
          fileExtension = 'jpg';
      }

      // بررسی پشتیبانی WebP
      if (outputFormat === 'webp') {
        const isWebPSupported = canvas.toDataURL('image/webp').indexOf('image/webp') === 5;
        if (!isWebPSupported) {
          setError('WebP is not supported in your browser. Using JPEG instead.');
          mimeType = 'image/jpeg';
          fileExtension = 'jpg';
        }
      }

      // فشرده‌سازی تصویر
      const compressedDataUrl = canvas.toDataURL(mimeType, quality / 100);
      
      // ایجاد فایل برای دانلود
      const byteString = atob(compressedDataUrl.split(',')[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      
      const compressedBlob = new Blob([ab], { type: mimeType });
      const newCompressedFile = new File(
        [compressedBlob], 
        `${file.name.split('.')[0]}-compressed.${fileExtension}`,
        { type: mimeType }
      );

      setCompressedImage(compressedDataUrl);
      setCompressedFile(newCompressedFile);

    } catch (err) {
      console.error('Compression error:', err);
      setError('Error compressing image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!compressedFile || !compressedImage) return;
    
    const link = document.createElement('a');
    link.href = compressedImage;
    link.download = compressedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetUpload = () => {
    setFile(null);
    setPreview(null);
    setCompressedImage(null);
    setCompressedFile(null);
    setError(null);
    setOriginalSize(0);
    setOriginalDimensions({ width: 0, height: 0 });
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const getCompressionRatio = () => {
    if (!originalSize || !compressedFile) return 0;
    return ((1 - compressedFile.size / originalSize) * 100).toFixed(1);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* کانواس مخفی برای پردازش */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Image Compressor
        </h1>
        <p className="text-gray-600">
          Reduce image file size while maintaining quality
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        
        {/* Compression Options */}
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 text-gray-700">
          <div className="flex flex-wrap items-center gap-6">
            {/* Quality Slider */}
            <div className="flex items-center gap-3 flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-gray-700">
                Quality:
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm text-gray-600 min-w-[45px]">
                {quality}%
              </span>
            </div>

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
                {SUPPORTED_FORMATS.map((format) => (
                  <option key={format.value} value={format.value}>
                    {format.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Advanced Toggle */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <InformationCircleIcon className="w-4 h-4" />
              {showAdvanced ? 'Hide' : 'Show'} advanced options
            </button>
          </div>

          {/* Advanced Options */}
          {showAdvanced && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={maintainDimensions}
                    onChange={(e) => setMaintainDimensions(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Resize image</span>
                </label>

                {maintainDimensions && (
                  <>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-700">Max Width:</label>
                      <input
                        type="number"
                        value={maxWidth}
                        onChange={(e) => setMaxWidth(parseInt(e.target.value))}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                        min="1"
                      />
                      <span className="text-sm text-gray-500">px</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-700">Max Height:</label>
                      <input
                        type="number"
                        value={maxHeight}
                        onChange={(e) => setMaxHeight(parseInt(e.target.value))}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                        min="1"
                      />
                      <span className="text-sm text-gray-500">px</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
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
              Supports: JPG, PNG, WebP, GIF, BMP (Max 50MB)
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

            {/* Image Comparison */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Original */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Original</h3>
                  <span className="text-xs text-gray-500">
                    {formatBytes(originalSize)} • {originalDimensions.width}×{originalDimensions.height}
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

              {/* Compressed */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Compressed</h3>
                  {compressedFile && (
                    <span className="text-xs text-green-600">
                      {formatBytes(compressedFile.size)} • {getCompressionRatio()}% smaller
                    </span>
                  )}
                </div>
                <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden border-2 border-blue-200">
                  {loading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                      <ArrowPathIcon className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                      <p className="text-gray-700 font-medium">Compressing...</p>
                    </div>
                  ) : compressedImage ? (
                    <Image
                      src={compressedImage}
                      alt="Compressed"
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50">
                      <ScaleIcon className="w-12 h-12 text-gray-300 mb-2" />
                      <p className="text-gray-400">Click compress to start</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Compression Info */}
            {compressedFile && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg text-sm text-green-700">
                <p className="flex items-center gap-2">
                  <span>✓ Compressed from <strong>{formatBytes(originalSize)}</strong> to <strong>{formatBytes(compressedFile.size)}</strong></span>
                  <span className="px-2 py-1 bg-green-200 rounded-full text-xs">
                    {getCompressionRatio()}% reduction
                  </span>
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
                {!compressedImage && (
                  <button
                    onClick={compressImage}
                    disabled={loading}
                    className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <ArrowPathIcon className="w-5 h-5 animate-spin" />
                        Compressing...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <ScaleIcon className="w-5 h-5" />
                        Compress Image
                      </span>
                    )}
                  </button>
                )}
                
                {compressedImage && (
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
            <ScaleIcon className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-sm text-gray-600">Reduce file size up to 90%</p>
        </div>
        <div className="text-center">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <PhotoIcon className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-sm text-gray-600">Maintain visual quality</p>
        </div>
        <div className="text-center">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <DocumentArrowDownIcon className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-sm text-gray-600">Multiple format support</p>
        </div>
      </div>

      {/* Note */}
      <p className="text-xs text-gray-400 text-center mt-8">
        All compression is done locally in your browser. Your images never leave your device.
      </p>
    </div>
  );
}