'use client';

import { useEffect, useState } from 'react';
import { 
  PhotoIcon, 
  ChartBarIcon, 
  ArrowTrendingUpIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import { imageApi } from '../../lib/api';

interface UsageStats {
  totalImages: number;
  imagesToday: number;
  imagesThisMonth: number;
  totalStorageUsed: number;
}

export default function UsageStats() {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await imageApi.getUsageStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statsCards = [
    {
      title: 'Total Images',
      value: stats.totalImages,
      icon: <PhotoIcon className="w-6 h-6" />,
      color: 'blue'
    },
    {
      title: 'Today',
      value: stats.imagesToday,
      icon: <ArrowTrendingUpIcon className="w-6 h-6" />,
      color: 'green'
    },
    {
      title: 'This Month',
      value: stats.imagesThisMonth,
      icon: <ChartBarIcon className="w-6 h-6" />,
      color: 'purple'
    },
    {
      title: 'Storage Used',
      value: `${stats.totalStorageUsed} MB`,
      icon: <CloudArrowUpIcon className="w-6 h-6" />,
      color: 'orange'
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Statistics</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {statsCards.map((card, index) => (
          <div
            key={index}
            className={`bg-${card.color}-50 rounded-xl p-4`}
          >
            <div className={`w-8 h-8 bg-${card.color}-100 rounded-lg flex items-center justify-center text-${card.color}-600 mb-2`}>
              {card.icon}
            </div>
            <p className="text-sm text-gray-600">{card.title}</p>
            <p className="text-xl font-semibold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}