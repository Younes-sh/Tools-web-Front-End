// components/common/AuthLayout.tsx
'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-4">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
      <main className="container mx-auto px-4">
        {children}
      </main>
      <div className="container mx-auto px-4 py-4 text-center text-sm text-gray-500">
        <p>© 2026 Tools. Secure Authentication</p>
      </div>
    </div>
  );
}