'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  MagnifyingGlassIcon, 
  ArrowDownTrayIcon,
  HeartIcon,
  ShareIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon,
  ClockIcon,
  UserIcon,
  CameraIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

// نمونه داده‌های گالری
const galleryImages = [
  {
    id: 1,
    title: 'Portrait Enhancement',
    category: 'portrait',
    before: '/images/gallery/portrait-before.jpg',
    after: '/images/gallery/portrait-after.jpg',
    likes: 234,
    views: 1234,
    user: 'Sarah Johnson',
    date: '2024-02-15',
    tags: ['portrait', 'face', 'detail']
  },
  {
    id: 2,
    title: 'Landscape Photography',
    category: 'landscape',
    before: '/images/gallery/landscape-before.jpg',
    after: '/images/gallery/landscape-after.jpg',
    likes: 567,
    views: 3456,
    user: 'Michael Chen',
    date: '2024-02-14',
    tags: ['landscape', 'nature', 'mountain']
  },
  {
    id: 3,
    title: 'Product Photography',
    category: 'product',
    before: '/images/gallery/product-before.jpg',
    after: '/images/gallery/product-after.jpg',
    likes: 189,
    views: 987,
    user: 'Emma Davis',
    date: '2024-02-13',
    tags: ['product', 'ecommerce', 'detail']
  },
  {
    id: 4,
    title: 'Wildlife Shot',
    category: 'wildlife',
    before: '/images/gallery/wildlife-before.jpg',
    after: '/images/gallery/wildlife-after.jpg',
    likes: 432,
    views: 2345,
    user: 'David Wilson',
    date: '2024-02-12',
    tags: ['wildlife', 'animal', 'nature']
  },
  {
    id: 5,
    title: 'Architecture Detail',
    category: 'architecture',
    before: '/images/gallery/architecture-before.jpg',
    after: '/images/gallery/architecture-after.jpg',
    likes: 321,
    views: 1654,
    user: 'Lisa Anderson',
    date: '2024-02-11',
    tags: ['architecture', 'building', 'detail']
  },
  {
    id: 6,
    title: 'Food Photography',
    category: 'food',
    before: '/images/gallery/food-before.jpg',
    after: '/images/gallery/food-after.jpg',
    likes: 654,
    views: 2876,
    user: 'James Brown',
    date: '2024-02-10',
    tags: ['food', 'culinary', 'detail']
  },
  {
    id: 7,
    title: 'Fashion Portrait',
    category: 'portrait',
    before: '/images/gallery/fashion-before.jpg',
    after: '/images/gallery/fashion-after.jpg',
    likes: 876,
    views: 3987,
    user: 'Maria Garcia',
    date: '2024-02-09',
    tags: ['fashion', 'portrait', 'style']
  },
  {
    id: 8,
    title: 'Cityscape Night',
    category: 'cityscape',
    before: '/images/gallery/city-before.jpg',
    after: '/images/gallery/city-after.jpg',
    likes: 543,
    views: 2341,
    user: 'Alex Turner',
    date: '2024-02-08',
    tags: ['city', 'night', 'urban']
  },
  {
    id: 9,
    title: 'Macro Photography',
    category: 'macro',
    before: '/images/gallery/macro-before.jpg',
    after: '/images/gallery/macro-after.jpg',
    likes: 298,
    views: 1432,
    user: 'Sophie Martin',
    date: '2024-02-07',
    tags: ['macro', 'insect', 'detail']
  }
];

// دسته‌بندی‌ها
const categories = [
  { id: 'all', name: 'All Images', count: 156 },
  { id: 'portrait', name: 'Portrait', count: 34 },
  { id: 'landscape', name: 'Landscape', count: 28 },
  { id: 'product', name: 'Product', count: 23 },
  { id: 'wildlife', name: 'Wildlife', count: 19 },
  { id: 'architecture', name: 'Architecture', count: 21 },
  { id: 'food', name: 'Food', count: 16 },
  { id: 'cityscape', name: 'Cityscape', count: 15 },
];

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState<typeof galleryImages[0] | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [likedImages, setLikedImages] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  // فیلتر کردن تصاویر بر اساس دسته‌بندی و جستجو
  const filteredImages = galleryImages.filter(image => {
    const matchesCategory = selectedCategory === 'all' || image.category === selectedCategory;
    const matchesSearch = image.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         image.tags.some(tag => tag.includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // مرتب‌سازی تصاویر
  const sortedImages = [...filteredImages].sort((a, b) => {
    if (sortBy === 'popular') return b.likes - a.likes;
    if (sortBy === 'recent') return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sortBy === 'views') return b.views - a.views;
    return 0;
  });

  const toggleLike = (imageId: number) => {
    setLikedImages(prev =>
      prev.includes(imageId)
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-16">
      
      {/* Header */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          Success Gallery
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          See the amazing results our AI has achieved. Browse through before and after comparisons.
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Sort */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="popular">Most Popular</option>
                <option value="recent">Most Recent</option>
                <option value="views">Most Viewed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedImages.map((image) => (
              <div
                key={image.id}
                className="group bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all cursor-pointer"
                onClick={() => setSelectedImage(image)}
              >
                {/* Image Preview */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  <div className="absolute inset-0 flex">
                    {/* Before Image */}
                    <div className="w-1/2 relative overflow-hidden">
                      <div className="absolute inset-0 bg-black/50 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        Before
                      </div>
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                        <CameraIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    </div>
                    {/* After Image */}
                    <div className="w-1/2 relative overflow-hidden">
                      <div className="absolute inset-0 bg-blue-600/50 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        After
                      </div>
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                        <SparklesIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full z-20">
                    {image.category}
                  </div>
                </div>

                {/* Image Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{image.title}</h3>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <UserIcon className="w-4 h-4" />
                      <span>{image.user}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4" />
                      <span>{new Date(image.date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(image.id);
                        }}
                        className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors"
                      >
                        {likedImages.includes(image.id) ? (
                          <HeartSolidIcon className="w-5 h-5 text-red-500" />
                        ) : (
                          <HeartIcon className="w-5 h-5" />
                        )}
                        <span className="text-sm">{image.likes + (likedImages.includes(image.id) ? 1 : 0)}</span>
                      </button>
                      <div className="flex items-center gap-1 text-gray-500">
                        <span className="text-sm">{image.views} views</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // دانلود نمونه
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <ArrowDownTrayIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <button className="px-8 py-3 bg-white text-gray-700 border-2 border-gray-200 rounded-xl font-semibold hover:border-blue-300 hover:text-blue-600 transition-colors">
              Load More Images
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-6xl w-full bg-white rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4 z-10">
              <div className="flex items-center justify-between text-white">
                <div>
                  <h2 className="text-xl font-semibold">{selectedImage.title}</h2>
                  <p className="text-sm opacity-90">by {selectedImage.user}</p>
                </div>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Image Comparison */}
            <div className="relative aspect-[16/9] bg-gray-900">
              <div className="absolute inset-0 flex">
                {/* Before */}
                <div
                  className="absolute inset-y-0 left-0 bg-gray-800 overflow-hidden"
                  style={{ width: showComparison ? '50%' : '100%' }}
                >
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <span className="text-white">Before Image</span>
                  </div>
                  <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
                    Before
                  </div>
                </div>

                {/* After */}
                <div
                  className="absolute inset-y-0 right-0 bg-gray-800 overflow-hidden"
                  style={{ width: showComparison ? '50%' : '0%' }}
                >
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <span className="text-white">After Image (4x Upscaled)</span>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-lg text-sm">
                    After
                  </div>
                </div>

                {/* Slider Handle (when in comparison mode) */}
                {showComparison && (
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
                    style={{ left: '50%' }}
                  >
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                      <ChevronLeftIcon className="w-4 h-4 text-gray-600" />
                      <ChevronRightIcon className="w-4 h-4 text-gray-600" />
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                <button
                  onClick={() => setShowComparison(!showComparison)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    showComparison
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/90 text-gray-700 hover:bg-white'
                  }`}
                >
                  {showComparison ? 'Side by Side' : 'Compare'}
                </button>
                <button className="px-4 py-2 bg-white/90 text-gray-700 rounded-lg font-medium hover:bg-white transition-colors">
                  <ShareIcon className="w-5 h-5" />
                </button>
                <button className="px-4 py-2 bg-white/90 text-gray-700 rounded-lg font-medium hover:bg-white transition-colors">
                  <ArrowDownTrayIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleLike(selectedImage.id)}
                    className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors"
                  >
                    {likedImages.includes(selectedImage.id) ? (
                      <HeartSolidIcon className="w-5 h-5 text-red-500" />
                    ) : (
                      <HeartIcon className="w-5 h-5" />
                    )}
                    <span>{selectedImage.likes + (likedImages.includes(selectedImage.id) ? 1 : 0)} likes</span>
                  </button>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">{selectedImage.views} views</span>
                </div>
                <div className="flex gap-2">
                  {selectedImage.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}