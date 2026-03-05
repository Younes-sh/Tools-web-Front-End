'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  PhotoIcon, 
  DocumentIcon,
  ArrowRightStartOnRectangleIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

// تعریف اینترفیس User (همان‌طور که خودتان نوشته‌اید)
interface User {
  name: string;
  // اگر فیلدهای دیگری مانند email هم دارید، می‌توانید اضافه کنید
  email?: string;
}

const tools = [
  { name: 'Image Upscaler', href: '/upscale', icon: PhotoIcon },
  { name: 'PDF Merger', href: '/pdf-merge', icon: DocumentIcon },
  // ابزارهای آینده
];

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  // ✅ استفاده از اینترفیس User برای state
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr && userStr !== 'undefined') {
        const userData = JSON.parse(userStr) as User; // ✅ استفاده از Type Assertion
        setUser(userData);
      } else {
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('user');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* نوار بالایی مخصوص ابزارها */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* لوگو و ناوبری ابزارها */}
            <div className="flex items-center gap-8">
              <Link href="/" className="text-xl font-bold text-gray-900">
                Tools
              </Link>
              
              <nav className="hidden md:flex items-center gap-1">
                {tools.map((tool) => {
                  const Icon = tool.icon;
                  const isActive = pathname === tool.href;
                  return (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tool.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* اطلاعات کاربر */}
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link
                    href="/account"
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                  >
                    <UserCircleIcon className="w-5 h-5" />
                    {/* ✅ TypeScript حالا می‌داند user از نوع User است و name وجود دارد */}
                    <span className="text-sm hidden md:inline">{user.name}</span>
                  </Link>
                  <div className="h-4 w-px bg-gray-300 hidden md:block" />
                  <button
                    onClick={() => {
                      localStorage.removeItem('token');
                      localStorage.removeItem('user');
                      window.location.href = '/login';
                    }}
                    className="flex items-center gap-2 text-gray-600 hover:text-red-600"
                  >
                    <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
                    <span className="text-sm hidden md:inline">Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* محتوای اصلی ابزارها */}
      <main>
        {children}
      </main>
    </div>
  );
}