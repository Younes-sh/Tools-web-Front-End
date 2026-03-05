'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import api from '../../lib/api';

// بارگذاری Stripe با کلید عمومی
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutButtonProps {
  priceId: string;
  planType: 'monthly' | 'yearly';
  buttonText: string;
  className?: string;
}

export default function CheckoutButton({ priceId, planType, buttonText, className }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    
    try {
      // درخواست به بک‌اند برای ایجاد checkout session
      const response = await api.post('/stripe/create-checkout-session', {
        priceId,
        planType
      });

      if (response.data.success) {
        // هدایت به صفحه پرداخت Stripe
        window.location.href = response.data.data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className={className}
    >
      {loading ? 'Processing...' : buttonText}
    </button>
  );
}