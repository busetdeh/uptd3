'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { setClientAuth, getClientAuth } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = React.useState('operator.keuangan');
  const [password, setPassword] = React.useState('password123');
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(true);
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  React.useEffect(() => {
    // If already logged in, go directly to dashboard
    const existing = getClientAuth();
    if (existing) {
      router.push('/');
      return;
    }

    const isDark = document.documentElement.classList.contains('dark') ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDark) {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }
  }, [router]);

  const toggleDarkMode = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    // Save auth session
    setClientAuth(username.trim(), 'operator');

    // Redirect to dashboard
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-light-surface text-light-on-surface dark:bg-dark-surface dark:text-dark-on-surface font-body antialiased flex flex-col justify-between transition-colors">
      
      {/* Header */}
      <header className="w-full px-gutter-md sm:px-gutter-lg py-gutter-md flex items-center justify-between">
        <div className="flex items-center gap-gutter-sm">
          <div className="w-8 h-8 rounded bg-light-primary text-light-on-primary dark:bg-dark-primary dark:text-dark-on-primary flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-title-md" aria-hidden="true">account_balance</span>
          </div>
          <div>
            <span className="font-headline text-title-md text-light-on-surface dark:text-dark-on-surface block leading-tight">
              SIP-Pendapatan UPTD
            </span>
            <span className="font-body text-[11px] text-light-on-surface-variant dark:text-dark-on-surface-variant block">
              UPTD Pendapatan Daerah
            </span>
          </div>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          type="button"
          aria-label="Ubah tema terang atau gelap"
          className="inline-flex items-center justify-center p-gutter-xs sm:p-gutter-sm rounded bg-light-surface-container-lowest text-light-on-surface-variant border border-light-outline-variant hover:bg-light-surface-container-low dark:bg-dark-surface-container-low dark:text-dark-on-surface-variant dark:border-dark-outline-variant dark:hover:bg-dark-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-title-md sm:text-headline-md" aria-hidden="true">
            {isDarkMode ? 'light_mode' : 'dark_mode'}
          </span>
        </button>
      </header>

      {/* Login Card */}
      <main className="w-full max-w-md mx-auto px-gutter-md py-gutter-lg flex-1 flex flex-col justify-center">
        <div className="w-full bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant rounded-lg p-gutter-lg sm:p-gutter-xl shadow-lg flex flex-col gap-gutter-lg">
          
          <div className="text-center flex flex-col gap-gutter-xs">
            <div className="inline-flex self-center items-center justify-center w-12 h-12 rounded-full bg-light-secondary-container text-light-on-secondary-container dark:bg-dark-secondary-container dark:text-dark-on-secondary-container mb-gutter-xs">
              <span className="material-symbols-outlined text-headline-lg" aria-hidden="true">lock</span>
            </div>
            <h1 className="font-headline text-headline-md sm:text-headline-lg text-light-on-surface dark:text-dark-on-surface">
              Masuk ke Sistem
            </h1>
            <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Silakan masukkan kredensial akun Anda untuk mengakses rekapitulasi pendapatan.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-gutter-md">
            
            {/* Username / NIP */}
            <div className="flex flex-col gap-gutter-xs">
              <label htmlFor="username" className="font-label text-label-md text-light-on-surface dark:text-dark-on-surface">
                NIP / Nama Pengguna
              </label>
              <div className="relative">
                <span className="material-symbols-outlined text-title-md text-light-outline dark:text-dark-outline absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true">
                  badge
                </span>
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: 198503152010011002"
                  className="w-full pl-10 pr-gutter-md py-2.5 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface dark:bg-dark-surface text-light-on-surface dark:text-dark-on-surface font-body text-body-md focus:outline-none focus:ring-2 focus:ring-indigo transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-gutter-xs">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="font-label text-label-md text-light-on-surface dark:text-dark-on-surface">
                  Kata Sandi
                </label>
                <a href="#" className="font-label text-label-sm text-light-tertiary dark:text-dark-tertiary hover:underline">
                  Lupa sandi?
                </a>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined text-title-md text-light-outline dark:text-dark-outline absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true">
                  key
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface dark:bg-dark-surface text-light-on-surface dark:text-dark-on-surface font-body text-body-md focus:outline-none focus:ring-2 focus:ring-indigo transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Tampilkan atau sembunyikan kata sandi"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-light-outline dark:text-dark-outline hover:text-light-on-surface dark:hover:text-dark-on-surface p-1"
                >
                  <span className="material-symbols-outlined text-title-md" aria-hidden="true">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between gap-gutter-sm pt-gutter-xs">
              <label className="inline-flex items-center gap-gutter-xs cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-light-outline-variant dark:border-dark-outline-variant text-light-secondary focus:ring-indigo"
                />
                <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                  Ingat sesi saya
                </span>
              </label>
              <span className="inline-flex items-center gap-gutter-xs px-2 py-0.5 rounded-full bg-light-surface-container dark:bg-dark-surface-container font-label text-[11px] text-light-on-surface-variant dark:text-dark-on-surface-variant">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald"></span>
                Server Siap
              </span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full mt-gutter-xs py-3 px-gutter-md rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container dark:bg-dark-primary dark:text-dark-on-primary font-label text-label-lg flex items-center justify-center gap-gutter-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo active:scale-[0.99]"
            >
              <span>Masuk ke Dasbor</span>
              <span className="material-symbols-outlined text-title-md" aria-hidden="true">arrow_forward</span>
            </button>

          </form>

          {/* Quick Demo Login Switcher */}
          <div className="pt-gutter-md border-t border-light-outline-variant dark:border-dark-outline-variant flex flex-col gap-gutter-xs text-center">
            <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Akun Uji Coba Cepat (Demo):
            </span>
            <div className="flex flex-wrap items-center justify-center gap-gutter-xs">
              {['operator.keuangan', 'kepala.uptd', 'auditor.daerah'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setUsername(role)}
                  className="px-gutter-sm py-1 rounded bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant font-label text-[11px] text-light-on-surface dark:text-dark-on-surface hover:border-indigo transition-colors"
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

        </div>
      </main>

      <footer className="w-full px-gutter-md py-gutter-md text-center">
        <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
          &copy; 2026 SIP-Pendapatan UPTD · Pemerintah Daerah
        </p>
      </footer>

    </div>
  );
}
