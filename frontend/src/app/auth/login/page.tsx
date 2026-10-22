'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ReCAPTCHA from 'react-google-recaptcha';
import { authService } from '@/services/auth';
import { Lock, User, ArrowRight, Loader2, ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  // State & Ref CAPTCHA
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const router = useRouter();

  useEffect(() => {
    const checkRateLimit = () => {
      const lockUntil = localStorage.getItem('rateLimitUntil');
      if (lockUntil) {
        const lockTime = parseInt(lockUntil, 10);
        const now = Date.now();
        const diff = Math.ceil((lockTime - now) / 1000);

        if (diff > 0) {
          setIsRateLimited(true);
          setRemainingSeconds(diff);
          setErrorMessage(`Terlalu banyak percobaan login. Silakan coba lagi dalam ${diff} detik.`);
        } else {
          localStorage.removeItem('rateLimitUntil');
          setIsRateLimited(false);
          setErrorMessage(null);
          setRemainingSeconds(0);
        }
      }
    };

    checkRateLimit();
    const timer = setInterval(checkRateLimit, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRateLimited) return;

    if (!captchaToken) {
      setErrorMessage('Silakan verifikasi CAPTCHA terlebih dahulu!');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Kirim captchaToken ke backend
      const res: any = await authService.login({ username, password, captchaToken });

      localStorage.removeItem('rateLimitUntil');
      localStorage.setItem('token', res.token);
      if (res.user) localStorage.setItem('user', JSON.stringify(res.user));

      document.cookie = `token=${res.token}; path=/; max-age=86400; SameSite=Lax`;

      const role = res.user?.role;
      if (role === 'admin') router.push('/admin/dashboard');
      else if (role === 'petugas') router.push('/petugas/dashboard');
      else router.push('/peminjam/dashboard');

    } catch (err: any) {
      const msg = err.message || 'Login gagal, periksa username dan password Anda';
      setErrorMessage(msg);

      // Reset Captcha jika login gagal
      recaptchaRef.current?.reset();
      setCaptchaToken(null);

      if (
        msg.toLowerCase().includes('tercapai') || 
        msg.toLowerCase().includes('terlalu banyak') || 
        msg.toLowerCase().includes('429') ||
        msg.toLowerCase().includes('limiter')
      ) {
        setIsRateLimited(true);
        const unlockTime = Date.now() + 15 * 60 * 1000;
        localStorage.setItem('rateLimitUntil', unlockTime.toString());
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 font-sans select-none">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-8 space-y-6">
        
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xl shadow-lg shadow-blue-500/25 mb-1">
            IC
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
            INVELA <span className="text-blue-600">CONTROL UKK</span>
          </h1>
          <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
            Sistem Inventaris & Akses Laboratorium
          </p>
        </div>

        {/* Banner Alert */}
        {errorMessage && (
          <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs font-medium transition-all ${
            isRateLimited 
              ? 'bg-rose-50 border-rose-200 text-rose-800' 
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${isRateLimited ? 'text-rose-600' : 'text-amber-600'}`} />
            <div>
              <p className="font-bold">{isRateLimited ? 'Akses Dibatasi Sementara' : 'Gagal Masuk'}</p>
              <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                disabled={isRateLimited}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 focus:outline-none transition-all placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                disabled={isRateLimited}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 focus:outline-none transition-all placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                disabled={isRateLimited}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Widget ReCAPTCHA */}
          <div className="flex justify-center pt-1">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
              onChange={(token) => setCaptchaToken(token)}
              onExpired={() => setCaptchaToken(null)}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || isRateLimited || !captchaToken}
            className="w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : isRateLimited ? (
              <span>Coba Lagi ({remainingSeconds}s)</span>
            ) : (
              <>
                <span>Masuk ke Sistem</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Link ke Halaman Login */}
        <div className="text-center pt-2">
          <p className="text-xs font-medium text-slate-500">
            Belum punya akun?{' '}
            <Link href="/auth/register" className="text-blue-600 font-bold hover:underline">
              Daftar di sini
            </Link>
          </p>
        </div>

        {/* Footer Info */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] font-medium text-slate-400">

          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>Akses Terenkripsi & Termonitor UKK</span>
        </div>

      </div>
    </div>
  );
}