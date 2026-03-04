'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProfileInfo from '../../../components/account/ProfileInfo';
import SubscriptionInfo from '../../../components/account/SubscriptionInfo';
import UsageStats from '../../../components/account/UsageStats';
import ImageHistory from '../../../components/account/ImageHistory';
import ChangePasswordForm from '../../../components/auth/ChangePasswordForm';
import { authApi } from '../../../lib/api';
import { User } from '../../../types';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'security' | 'billing'>('overview');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await authApi.getMe();
      if (response.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              My Account
            </h1>
            <p className="text-gray-600">
              Manage your profile, subscription, and view your usage
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200 mb-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'security'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Security
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'billing'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Billing
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <ProfileInfo user={user} />
                <ImageHistory />
              </div>
              <div className="space-y-6">
                <SubscriptionInfo user={user} />
                <UsageStats />
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="max-w-2xl">
              <ChangePasswordForm onSuccess={() => alert('Password changed successfully!')} />
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="max-w-2xl">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing History</h3>
                <p className="text-gray-500 text-center py-8">No billing history yet</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}