import { apiFetch } from '@/lib/api';

export const authService = {
  login: async (credentials: object) => {
    const data = await apiFetch<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (data?.token) {
      document.cookie = `token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
      
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    }

    return data;
  },

  register: async (userData: { nama_user: string; username: string; password: string; captchaToken: string }) => {
    return await apiFetch<{ message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  logout: () => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};