'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
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

  // ✅ مشکل 6: accept کامل‌تر
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    const selectedFile = acceptedFiles[0];
    
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }
    
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('Image size should be less than 10MB');
      return;
    }

    // ✅ پاکسازی preview قبلی
    if (preview) URL.revokeObjectURL(preview);

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setProcessedImage(null);
    setProcessedFile(null);
  }, [preview]);

  // ✅ مشکل 6: accept بهبود یافته
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/bmp': ['.bmp']
    },
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE
  });

  // ✅ مشکل 3: حذف canvasRef از شرط API
  const removeBackground = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      if (processingMethod === 'api') {
        await removeBackgroundWithAPI();
      } else {
        await removeBackgroundWithCanvas();
      }
    } catch (err) {
      console.error('Background removal error:', err);
      setError('Error removing background. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ مشکل 1: حذف setLoading اضافی
  const removeBackgroundWithAPI = async () => {
    // بررسی وجود فایل
    if (!file) {
      setError('No file selected');
      setLoading(false);
      return;
    }

    // ذخیره در متغیر محلی برای TypeScript
    const selectedFile = file;

    try {
      console.log('🎨 Removing background with API...');
      
      // TODO: اینجا API واقعی رو فراخوانی کن
      // const result = await backgroundApi.removeBackground(selectedFile, ...);
      
      // شبیه‌سازی برای تست
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // ایجاد یک تصویر شبیه‌سازی شده
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      // ✅ مشکل 5: بررسی preview
      if (!preview) throw new Error('Preview not available');
      
      img.src = preview;
      await new Promise((resolve) => { img.onload = resolve; });
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      // رسم تصویر اصلی
      ctx?.drawImage(img, 0, 0);
      
      // ✅ مشکل 4: اعمال رنگ پس‌زمینه
      if (backgroundColor !== 'transparent') {
        const bgColor = showCustomColor ? customColor : 
          BACKGROUND_OPTIONS.find(opt => opt.value === backgroundColor)?.color || '#FFFFFF';
        
        if (ctx) {
          ctx.globalCompositeOperation = 'destination-over';
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.globalCompositeOperation = 'source-over';
        }
      }
      
      canvas.toBlob((blob) => {
        if (!blob) return;
        
        const url = URL.createObjectURL(blob);
        setProcessedImage(url);
        setProcessedFile(new File([blob], `no-bg-${selectedFile.name}`, { type: blob.type }));
      }, `image/${outputFormat}`, 0.95);
      
    } catch (error) {
      console.error('API error:', error);
      throw error;
    }
  };

  const removeBackgroundWithCanvas = async () => {
    if (!file || !canvasRef.current || !preview) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.src = preview;
    await new Promise((resolve) => { img.onload = resolve; });
    
    canvas.width = img.width;
    canvas.height = img.height;
    
    ctx?.drawImage(img, 0, 0);
    
    // شبیه‌سازی حذف پس‌زمینه
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // ✅ مشکل 4: اعمال رنگ پس‌زمینه
    if (backgroundColor !== 'transparent' && ctx) {
      const bgColor = showCustomColor ? customColor : 
        BACKGROUND_OPTIONS.find(opt => opt.value === backgroundColor)?.color || '#FFFFFF';
      
      ctx.globalCompositeOperation = 'destination-over';
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';
    }
    
    canvas.toBlob((blob) => {
      if (!blob) return;
      
      const url = URL.createObjectURL(blob);
      setProcessedImage(url);
      setProcessedFile(new File([blob], `no-bg-${file.name}`, { type: blob.type }));
    }, `image/${outputFormat}`, 0.95);
  };

  const handleDownload = () => {
    if (!processedFile || !processedImage) return;
    
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = processedFile.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // ✅ مشکل 2: پاکسازی صحیح memory leak
  const resetUpload = () => {
    if (preview) URL.revokeObjectURL(preview);
    if (processedImage) URL.revokeObjectURL(processedImage);

    setFile(null);
    setPreview(null);
    setProcessedImage(null);
    setProcessedFile(null);
    setError(null);
  };

  // ✅ بهبود حرفه‌ای: cleanup در useEffect
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
      if (processedImage) URL.revokeObjectURL(processedImage);
    };
  }, [preview, processedImage]);

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // ... ادامه JSX (همون قبلی)
  
  return (
    <div className="max-w-6xl mx-auto p-6">
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

      {/* ادامه JSX مانند قبل... */}
    </div>
  );
}