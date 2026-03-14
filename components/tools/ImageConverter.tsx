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
  DocumentArrowDownIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

// فرمت‌های پشتیبانی شده واقعی
const SUPPORTED_FORMATS = [
  { value: 'png', label: 'PNG', mime: 'image/png', supported: true },
  { value: 'jpg', label: 'JPG', mime: 'image/jpeg', supported: true },
  { value: 'webp', label: 'WebP', mime: 'image/webp', supported: true },
  { value: 'gif', label: 'GIF', mime: 'image/gif', supported: false },
  { value: 'bmp', label: 'BMP', mime: 'image/bmp', supported: false },
];

export default function ImageConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [convertedImage, setConvertedImage] = useState<string | null>(null);
  const [convertedFile, setConvertedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState('png');
  const [quality, setQuality] = useState(90);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    const selectedFile = acceptedFiles[0];
    
    // اعتبارسنجی
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }
    
    if (selectedFile.size > 20 * 1024 * 1024) {
      setError('Image size should be less than 20MB');
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setConvertedImage(null);
    setConvertedFile(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif', '.bmp']
    },
    maxFiles: 1
  });

  const convertImage = async () => {
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
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext('2d');
    ctx?.drawImage(img, 0, 0);

    // تعیین MIME type بر اساس فرمت هدف
    let mimeType: string;
    let fileExtension: string;
    
    switch (targetFormat) {
      case 'jpg':
      case 'jpeg':
        mimeType = 'image/jpeg';
        fileExtension = 'jpg';
        break;
      case 'webp':
        mimeType = 'image/webp';
        fileExtension = 'webp';
        break;
      case 'gif':
        // GIF پشتیبانی نمی‌شود، پیشنهاد PNG
        setError('GIF output is not supported. Using PNG instead.');
        mimeType = 'image/png';
        fileExtension = 'png';
        break;
      case 'bmp':
        // BMP پشتیبانی نمی‌شود، پیشنهاد PNG
        setError('BMP output is not supported. Using PNG instead.');
        mimeType = 'image/png';
        fileExtension = 'png';
        break;
      case 'png':
      default:
        mimeType = 'image/png';
        fileExtension = 'png';
        break;
    }

    // بررسی پشتیبانی مرورگر از WebP
    if (targetFormat === 'webp') {
      const isWebPSupported = canvas.toDataURL('image/webp').indexOf('image/webp') === 5;
      if (!isWebPSupported) {
        setError('WebP is not supported in your browser. Using PNG instead.');
        mimeType = 'image/png';
        fileExtension = 'png';
      }
    }

    // تبدیل تصویر
    let convertedDataUrl: string;
    if (mimeType === 'image/jpeg') {
      // برای JPG می‌توانیم کیفیت را تنظیم کنیم
      convertedDataUrl = canvas.toDataURL(mimeType, quality / 100);
    } else {
      convertedDataUrl = canvas.toDataURL(mimeType);
    }

    // ایجاد فایل برای دانلود
    const byteString = atob(convertedDataUrl.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    const convertedBlob = new Blob([ab], { type: mimeType });
    const convertedFile = new File(
      [convertedBlob], 
      `${file.name.split('.')[0]}.${fileExtension}`,
      { type: mimeType }
    );

    setConvertedImage(convertedDataUrl);
    setConvertedFile(convertedFile);

  } catch (err) {
    console.error('Conversion error:', err);
    setError('Error converting image. Please try again.');
  } finally {
    setLoading(false);
  }
};
  const handleDownload = () => {
    if (!convertedFile || !convertedImage) return;
    
    const link = document.createElement('a');
    link.href = convertedImage;
    link.download = convertedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetUpload = () => {
    setFile(null);
    setPreview(null);
    setConvertedImage(null);
    setConvertedFile(null);
    setError(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* کانواس مخفی برای پردازش */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Image Converter
        </h1>
        <p className="text-gray-600">
          Convert your images to different formats easily
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        
        {/* Conversion Options */}
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex flex-wrap items-center gap-6">
            {/* Target Format */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">
                Convert to:
              </label>
              <select
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                {SUPPORTED_FORMATS.map((format) => (
                  <option key={format.value} value={format.value}>
                    {format.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Quality Slider (برای JPG و WebP) */}
            {(targetFormat === 'jpg' || targetFormat === 'webp') && (
              <div className="flex items-center gap-3 flex-1 max-w-xs">
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
            )}
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
              Supports: JPG, PNG, WebP, GIF, BMP (Max 20MB)
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
                    {file && (file.size / 1024).toFixed(1)} KB • {file?.type.split('/')[1].toUpperCase()}
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

              {/* Converted */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Converted</h3>
                  {convertedFile && (
                    <span className="text-xs text-green-600">
                      {(convertedFile.size / 1024).toFixed(1)} KB • {targetFormat.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden border-2 border-blue-200">
                  {loading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                      <ArrowPathIcon className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                      <p className="text-gray-700 font-medium">Converting...</p>
                    </div>
                  ) : convertedImage ? (
                    <Image
                      src={convertedImage}
                      alt="Converted"
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50">
                      <ArrowRightIcon className="w-12 h-12 text-gray-300 mb-2" />
                      <p className="text-gray-400">Click convert to start</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

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
                {!convertedImage && (
                  <button
                    onClick={convertImage}
                    disabled={loading}
                    className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <ArrowPathIcon className="w-5 h-5 animate-spin" />
                        Converting...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <DocumentArrowDownIcon className="w-5 h-5" />
                        Convert Image
                      </span>
                    )}
                  </button>
                )}
                
                {convertedImage && (
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

            {/* Format Info */}
            {convertedFile && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                <p>
                  ✓ Converted from <strong>{file?.type.split('/')[1].toUpperCase()}</strong> to{' '}
                  <strong>{targetFormat.toUpperCase()}</strong>
                  {convertedFile.size < file!.size && (
                    <span> • Size reduced by {((1 - convertedFile.size / file!.size) * 100).toFixed(1)}%</span>
                  )}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Features Info */}
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <div className="text-center">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <PhotoIcon className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-sm text-gray-600">Convert between all formats</p>
        </div>
        <div className="text-center">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <DocumentArrowDownIcon className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-sm text-gray-600">Lossless conversion</p>
        </div>
        <div className="text-center">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <ArrowPathIcon className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-sm text-gray-600">Fast & secure</p>
        </div>
      </div>

      {/* Note */}
      <p className="text-xs text-gray-400 text-center mt-8">
        All conversions are done locally in your browser. Your images never leave your device.
      </p>
    </div>
  );
}