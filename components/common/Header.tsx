'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ToolsSubmenu from './ToolsSubmenu';
import { 
  HomeIcon, 
  PhotoIcon, 
  CurrencyDollarIcon,
  EnvelopeIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

export default function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [user, setUser] = useState<any>(null);
  const loading = status === 'loading';

  useEffect(() => {
    // اولویت با session NextAuth
    if (session?.user) {
      setUser(session.user);
      // ذخیره توکن بک‌اند در localStorage
      if (session.backendToken) {
        localStorage.setItem('token', session.backendToken);
        localStorage.setItem('user', JSON.stringify(session.user));
      }
    } else {
      // اگر session نبود، از localStorage بخوان
      try {
        const userStr = localStorage.getItem('user');
        if (userStr && userStr !== 'undefined') {
          setUser(JSON.parse(userStr));
        }
      } catch (error) {
        console.error('Error parsing user:', error);
      }
    }
  }, [session]);

  const handleLogout = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    await signOut({ callbackUrl: '/' });
  };

  const navItems = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Pricing', href: '/pricing', icon: CurrencyDollarIcon },
    { name: 'Gallery', href: '/gallery', icon: PhotoIcon },
    { name: 'Contact', href: '/contact', icon: EnvelopeIcon },
  ];

  if (loading) {
    return (
      <header className="bg-white border-b border-gray-200 fixed w-full top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-gray-200 fixed w-full top-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"></div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">UltraPixel</span>
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden md:inline">{item.name}</span>
                </Link>
              );
            })}
            <ToolsSubmenu />
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/account"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                  <UserCircleIcon className="w-5 h-5" />
                  <span className="text-sm hidden md:inline">{user.name || 'Account'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-gray-600 hover:text-red-600"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  <span className="text-sm hidden md:inline">Logout</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-purple-700"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}