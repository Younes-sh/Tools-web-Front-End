// src/app/upscale/page.tsx
'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { imageApi } from '../../../lib/api';
import { 
  ArrowUpTrayIcon, 
  XMarkIcon, 
  ArrowDownTrayIcon,
  SparklesIcon,
  BoltIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function UpscalePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upscaleFactor, setUpscaleFactor] = useState<2 | 4>(4);
  const [enhancementType, setEnhancementType] = useState<string>('standard');
  const [freeUsesLeft, setFreeUsesLeft] = useState(3);
  const [showComparison, setShowComparison] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
  setError(null);
  const selectedFile = acceptedFiles[0];
  
  // اعتبارسنجی بهتر
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/bmp'];
  if (!validTypes.includes(selectedFile.type)) {
    setError('Please select a valid image file (JPG, PNG, WEBP, BMP)');
    return;
  }
  
  if (selectedFile.size > 20 * 1024 * 1024) {
    setError('Image size should be less than 20MB');
    return;
  }

  console.log('Selected file:', {
    name: selectedFile.name,
    type: selectedFile.type,
    size: selectedFile.size
  });

  setFile(selectedFile);
  setPreview(URL.createObjectURL(selectedFile));
  setProcessedImage(null);
}, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.bmp']
    },
    maxFiles: 1
  });

  const handleProcess = async () => {
  if (!file) return;
  
  if (freeUsesLeft <= 0) {
    window.location.href = '/pricing';
    return;
  }

  setLoading(true);
  setError(null);

  try {
    const response = await imageApi.upscale(file, upscaleFactor, enhancementType);
    
    if (response.success) {
      setProcessedImage(response.data.image.upscaledUrl);
      setFreeUsesLeft(response.data.freeUsesRemaining);
    }
  } catch (error: any) {
    setError(error.response?.data?.message || 'Error processing image');
    console.error('Upscale error:', error);
  } finally {
    setLoading(false);
  }
};

  const handleDownload = () => {
    if (!processedImage) return;
    
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `upscaled-${file?.name || 'image'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetUpload = () => {
    setFile(null);
    setPreview(null);
    setProcessedImage(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            AI Image Upscaler
          </h1>
          <p className="text-xl text-gray-600">
            Upload your image and let our AI enhance it to 4x resolution
          </p>
          
          {/* Free uses badge */}
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-6 py-3 rounded-full mt-6">
            <SparklesIcon className="w-5 h-5" />
            <span className="font-semibold">{freeUsesLeft} free {freeUsesLeft === 1 ? 'use' : 'uses'} remaining</span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Main upload/processing area */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            
            {/* Tabs or options */}
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">Upscale factor:</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setUpscaleFactor(2)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        upscaleFactor === 2
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      2x
                    </button>
                    <button
                      onClick={() => setUpscaleFactor(4)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        upscaleFactor === 4
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      4x
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">Enhancement:</span>
                  <select
                    value={enhancementType}
                    onChange={(e) => setEnhancementType(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="standard">Standard</option>
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                    <option value="artwork">Artwork</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Upload area */}
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
                <ArrowUpTrayIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-lg text-gray-700 mb-2">
                  {isDragActive
                    ? 'Drop your image here'
                    : 'Drag & drop your image here'}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  or click to browse
                </p>
                <p className="text-xs text-gray-400">
                  Supports: JPG, PNG, WebP, BMP (Max 20MB)
                </p>
              </div>
            ) : (
              /* Preview area */
              <div className="p-6">
                {/* Error message */}
                {error && (
                  <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Image comparison slider */}
                <div className="relative">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Original */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Original</h3>
                        <span className="text-xs text-gray-500">
                          {file && (file.size / 1024 / 1024).toFixed(2)} MB
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
                        <h3 className="font-semibold text-gray-900">Upscaled ({upscaleFactor}x)</h3>
                        {processedImage && (
                          <span className="text-xs text-green-600">Ready</span>
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
                            alt="Upscaled"
                            fill
                            className="object-contain"
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50">
                            <p className="text-gray-400">Click process to enhance</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={resetUpload}
                        className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                      >
                        <XMarkIcon className="w-5 h-5 inline mr-1" />
                        Remove
                      </button>
                      {processedImage && (
                        <button
                          onClick={() => setShowComparison(!showComparison)}
                          className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                        >
                          Compare
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {!processedImage && (
                        <button
                          onClick={handleProcess}
                          disabled={loading}
                          className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <ArrowPathIcon className="w-5 h-5 animate-spin" />
                          ) : (
                            <SparklesIcon className="w-5 h-5" />
                          )}
                          <span>{loading ? 'Processing...' : 'Enhance Image'}</span>
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
              </div>
            )}
          </div>

          {/* Features info */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="flex items-center gap-3 text-gray-600">
              <BoltIcon className="w-5 h-5 text-blue-600" />
              <span className="text-sm">Processing takes 10-30 seconds</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <ShieldCheckIcon className="w-5 h-5 text-blue-600" />
              <span className="text-sm">Images are deleted after 1 hour</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <CheckCircleIcon className="w-5 h-5 text-blue-600" />
              <span className="text-sm">Lossless quality preservation</span>
            </div>
          </div>

          {/* Examples */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              See what our AI can do
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: 'Portrait', description: '4x enhancement', icon: '👤' },
                { title: 'Landscape', description: 'Detail preservation', icon: '🏞️' },
                { title: 'Product', description: 'Sharp & clear', icon: '📦' }
              ].map((item, index) => (
                <div key={index} className="relative group cursor-pointer">
                  <div className="aspect-square bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl overflow-hidden border-2 border-blue-100 hover:border-blue-300 transition-all p-8 flex flex-col items-center justify-center">
                    <span className="text-5xl mb-4">{item.icon}</span>
                    <h4 className="text-xl font-semibold text-gray-800 mb-2">{item.title}</h4>
                    <p className="text-sm text-gray-600 text-center">{item.description}</p>
                    <div className="mt-4 flex gap-3">
                      <span className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded-full">Before</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">After</span>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <span className="text-white font-semibold text-lg">View Sample</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}