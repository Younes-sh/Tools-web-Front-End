'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  CheckCircleIcon, 
  SparklesIcon, 
  BoltIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  DevicePhoneMobileIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // پلن‌های اشتراک
  const plans = [
    {
      id: 'free',
      name: 'Free',
      description: 'Perfect for trying out our service',
      price: 0,
      features: [
        { name: '3 free images', included: true },
        { name: 'Up to 2x upscale', included: true },
        { name: 'Basic quality', included: true },
        { name: 'Priority support', included: false },
        { name: 'Batch processing', included: false },
        { name: 'API access', included: false },
      ],
      buttonText: 'Get Started',
      buttonLink: '/register',
      popular: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'For professionals and content creators',
      price: billingCycle === 'monthly' ? 9.99 : 99.99,
      originalPrice: billingCycle === 'yearly' ? 119.88 : undefined,
      features: [
        { name: '100 images/month', included: true },
        { name: 'Up to 4x upscale', included: true },
        { name: 'HD quality', included: true },
        { name: 'Priority support', included: true },
        { name: 'Batch processing (10 images)', included: true },
        { name: 'API access', included: false },
      ],
      buttonText: 'Start Free Trial',
      buttonLink: '/register?plan=pro',
      popular: true,
      savings: billingCycle === 'yearly' ? 'Save 30%' : undefined,
    },
    {
      id: 'business',
      name: 'Business',
      description: 'For teams and large organizations',
      price: billingCycle === 'monthly' ? 29.99 : 299.99,
      originalPrice: billingCycle === 'yearly' ? 359.88 : undefined,
      features: [
        { name: 'Unlimited images', included: true },
        { name: 'Up to 8x upscale', included: true },
        { name: 'Ultra HD quality', included: true },
        { name: '24/7 priority support', included: true },
        { name: 'Unlimited batch processing', included: true },
        { name: 'Full API access', included: true },
        { name: 'Team management', included: true },
        { name: 'Custom integration', included: true },
      ],
      buttonText: 'Contact Sales',
      buttonLink: '/contact?subject=business',
      popular: false,
      savings: billingCycle === 'yearly' ? 'Save 20%' : undefined,
    },
  ];

  // ویژگی‌های اضافی
  const features = [
    {
      icon: <BoltIcon className="w-6 h-6" />,
      title: 'Lightning Fast',
      description: 'AI processing in under 30 seconds'
    },
    {
      icon: <ShieldCheckIcon className="w-6 h-6" />,
      title: 'Secure Processing',
      description: 'Images encrypted and auto-deleted'
    },
    {
      icon: <DevicePhoneMobileIcon className="w-6 h-6" />,
      title: 'Mobile Friendly',
      description: 'Upload from any device'
    },
    {
      icon: <CloudArrowUpIcon className="w-6 h-6" />,
      title: 'Cloud Storage',
      description: 'Access your images anywhere'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-16">
      
      {/* Header */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Choose the perfect plan for your needs. Start with 3 free images, upgrade anytime.
        </p>
        
        {/* Billing Toggle */}
        <div className="inline-flex items-center gap-4 bg-white p-1 rounded-2xl shadow-lg mt-8">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-3 rounded-xl font-semibold transition-colors relative ${
              billingCycle === 'yearly'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Yearly
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-xl border overflow-hidden transition-transform hover:scale-105 ${
                plan.popular
                  ? 'border-blue-400 ring-2 ring-blue-400 ring-opacity-50'
                  : 'border-gray-200'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-bl-xl text-sm font-semibold">
                  Most Popular
                </div>
              )}

              {/* Savings Badge */}
              {plan.savings && (
                <div className="absolute top-0 left-0 bg-green-500 text-white px-4 py-1 rounded-br-xl text-sm font-semibold">
                  {plan.savings}
                </div>
              )}

              <div className="p-8">
                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-bold text-gray-900">
                      ${plan.price}
                    </span>
                    <span className="text-gray-500 mb-1">
                      /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                    </span>
                  </div>
                  
                  {/* Original Price (for yearly) */}
                  {plan.originalPrice && (
                    <div className="text-sm text-gray-400 line-through mt-1">
                      ${plan.originalPrice}/year
                    </div>
                  )}
                </div>

                {/* Features List */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li
                      key={index}
                      className={`flex items-start gap-3 ${
                        feature.included ? 'text-gray-700' : 'text-gray-400'
                      }`}
                    >
                      <CheckCircleIcon
                        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          feature.included ? 'text-green-500' : 'text-gray-300'
                        }`}
                      />
                      <span className="text-sm">{feature.name}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Link
                  href={plan.buttonLink}
                  className={`block text-center py-4 rounded-xl font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {plan.buttonText}
                </Link>

                {/* Free Trial Note */}
                {plan.id === 'pro' && (
                  <p className="text-xs text-center text-gray-500 mt-4">
                    3 free images included • No credit card required
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Comparison Table */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
          Compare All Features
        </h2>
        <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
          Everything you need to enhance your images with AI
        </p>

        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Free</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-blue-600">Pro</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Business</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                { name: 'Images per month', free: '3', pro: '100', business: 'Unlimited' },
                { name: 'Maximum upscale', free: '2x', pro: '4x', business: '8x' },
                { name: 'Quality', free: 'Standard', pro: 'HD', business: 'Ultra HD' },
                { name: 'Batch processing', free: '❌', pro: '✅ (10)', business: '✅ Unlimited' },
                { name: 'Priority support', free: '❌', pro: '✅', business: '✅ 24/7' },
                { name: 'API access', free: '❌', pro: '❌', business: '✅' },
                { name: 'Team management', free: '❌', pro: '❌', business: '✅' },
                { name: 'Custom integration', free: '❌', pro: '❌', business: '✅' },
              ].map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{row.name}</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-600">{row.free}</td>
                  <td className="px-6 py-4 text-sm text-center font-medium text-blue-600">{row.pro}</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-600">{row.business}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
          Why Choose UltraPixel?
        </h2>
        <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
          Experience the best AI image upscaling service
        </p>

        <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Teaser */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Got questions about pricing? Check our FAQ or contact us.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-xl font-semibold border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              View FAQ
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      {/* Money Back Guarantee */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <ShieldCheckIcon className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl font-bold mb-4">30-Day Money-Back Guarantee</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            If you're not completely satisfied with UltraPixel, contact us within 30 days for a full refund. No questions asked.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            Get Started Now
            <SparklesIcon className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}