'use client';

import React from 'react';
import Link from 'next/link';
import { FilterState } from '@/lib/types';
import DateFilterPopover from './DateFilterPopover';

interface HeaderProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onOpenImportModal: () => void;
  onExportData: () => void;
  isAutosyncing?: boolean;
  isRealtimeConnected?: boolean;
  isLoggedIn?: boolean;
  username?: string;
  role?: string;
  onLogout?: () => void;
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function Header({
  filters,
  onFilterChange,
  onOpenImportModal,
  onExportData,
  isAutosyncing = false,
  isRealtimeConnected = false,
  isLoggedIn = false,
  username,
  role,
  onLogout,
}: HeaderProps) {
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);

  React.useEffect(() => {
    // Check initial dark mode from DOM or localStorage
    const isDark = document.documentElement.classList.contains('dark') ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDark) {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }
  }, []);

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

  const getActiveFilterLabel = () => {
    if (filters.mode === 'harian') {
      return filters.singleDate ? `Tgl: ${filters.singleDate}` : 'Hari Ini';
    }
    if (filters.mode === 'bulanan') {
      return `${MONTH_NAMES[filters.month - 1]} ${filters.year}`;
    }
    if (filters.mode === 'tahunan') {
      return `Tahun ${filters.year}`;
    }
    if (filters.mode === 'kustom') {
      return `${filters.startDate || 'Awal'} s/d ${filters.endDate || 'Akhir'}`;
    }
    return `Tahun ${filters.year} - ${MONTH_NAMES[filters.month - 1]}`;
  };

  return (
    <header className="sticky top-0 z-30 bg-light-surface-container-lowest dark:bg-dark-surface-container-low border-b border-light-outline-variant dark:border-dark-outline-variant shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-gutter-md lg:px-gutter-lg py-gutter-sm lg:py-gutter-md flex flex-col md:flex-row md:items-center md:justify-between gap-gutter-sm md:gap-gutter-md">
        
        {/* Brand & Status */}
        <div className="flex items-center justify-between gap-gutter-sm md:gap-gutter-md">
          <div className="flex items-center gap-gutter-sm">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded bg-light-primary text-light-on-primary dark:bg-dark-primary dark:text-dark-on-primary flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-title-md sm:text-headline-md" aria-hidden="true">account_balance</span>
            </div>
            <div>
              <span className="font-headline text-title-md text-light-on-surface dark:text-dark-on-surface block leading-tight">
                SIP-Pendapatan UPTD
              </span>
              <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant hidden sm:block">
                UPTD Pendapatan Daerah
              </span>
              <div className="flex sm:hidden items-center gap-gutter-xs">
                <span className={`w-2 h-2 rounded-full ${isAutosyncing ? 'bg-amber animate-pulse' : 'bg-emerald'}`} aria-hidden="true"></span>
                <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                  {isAutosyncing ? 'Syncing...' : isRealtimeConnected ? 'Supabase: Live' : 'Autosync: Active'}
                </span>
              </div>
            </div>
          </div>

          {/* Autosync Status Badge (Desktop) */}
          <div className="hidden sm:flex items-center gap-gutter-xs px-gutter-sm py-gutter-xs rounded-full bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant">
            <span className={`w-2 h-2 rounded-full ${isAutosyncing ? 'bg-amber animate-pulse' : 'bg-emerald'}`} aria-hidden="true"></span>
            <span className="font-label text-label-md text-light-on-surface dark:text-dark-on-surface">
              {isAutosyncing ? 'Menyinkronkan...' : isRealtimeConnected ? 'Supabase Realtime: Active' : 'Autosync: Active'}
            </span>
          </div>

          {/* Mobile Right Controls: Dark Mode & Auth */}
          <div className="flex md:hidden items-center gap-gutter-xs">
            <button
              onClick={toggleDarkMode}
              type="button"
              aria-label="Ubah tema terang atau gelap"
              className="inline-flex items-center justify-center p-gutter-xs rounded bg-light-surface-container-lowest text-light-on-surface-variant border border-light-outline-variant hover:bg-light-surface-container-low dark:bg-dark-surface-container-low dark:text-dark-on-surface-variant dark:border-dark-outline-variant dark:hover:bg-dark-surface-container"
            >
              <span className="material-symbols-outlined text-title-md" aria-hidden="true">
                {isDarkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
            {isLoggedIn ? (
              <button
                onClick={onLogout}
                type="button"
                title="Keluar / Logout"
                className="inline-flex items-center justify-center p-gutter-xs rounded bg-light-surface-container-lowest text-light-on-surface-variant border border-light-outline-variant hover:bg-light-surface-container-low dark:bg-dark-surface-container-low dark:text-dark-on-surface-variant dark:border-dark-outline-variant dark:hover:bg-dark-surface-container"
              >
                <span className="material-symbols-outlined text-title-md" aria-hidden="true">logout</span>
              </button>
            ) : (
              <Link
                href="/login"
                title="Masuk / Login"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-light-primary text-light-on-primary dark:bg-dark-primary dark:text-dark-on-primary font-label text-xs font-semibold"
              >
                <span className="material-symbols-outlined text-sm" aria-hidden="true">login</span>
                <span>Masuk</span>
              </Link>
            )}
          </div>
        </div>

        {/* Desktop Global Action Group (Hidden on Mobile) */}
        <div className="hidden md:flex items-center justify-end gap-gutter-xs sm:gap-gutter-sm relative">
          
          {/* Interactive Date Filter Pill */}
          <div className="relative flex-1 md:flex-initial">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              type="button"
              className="w-full md:w-auto inline-flex items-center justify-between md:justify-start gap-gutter-xs sm:gap-gutter-sm px-gutter-sm sm:px-gutter-md py-gutter-xs sm:py-gutter-sm rounded-full bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant text-light-on-surface dark:text-dark-on-surface hover:border-indigo transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo"
            >
              <span className="inline-flex items-center gap-gutter-xs sm:gap-gutter-sm">
                <span className="material-symbols-outlined text-body-md sm:text-title-md text-light-tertiary dark:text-dark-tertiary" aria-hidden="true">calendar_month</span>
                <span className="font-label text-label-sm sm:text-label-md">
                  {getActiveFilterLabel()}
                </span>
              </span>
              <span className="material-symbols-outlined text-body-md sm:text-title-md text-light-on-surface-variant dark:text-dark-on-surface-variant" aria-hidden="true">expand_more</span>
            </button>

            {/* Filter Popover Dropdown (Desktop Top Placement) */}
            {isFilterOpen && (
              <DateFilterPopover
                filters={filters}
                placement="top"
                onApply={(newFilters) => {
                  onFilterChange(newFilters);
                  setIsFilterOpen(false);
                }}
                onClose={() => setIsFilterOpen(false)}
              />
            )}
          </div>

          {/* Desktop Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            type="button"
            aria-label="Ubah tema terang atau gelap"
            className="hidden md:inline-flex items-center justify-center p-gutter-sm rounded bg-light-surface-container-lowest text-light-on-surface-variant border border-light-outline-variant hover:bg-light-surface-container-low dark:bg-dark-surface-container-low dark:text-dark-on-surface-variant dark:border-dark-outline-variant dark:hover:bg-dark-surface-container transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo"
          >
            <span className="material-symbols-outlined text-headline-md" aria-hidden="true">
              {isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* Export PDF/Excel */}
          <button
            onClick={onExportData}
            type="button"
            className="inline-flex items-center justify-center gap-gutter-xs sm:gap-gutter-sm px-gutter-sm sm:px-gutter-md py-gutter-xs sm:py-gutter-sm rounded bg-light-surface-container-lowest text-light-on-surface border border-light-outline-variant hover:bg-light-surface-container-low dark:bg-dark-surface-container-low dark:text-dark-on-surface dark:border-dark-outline-variant dark:hover:bg-dark-surface-container transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo"
          >
            <span className="material-symbols-outlined text-body-md sm:text-title-md" aria-hidden="true">download</span>
            <span className="font-label text-label-sm sm:text-label-lg">
              <span className="inline sm:hidden">Export</span>
              <span className="hidden sm:inline">Export CSV</span>
            </span>
          </button>

          {/* + Import CSV Button */}
          {isLoggedIn ? (
            <button
              onClick={onOpenImportModal}
              type="button"
              className="inline-flex items-center justify-center gap-gutter-xs sm:gap-gutter-sm px-gutter-sm sm:px-gutter-md py-gutter-xs sm:py-gutter-sm rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container dark:bg-dark-primary dark:text-dark-on-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo whitespace-nowrap shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-body-md sm:text-title-md" aria-hidden="true">upload_file</span>
              <span className="font-label text-label-sm sm:text-label-lg">+ Import CSV</span>
            </button>
          ) : (
            <Link
              href="/login"
              title="Masuk untuk mengimpor berkas CSV"
              className="inline-flex items-center justify-center gap-gutter-xs sm:gap-gutter-sm px-gutter-sm sm:px-gutter-md py-gutter-xs sm:py-gutter-sm rounded bg-light-surface-container-low text-light-on-surface-variant hover:border-indigo border border-light-outline-variant dark:bg-dark-surface-container dark:text-dark-on-surface-variant transition-colors whitespace-nowrap shadow-sm text-label-sm sm:text-label-lg"
            >
              <span className="material-symbols-outlined text-body-md text-amber" aria-hidden="true">lock</span>
              <span className="font-label text-label-sm sm:text-label-lg">+ Import CSV</span>
            </Link>
          )}

          {/* Desktop Auth Section */}
          {isLoggedIn ? (
            <div className="hidden md:flex items-center gap-2 pl-2 border-l border-light-outline-variant dark:border-dark-outline-variant">
              <div className="hidden lg:flex flex-col text-right">
                <span className="font-label text-label-xs text-light-on-surface dark:text-dark-on-surface font-semibold truncate max-w-[140px]" title={username}>
                  {username || 'Operator'}
                </span>
                <span className={`text-[10px] font-semibold uppercase tracking-wider leading-none ${role === 'admin' ? 'text-amber font-bold' : 'text-light-on-surface-variant dark:text-dark-on-surface-variant'}`}>
                  {role === 'admin' ? 'ADMIN' : 'PETUGAS'}
                </span>
              </div>
              <button
                onClick={onLogout}
                type="button"
                title="Keluar / Logout"
                className="inline-flex items-center justify-center p-gutter-sm rounded bg-light-surface-container-lowest text-light-on-surface-variant border border-light-outline-variant hover:bg-light-error-container hover:text-light-error dark:bg-dark-surface-container-low dark:text-dark-on-surface-variant dark:border-dark-outline-variant dark:hover:bg-dark-error-container/30 dark:hover:text-dark-error transition-colors"
              >
                <span className="material-symbols-outlined text-headline-md" aria-hidden="true">logout</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              title="Masuk ke Akun Petugas"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded bg-light-primary text-light-on-primary dark:bg-dark-primary dark:text-dark-on-primary font-label text-label-sm font-semibold hover:opacity-90 shadow-sm transition-opacity"
            >
              <span className="material-symbols-outlined text-body-md" aria-hidden="true">login</span>
              <span>Masuk</span>
            </Link>
          )}

        </div>
      </div>

      {/* Mobile Floating Bottom Bar */}
      <nav
        aria-label="Navigasi Aksi Mobile"
        className="md:hidden fixed bottom-4 inset-x-3 z-40 max-w-md mx-auto bg-light-surface-container-lowest/95 dark:bg-dark-surface-container-low/95 backdrop-blur-lg border border-light-outline-variant/80 dark:border-dark-outline-variant/80 rounded-full shadow-2xl p-1.5 flex items-center justify-between gap-1.5 transition-all"
      >
        {/* 1. Date Filter Trigger Button */}
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          type="button"
          aria-label="Filter Periode Tanggal"
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface font-label text-label-xs truncate hover:border-indigo transition-colors min-w-0"
        >
          <span className="material-symbols-outlined text-base text-indigo flex-shrink-0" aria-hidden="true">
            calendar_month
          </span>
          <span className="truncate max-w-[120px] font-medium">
            {getActiveFilterLabel()}
          </span>
          <span className="material-symbols-outlined text-sm opacity-60 flex-shrink-0" aria-hidden="true">
            {isFilterOpen ? 'expand_less' : 'expand_more'}
          </span>
        </button>

        {/* 2. Export Button */}
        <button
          onClick={onExportData}
          type="button"
          aria-label="Export Data CSV"
          className="flex items-center justify-center gap-1 px-3 py-2 rounded-full bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface font-label text-label-xs flex-shrink-0 hover:bg-light-surface-container dark:hover:bg-dark-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-base" aria-hidden="true">download</span>
          <span>Export</span>
        </button>

        {/* 3. + Import CSV Button (Primary Action) */}
        {isLoggedIn ? (
          <button
            onClick={onOpenImportModal}
            type="button"
            aria-label="Import Berkas CSV"
            className="flex items-center justify-center gap-1 px-3.5 py-2 rounded-full bg-light-primary text-light-on-primary dark:bg-dark-primary dark:text-dark-on-primary font-label text-label-xs font-semibold shadow-md active:scale-95 transition-all flex-shrink-0"
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true">upload_file</span>
            <span>+ Import</span>
          </button>
        ) : (
          <Link
            href="/login"
            aria-label="Masuk untuk import CSV"
            className="flex items-center justify-center gap-1 px-3 py-2 rounded-full bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface-variant dark:text-dark-on-surface-variant border border-light-outline-variant dark:border-dark-outline-variant font-label text-label-xs font-medium flex-shrink-0"
            title="Masuk untuk import CSV"
          >
            <span className="material-symbols-outlined text-base text-amber" aria-hidden="true">lock</span>
            <span>+ Import</span>
          </Link>
        )}
      </nav>

      {/* Popover on Mobile (when opened from floating bottom bar) */}
      {isFilterOpen && (
        <div className="md:hidden">
          <DateFilterPopover
            filters={filters}
            placement="bottom"
            onApply={(newFilters) => {
              onFilterChange(newFilters);
              setIsFilterOpen(false);
            }}
            onClose={() => setIsFilterOpen(false)}
          />
        </div>
      )}
    </header>
  );
}
