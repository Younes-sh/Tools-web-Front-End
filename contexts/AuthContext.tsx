'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { authApi } from '../lib/api';

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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession();
    const [user, setUser] = useState<User | null>(null);
    const loading = status === 'loading';
    const router = useRouter();

    // بارگذاری کاربر از localStorage فقط در کلاینت
    useEffect(() => {
        const loadUserFromStorage = () => {
            if (typeof window !== 'undefined') {
                const userStr = localStorage.getItem('user');
                if (userStr && userStr !== 'undefined') {
                    try {
                        setUser(JSON.parse(userStr));
                    } catch (error) {
                        console.error('Error parsing user:', error);
                        localStorage.removeItem('user');
                    }
                }
            }
        };

        loadUserFromStorage();
    }, []);

    // همگام‌سازی کاربر NextAuth با بک‌اند
    useEffect(() => {
        const syncUserWithBackend = async () => {
            // اگر session داریم ولی کاربر در state نیست
            if (session?.user && !user) {
                try {
                    // فقط در کلاینت اجرا شود
                    if (typeof window === 'undefined') return;

                    // بررسی کنیم آیا قبلاً این کاربر را sync کرده‌ایم
                    const syncedEmail = localStorage.getItem('synced_email');
                    
                    // اگر قبلاً sync شده و email یکی است، دوباره درخواست نده
                    if (syncedEmail === session.user.email) {
                        return;
                    }

                    // درخواست به بک‌اند برای OAuth login
                    const response = await authApi.oauthLogin({
                        email: session.user.email!,
                        name: session.user.name!,
                        provider: 'google', // یا github
                        providerId: session.user.email!
                    });

                    if (response.success) {
                        localStorage.setItem('token', response.data.token);
                        localStorage.setItem('user', JSON.stringify(response.data.user));
                        localStorage.setItem('synced_email', session.user.email!);
                        setUser(response.data.user);
                    }
                } catch (error) {
                    console.error('Error syncing OAuth user with backend:', error);
                    // اگر بک‌اند وصل نیست، از اطلاعات session استفاده کن
                    if (session.user) {
                        const tempUser: User = {
                            id: session.user.id || '',
                            name: session.user.name || '',
                            email: session.user.email || '',
                            freeUsesRemaining: 3,
                            subscription: { type: 'free' }
                        };
                        setUser(tempUser);
                    }
                }
            }
        };

        syncUserWithBackend();
    }, [session, user]);

    // تابع ورود با ایمیل و رمز
    const loginWithEmail = async (email: string, password: string) => {
        try {
            const response = await authApi.login(email, password);

            if (response.success) {
                if (typeof window !== 'undefined') {
                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                }
                setUser(response.data.user);
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
                if (typeof window !== 'undefined') {
                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                }
                setUser(response.data.user);
                router.push('/verify-email?email=' + encodeURIComponent(email));
            }
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    };

    // تابع خروج
    const logout = async () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('synced_email');
        }
        setUser(null);
        await signOut({ callbackUrl: '/' });
    };

    // به‌روزرسانی اطلاعات کاربر
    const updateUser = (userData: Partial<User>) => {
        if (user) {
            const updatedUser = { ...user, ...userData };
            if (typeof window !== 'undefined') {
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
            setUser(updatedUser);
        }
    };

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

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}