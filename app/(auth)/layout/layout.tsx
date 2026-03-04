import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* هدر ساده مخصوص auth */}
      <div className="container mx-auto px-4 py-4">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      {/* محتوای صفحات auth - اضافه کردن flex برای مرکزیت */}
      <div className="container mx-auto px-4 flex items-center justify-center min-h-[calc(100vh-200px)]">
        {children}
      </div>

      {/* فوتر ساده مخصوص auth */}
      <div className="container mx-auto px-4 py-4 text-center text-sm text-gray-500">
        <p>© 2026 Tools. Secure Authentication</p>
      </div>
    </div>
  );
}