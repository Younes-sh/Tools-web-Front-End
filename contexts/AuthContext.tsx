'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { authApi } from '../lib/api';

declare module 'next-auth' {
    interface Session {
        user: {
            id?: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
        };
    }
}

// تعریف نوع داده کاربر
interface User {
    id: string;
    name: string;
    email: string;
    freeUsesRemaining: number;
    subscription: {
        type: 'free' | 'monthly' | 'yearly';
    };
}

// تعریف نوع Context
interface AuthContextType {
    user: User | null;
    loading: boolean;
    loginWithEmail: (email: string, password: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    loginWithGitHub: () => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (userData: Partial<User>) => void;
}

// ایجاد Context با مقدار پیش‌فرض
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession();
    const loading = status === 'loading';
    const router = useRouter();

    // همگام‌سازی کاربر NextAuth با localStorage
    useEffect(() => {
        const syncUserWithBackend = async () => {
            if (session?.user) {
                try {
                    // اگر کاربر از طریق OAuth وارد شده، اطلاعاتش را با بک‌اند همگام کن
                    const user: User = {
                        id: session.user.id || session.user.email || '',
                        name: session.user.name || '',
                        email: session.user.email || '',
                        freeUsesRemaining: 3,
                        subscription: { type: 'free' }
                    };
                    localStorage.setItem('user', JSON.stringify(user));
                } catch (error) {
                    console.error('Error syncing OAuth user with backend:', error);
                }
            }
        };

        syncUserWithBackend();
    }, [session]);

    // تابع ورود با ایمیل و رمز
    const loginWithEmail = async (email: string, password: string) => {
        try {
            const response = await authApi.login(email, password);

            if (response.success) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                router.push('/upscale');
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    // تابع ورود با Google
    const loginWithGoogle = async () => {
        await signIn('google', { callbackUrl: '/upscale' });
    };

    // تابع ورود با GitHub
    const loginWithGitHub = async () => {
        await signIn('github', { callbackUrl: '/upscale' });
    };

    // تابع ثبت‌نام
    const register = async (name: string, email: string, password: string) => {
        try {
            const response = await authApi.register(name, email, password);

            if (response.success) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                router.push('/verify-email?email=' + encodeURIComponent(email));
            }
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    };

    // تابع خروج
    const logout = async () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        await signOut({ callbackUrl: '/' });
    };

    // به‌روزرسانی اطلاعات کاربر
    const updateUser = (userData: Partial<User>) => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const currentUser = JSON.parse(userStr);
                const updatedUser = { ...currentUser, ...userData };
                localStorage.setItem('user', JSON.stringify(updatedUser));
            } catch (error) {
                console.error('Error updating user:', error);
            }
        }
    };

    // دریافت کاربر فعلی (از session یا localStorage)
    const getCurrentUser = (): User | null => {
        // اولویت با session کاربر OAuth است
        if (session?.user) {
            // تبدیل session.user به فرمت User
            return {
                id: session.user.id || session.user.email || '',
                name: session.user.name || '',
                email: session.user.email || '',
                freeUsesRemaining: 3, // مقدار پیش‌فرض
                subscription: { type: 'free' }
            };
        }

        // اگر session نبود، از localStorage بخوان
        const userStr = localStorage.getItem('user');
        if (userStr && userStr !== 'undefined') {
            try {
                return JSON.parse(userStr);
            } catch {
                return null;
            }
        }
        return null;
    };

    const user = getCurrentUser();

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            loginWithEmail,
            loginWithGoogle,
            loginWithGitHub,
            register,
            logout,
            updateUser,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook سفارشی برای استفاده از Context
export function useAuth() {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}