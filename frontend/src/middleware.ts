import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // 1. Alias /login -> arahkan tampilan ke /auth/login tanpa ubah URL
  if (pathname === '/login') {
    return NextResponse.rewrite(new URL('/auth/login', request.url));
  }

  // 2. Proteksi Halaman Admin, Petugas, dan Peminjam
  const protectedRoutes = ['/admin', '/petugas', '/peminjam'];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/admin/:path*', '/petugas/:path*', '/peminjam/:path*'],
};
