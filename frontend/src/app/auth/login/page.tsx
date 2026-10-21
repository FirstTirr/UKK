'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res: any = await authService.login({ username, password });
      
      // 1. Simpan di localStorage buat client-side fetcher
      localStorage.setItem('token', res.token);
      if (res.user) localStorage.setItem('user', JSON.stringify(res.user));

      // 2. WAJIB: Simpan di Cookie biar dibaca sama Next.js Middleware!
      document.cookie = `token=${res.token}; path=/; max-age=86400; SameSite=Lax`;

      alert('Login berhasil!');
      
      // Redirect sesuai role
      const role = res.user?.role;
      if (role === 'admin') router.push('/admin/dashboard');
      else if (role === 'petugas') router.push('/petugas/dashboard');
      else router.push('/peminjam/dashboard');

    } catch (err: any) {
      alert(err.message || 'Login gagal');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <form onSubmit={handleLogin} className="bg-gray-800 p-8 rounded-lg shadow-md w-96 flex flex-col gap-4">
        <h1 className="text-xl font-bold text-center">Login UKK</h1>
        
        <div>
          <label className="block text-sm mb-1">Username</label>
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none"
            required 
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none"
            required 
          />
        </div>

        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-semibold mt-2">
          Login
        </button>
      </form>
    </div>
  );
}
