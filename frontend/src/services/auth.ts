import { apiFetch } from '@/lib/api';

export const authService = {
  login: async (credentials: object) => {
    const data = await apiFetch<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (data?.token) {
      // Set cookie token untuk middleware & apiFetch
      document.cookie = `token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
      
      // Simpan user info
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    }

    return data;
  },

  logout: () => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};