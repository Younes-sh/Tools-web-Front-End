'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ClockIcon, ArrowDownTrayIcon, TrashIcon } from '@heroicons/react/24/outline';
import { imageApi } from '../../lib/api';
import { Image as ImageType } from '../../types';

export default function ImageHistory() {
  const [images, setImages] = useState<ImageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadImages();
  }, [page]);

  const loadImages = async () => {
    try {
      const response = await imageApi.getHistory(page);
      if (response.success) {
        setImages(prev => page === 1 ? response.data.images : [...prev, ...response.data.images]);
        setHasMore(response.data.pagination.page < response.data.pagination.pages);
      }
    } catch (error) {
      console.error('Failed to load images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    try {
      await imageApi.deleteImage(imageId);
      setImages(prev => prev.filter(img => img._id !== imageId));
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  };

  const handleDownload = async (image: ImageType) => {
    try {
      const response = await imageApi.getDownloadUrl(image._id);
      if (response.success) {
        window.open(response.data.downloadUrl, '_blank');
      }
    } catch (error) {
      console.error('Failed to get download URL:', error);
    }
  };

  if (loading && page === 1) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Images</h3>

      {images.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No images yet</p>
          <a href="/upscale" className="text-blue-600 hover:underline mt-2 inline-block">
            Upscale your first image
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {images.map((image) => (
            <div
              key={image._id}
              className="flex items-center gap-4 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              {/* Thumbnail */}
              <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={image.upscaledUrl}
                  alt={image.publicId}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <ClockIcon className="w-4 h-4" />
                  <span>{new Date(image.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {image.metadata?.dimensions?.width} x {image.metadata?.dimensions?.height} • {image.format}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(image)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Download"
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(image._id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}

          {/* Load More */}
          {hasMore && (
            <button
              onClick={() => setPage(p => p + 1)}
              className="w-full text-center text-blue-600 py-2 text-sm hover:underline"
            >
              Load More
            </button>
          )}
        </div>
      )}
    </div>
  );
}