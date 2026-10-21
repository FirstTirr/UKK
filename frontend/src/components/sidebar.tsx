"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Package, FolderTree, Users, 
  CheckCircle2, RotateCcw, PlusCircle, History,
  Handshake, Menu, X, LogOut, PanelLeftClose, PanelRightClose 
} from 'lucide-react';

interface SidebarContentProps {
  isMobile?: boolean;
  pathname: string;
  role: 'admin' | 'petugas' | 'peminjam';
  isSidebarOpen: boolean;
  setIsMobileOpen: (value: boolean) => void;
  setIsSidebarOpen: (value: boolean) => void;
  userData: { name: string; role: string; initials: string };
  handleLogout: (e?: React.MouseEvent) => void;
}

const SidebarContent = ({
  isMobile = false,
  pathname,
  role,
  setIsMobileOpen,
  setIsSidebarOpen,
  userData,
  handleLogout,
}: SidebarContentProps) => {
  const menuByRole = {
    admin: [
      { label: 'Dashboard Overview', href: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'Data Alat', href: '/admin/alat', icon: Package },
      { label: 'Data Kategori', href: '/admin/kategori', icon: FolderTree },
      { label: 'Data User', href: '/admin/user', icon: Users },
    ],
    petugas: [
      { label: 'Dashboard Overview', href: '/petugas/dashboard', icon: LayoutDashboard },
      { label: 'Validasi Pinjam', href: '/petugas/validasi', icon: CheckCircle2 },
      { label: 'Pengambilan Alat', href: '/petugas/pengambilan', icon: Handshake },
      { label: 'Pengembalian Alat', href: '/petugas/pengembalian', icon: RotateCcw },
    ],
    peminjam: [
      { label: 'Dashboard', href: '/peminjam/dashboard', icon: LayoutDashboard },
      { label: 'Pinjam Alat', href: '/peminjam/pinjam', icon: PlusCircle },
      { label: 'Riwayat Pinjam', href: '/peminjam/riwayat', icon: History },
    ],
  };

  const navItems = menuByRole[role] || [];

  return (
    <div className="flex flex-col h-full justify-between p-6 font-sans select-none overflow-hidden">
      <div className="flex flex-col min-h-0 flex-1">
        {/* Header Sidebar - Fixed Top */}
        <div className="flex items-center justify-between px-2 pb-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-500/20 shrink-0">
              IC
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-slate-900 uppercase leading-none">
                INVELA <span className="text-blue-600">CONTROL</span>
              </h2>
              <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase block mt-1">
                {role} console
              </span>
            </div>
          </div>

          {!isMobile && (
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              title="Tutup Sidebar"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <PanelLeftClose className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigasi Utama - Memiliki internal scroll tersendiri jika menu sangat banyak */}
        <nav className="space-y-1.5 pt-6 overflow-y-auto flex-1 pr-1 custom-scrollbar">
          <p className="px-3 text-[11px] font-bold text-slate-400 tracking-widest uppercase mb-3">
            Menu Utama
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Profile & Logout Section - Fixed Bottom */}
      <div className="border-t border-slate-200 pt-4 mt-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center font-black text-sm text-blue-600 shrink-0">
            {userData.initials}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-slate-900 leading-tight truncate">
              {userData.name}
            </h4>
            <span className="text-xs font-semibold text-slate-400 block truncate">
              {userData.role}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          title="Keluar dari Akun"
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default function Sidebar({
  children,
  role = 'admin',
}: {
  children?: React.ReactNode;
  role?: 'admin' | 'petugas' | 'peminjam';
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [userData, setUserData] = useState({
    name: 'User',
    role: role.toUpperCase(),
    initials: 'US',
  });

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const name = user.nama_user || user.username || 'User';
        const userRole = (user.role || role).toUpperCase();
        const initials = name.slice(0, 2).toUpperCase();
        setUserData({ name: `@${name}`, role: userRole, initials });
      }
    } catch (e) {
      console.error('Gagal membaca data user:', e);
    }
  }, [role]);

  const handleLogout = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!window.confirm('Apakah Anda yakin ingin keluar dari sistem?')) return;

    localStorage.clear();
    sessionStorage.clear();
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    router.push('/auth/login');
  };

  const sidebarProps = {
    pathname,
    role,
    isSidebarOpen,
    setIsMobileOpen,
    setIsSidebarOpen,
    userData,
    handleLogout,
  };

  return (
    <div className="h-screen w-full bg-slate-50 flex text-slate-800 antialiased tracking-tight relative overflow-hidden">
      {/* Sidebar Desktop - Fixed Screen Height & Overflow Hidden */}
      <aside
        className={`hidden lg:block bg-white border-r border-slate-200 shrink-0 h-screen sticky top-0 overflow-hidden transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-72 opacity-100' : 'w-0 opacity-0 border-none'
        }`}
      >
        <div className="w-72 h-full">
          <SidebarContent {...sidebarProps} isMobile={false} />
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative">
        {/* Tombol Buka Sidebar Desktop */}
        {!isSidebarOpen && (
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            title="Buka Sidebar"
            className="hidden lg:flex fixed top-5 left-5 z-40 p-2.5 bg-white border border-slate-200 shadow-md rounded-xl text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-all cursor-pointer items-center justify-center"
          >
            <PanelRightClose className="w-5 h-5" />
          </button>
        )}

        {/* Header Mobile */}
        <header className="lg:hidden w-full bg-white border-b border-slate-200 px-5 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">
              IC
            </div>
            <h2 className="text-sm font-black tracking-tight text-slate-900 uppercase">
              INVELA <span className="text-blue-600">CONTROL</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 transition-all cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {/* Modal Drawer Mobile */}
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            />
            <div className="relative w-72 max-w-sm bg-white h-full flex flex-col shadow-2xl z-10">
              <div className="absolute top-4 right-4 z-20">
                <button
                  type="button"
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto pt-4">
                <SidebarContent {...sidebarProps} isMobile={true} />
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area - Memiliki Scroll Area Sendiri */}
        <main className="flex-1 p-5 sm:p-8 md:p-10 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}