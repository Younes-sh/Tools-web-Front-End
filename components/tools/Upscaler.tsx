'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import Image from 'next/image';

interface UpscalerProps {
  user?: {
    _id: string;
    name: string;
    email: string;
    freeUsesRemaining: number;
    subscription: {
      type: 'free' | 'monthly' | 'yearly';
    };
  } | null;
  onUpscaleComplete?: (data: unknown) => void;
}

export default function Upscaler({ user, onUpscaleComplete }: UpscalerProps) {
  interface UpscaleResult {
    upscaledUrl: string;
  }

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UpscaleResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [upscaleFactor, setUpscaleFactor] = useState<number>(4);
  const [enhancementType, setEnhancementType] = useState<string>('standard');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setResult(null);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 10485760, // 10MB
    multiple: false
  });

  const handleUpscale = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('upscaleFactor', upscaleFactor.toString());
    formData.append('enhancementType', enhancementType);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/images/upscale`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setResult(response.data.data?.image || response.data.image);
      if (onUpscaleComplete) {
        onUpscaleComplete(response.data);
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 403 && err.response?.data?.code === 'FREE_USES_EXHAUSTED') {
        setError('free_uses_exhausted');
      } else if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Error processing image');
      } else {
        setError('Error processing image');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!result) return;

    try {
      const response = await axios.get(result.upscaledUrl, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `upscaled-${file?.name || 'image'}.png`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header with controls */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-6">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Upscale Factor */}
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

            {/* Enhancement Type */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Enhancement:</span>
              <select
                value={enhancementType}
                onChange={(e) => setEnhancementType(e.target.value)}
                aria-label="Enhancement type"
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="standard">Standard</option>
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
                <option value="artwork">Artwork</option>
              </select>
            </div>

            {/* Free uses badge */}
            {user && user.subscription.type === 'free' && (
              <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium">
                {user.freeUsesRemaining} free {user.freeUsesRemaining === 1 ? 'use' : 'uses'} left
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
            <svg
              className="mx-auto h-16 w-16 text-gray-400 mb-4"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-lg text-gray-700 mb-2">
              {isDragActive
                ? 'Drop your image here'
                : 'Drag & drop your image here'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              or click to browse
            </p>
            <p className="text-xs text-gray-400">
              Supports: JPG, PNG, WEBP (Max 10MB)
            </p>
          </div>
        ) : (
          /* Preview Area */
          <div className="p-6">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error === 'free_uses_exhausted' ? (
                  <div>
                    <p className="font-medium">No free uses remaining</p>
                    <a href="/pricing" className="text-blue-600 hover:underline mt-1 inline-block">
                      Upgrade to continue
                    </a>
                  </div>
                ) : (
                  error
                )}
              </div>
            )}

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
                    className="object-cover"  // تغییر از object-contain به object-cover
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                </div>
              </div>

              {/* Processed */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Upscaled ({upscaleFactor}x)</h3>
                  {result && (
                    <span className="text-xs text-green-600">Ready</span>
                  )}
                </div>
                <div className="relative w-full h-[500px] bg-gray-100 rounded-xl overflow-hidden border-2 border-blue-200">
                  {loading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                      <svg className="animate-spin h-12 w-12 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="text-gray-700 font-medium">Processing...</p>
                      <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
                    </div>
                  ) : result ? (
                    <Image
                      src={result.upscaledUrl}
                      alt="Upscaled"
                      fill
                      className="object-cover"  // تغییر از object-contain به object-cover
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50">
                      <p className="text-gray-400">Click enhance to upscale</p>
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
                  Remove
                </button>
              </div>

              <div className="flex items-center gap-3">
                {!result && (
                  <button
                    onClick={handleUpscale}
                    disabled={loading}
                    className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Enhance Image
                      </>
                    )}
                  </button>
                )}
                
                {result && (
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Features info */}
      <div className="grid md:grid-cols-3 gap-6 text-center">
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-sm text-gray-600">Processing takes 10-30 seconds</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-sm text-gray-600">Images are deleted after 1 hour</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-sm text-gray-600">Lossless quality preservation</p>
        </div>
      </div>
    </div>
  );
}