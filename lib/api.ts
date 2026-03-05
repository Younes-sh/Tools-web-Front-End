import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// اینترسپتور برای اضافه کردن توکن
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ========== Image API ==========
export const imageApi = {
  upscale: async (file: File, upscaleFactor: number, enhancementType: string) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('upscaleFactor', upscaleFactor.toString());
    formData.append('enhancementType', enhancementType);

    const response = await api.post('/images/upscale', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getHistory: async (page = 1) => {
    const response = await api.get(`/images?page=${page}`);
    return response.data;
  },

  deleteImage: async (imageId: string) => {
    const response = await api.delete(`/images/${imageId}`);
    return response.data;
  },

  getUsageStats: async () => {
    const response = await api.get('/images/usage-stats');
    return response.data;
  },

  getDownloadUrl: async (imageId: string) => {
    const response = await api.post(`/images/${imageId}/download`);
    return response.data;
  },
};

// ========== Auth API ==========
export const authApi = {
  // ثبت‌نام
  register: async (name: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },

  // ورود
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // تأیید ایمیل
  verifyEmail: async (email: string, code: string) => {
    const response = await api.post('/auth/verify-email', { email, code });
    return response.data;
  },

  // ارسال مجدد کد تأیید
  resendVerification: async (email: string) => {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  },

  // فراموشی رمز عبور
  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // بازنشانی رمز عبور
  resetPassword: async (email: string, code: string, newPassword: string) => {
    const response = await api.post('/auth/reset-password', { email, code, newPassword });
    return response.data;
  },

  // درخواست تغییر رمز
  changePasswordRequest: async () => {
    const response = await api.post('/auth/change-password-request');
    return response.data;
  },

  // تغییر رمز عبور
  changePassword: async (code: string, newPassword: string) => {
    const response = await api.post('/auth/change-password', { code, newPassword });
    return response.data;
  },

  // دریافت اطلاعات کاربر
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // خروج
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // تمدید توکن
  refreshToken: async (refreshToken: string) => {
    const response = await api.post('/auth/refresh-token', { refreshToken });
    return response.data;
  },

  // ✅ تابع جدید برای OAuth (ورود با Google/GitHub)
  oauthLogin: async (data: { 
    email: string; 
    name: string; 
    provider: string; 
    providerId: string 
  }) => {
    const response = await api.post('/auth/oauth', data);
    return response.data;
  },
};

// ========== Subscription API ==========
export const subscriptionApi = {
  getPlans: async () => {
    const response = await api.get('/subscription/plans');
    return response.data;
  },

  createSubscription: async (planId: string, paymentMethodId: string) => {
    const response = await api.post('/subscription/create', { planId, paymentMethodId });
    return response.data;
  },

  cancelSubscription: async () => {
    const response = await api.post('/subscription/cancel');
    return response.data;
  },

  getSubscriptionStatus: async () => {
    const response = await api.get('/subscription/status');
    return response.data;
  },

  upgradePlan: async (newPlanId: string) => {
    const response = await api.post('/subscription/upgrade', { newPlanId });
    return response.data;
  },

  getInvoices: async () => {
    const response = await api.get('/subscription/invoices');
    return response.data;
  },
};

export default api;