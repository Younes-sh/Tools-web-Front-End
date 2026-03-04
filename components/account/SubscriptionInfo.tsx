'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  SparklesIcon, 
  BoltIcon, 
  CheckCircleIcon,
  ClockIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import { User } from '@/types';

interface SubscriptionInfoProps {
  user: User;
  onUpgrade?: () => void;
  onCancel?: () => void;
}

export default function SubscriptionInfo({ user, onUpgrade, onCancel }: SubscriptionInfoProps) {
  const [loading, setLoading] = useState(false);

  const getPlanDetails = () => {
    switch (user.subscription?.type) {
      case 'free':
        return {
          name: 'Free Plan',
          color: 'gray',
          icon: <SparklesIcon className="w-6 h-6" />,
          features: [
            { name: '3 free images', included: true },
            { name: 'Up to 2x upscale', included: true },
            { name: 'Priority support', included: false }
          ]
        };
      case 'monthly':
        return {
          name: 'Pro Monthly',
          color: 'blue',
          icon: <BoltIcon className="w-6 h-6" />,
          price: '$9.99/month',
          features: [
            { name: '100 images/month', included: true },
            { name: 'Up to 4x upscale', included: true },
            { name: 'Priority support', included: true }
          ]
        };
      case 'yearly':
        return {
          name: 'Pro Yearly',
          color: 'purple',
          icon: <BoltIcon className="w-6 h-6" />,
          price: '$99.99/year',
          features: [
            { name: 'Unlimited images', included: true },
            { name: 'Up to 8x upscale', included: true },
            { name: '24/7 Priority support', included: true }
          ]
        };
      default:
        return null;
    }
  };

  const plan = getPlanDetails();
  if (!plan) return null;

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return;
    setLoading(true);
    try {
      // API call to cancel subscription
      if (onCancel) onCancel();
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription</h3>

      {/* Plan Card */}
      <div className={`bg-${plan.color}-50 border border-${plan.color}-200 rounded-xl p-4 mb-4`}>
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 bg-${plan.color}-100 rounded-lg flex items-center justify-center text-${plan.color}-600`}>
            {plan.icon}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{plan.name}</h4>
            {plan.price && <p className="text-sm text-gray-600">{plan.price}</p>}
          </div>
        </div>

        {/* Features */}
        <div className="space-y-2">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              {feature.included ? (
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-gray-300" />
              )}
              <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                {feature.name}
              </span>
            </div>
          ))}
        </div>

        {/* Free uses remaining (for free plan) */}
        {user.subscription?.type === 'free' && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Free uses remaining:</span>
              <span className="font-semibold text-blue-600">{user.freeUsesRemaining}/3</span>
            </div>
          </div>
        )}

        {/* Subscription dates (for paid plans) */}
        {user.subscription?.type !== 'free' && user.subscription?.endDate && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ClockIcon className="w-4 h-4" />
              <span>Renews on {new Date(user.subscription.endDate).toLocaleDateString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {user.subscription?.type === 'free' ? (
          <Link
            href="/pricing"
            className="block w-full text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-colors"
          >
            Upgrade Plan
          </Link>
        ) : (
          <>
            <Link
              href="/pricing"
              className="block w-full text-center border-2 border-blue-600 text-blue-600 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
            >
              Change Plan
            </Link>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="w-full text-center text-red-600 py-2 text-sm hover:text-red-700 disabled:opacity-50"
            >
              {loading ? 'Cancelling...' : 'Cancel Subscription'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}