'use client';

import React from 'react';
import { FilterState, TimeFilterMode } from '@/lib/types';

interface DateRangeFilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  totalTransactions: number;
}

export default function DateRangeFilterBar({
  filters,
  onFilterChange,
  totalTransactions,
}: DateRangeFilterBarProps) {
  const [startDate, setStartDate] = React.useState<string>(
    filters.startDate || '2026-11-01'
  );
  const [endDate, setEndDate] = React.useState<string>(
    filters.endDate || '2026-11-25'
  );
  const [singleDate, setSingleDate] = React.useState<string>(
    filters.singleDate || '2026-11-20'
  );

  // Sync internal state when parent filters change
  React.useEffect(() => {
    if (filters.startDate) setStartDate(filters.startDate);
    if (filters.endDate) setEndDate(filters.endDate);
    if (filters.singleDate) setSingleDate(filters.singleDate);
  }, [filters.startDate, filters.endDate, filters.singleDate]);

  const handleModeChange = (mode: TimeFilterMode) => {
    if (mode === 'kustom') {
      onFilterChange({
        mode: 'kustom',
        startDate: startDate || '2026-11-01',
        endDate: endDate || '2026-11-25',
      });
    } else if (mode === 'harian') {
      onFilterChange({
        mode: 'harian',
        singleDate: singleDate || '2026-11-20',
      });
    } else if (mode === 'bulanan') {
      onFilterChange({
        mode: 'bulanan',
        year: 2026,
        month: 11,
        startDate: undefined,
        endDate: undefined,
        singleDate: undefined,
      });
    } else if (mode === 'tahunan') {
      onFilterChange({
        mode: 'tahunan',
        year: 2026,
        startDate: undefined,
        endDate: undefined,
        singleDate: undefined,
      });
    }
  };

  const handleApplyCustom = () => {
    if (startDate && endDate && startDate > endDate) {
      alert('Tanggal Mulai tidak boleh lebih besar dari Tanggal Akhir.');
      return;
    }
    onFilterChange({
      mode: 'kustom',
      startDate,
      endDate,
    });
  };

  const handleQuickPreset = (preset: '7days' | 'month' | 'all') => {
    if (preset === '7days') {
      const start = '2026-11-14';
      const end = '2026-11-20';
      setStartDate(start);
      setEndDate(end);
      onFilterChange({
        mode: 'kustom',
        startDate: start,
        endDate: end,
      });
    } else if (preset === 'month') {
      const start = '2026-11-01';
      const end = '2026-11-30';
      setStartDate(start);
      setEndDate(end);
      onFilterChange({
        mode: 'kustom',
        startDate: start,
        endDate: end,
      });
    } else if (preset === 'all') {
      const start = '2026-01-01';
      const end = '2028-12-31';
      setStartDate(start);
      setEndDate(end);
      onFilterChange({
        mode: 'kustom',
        startDate: start,
        endDate: end,
      });
    }
  };

  const handleResetToMonthly = () => {
    onFilterChange({
      mode: 'bulanan',
      year: 2026,
      month: 11,
      startDate: undefined,
      endDate: undefined,
      singleDate: undefined,
    });
  };

  return (
    <section
      aria-label="Filter Periode dan Rentang Tanggal"
      className="w-full bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-gutter-sm sm:p-gutter-md shadow-sm transition-colors flex flex-col gap-gutter-sm"
    >
      {/* Top Row: Mode Switcher & Summary Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-gutter-sm">
        
        {/* Left: Filter Modes */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="font-label text-label-xs sm:text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant font-semibold uppercase tracking-wider flex-shrink-0 mr-1 hidden sm:inline">
            Mode Filter:
          </span>

          <button
            type="button"
            onClick={() => handleModeChange('bulanan')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-label text-label-xs sm:text-label-sm transition-all flex-shrink-0 ${
              filters.mode === 'bulanan'
                ? 'bg-light-primary text-light-on-primary dark:bg-dark-primary dark:text-dark-on-primary font-semibold shadow-sm'
                : 'bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface-variant hover:text-light-on-surface hover:border-indigo border border-light-outline-variant dark:border-dark-outline-variant'
            }`}
          >
            <span className="material-symbols-outlined text-sm" aria-hidden="true">calendar_month</span>
            <span>Bulan (Nov 2026)</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('kustom')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-label text-label-xs sm:text-label-sm transition-all flex-shrink-0 ${
              filters.mode === 'kustom'
                ? 'bg-light-primary text-light-on-primary dark:bg-dark-primary dark:text-dark-on-primary font-semibold shadow-sm'
                : 'bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface-variant hover:text-light-on-surface hover:border-indigo border border-light-outline-variant dark:border-dark-outline-variant'
            }`}
          >
            <span className="material-symbols-outlined text-sm text-amber" aria-hidden="true">date_range</span>
            <span>Rentang Kustom (Start – End)</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('harian')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-label text-label-xs sm:text-label-sm transition-all flex-shrink-0 ${
              filters.mode === 'harian'
                ? 'bg-light-primary text-light-on-primary dark:bg-dark-primary dark:text-dark-on-primary font-semibold shadow-sm'
                : 'bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface-variant hover:text-light-on-surface hover:border-indigo border border-light-outline-variant dark:border-dark-outline-variant'
            }`}
          >
            <span className="material-symbols-outlined text-sm" aria-hidden="true">today</span>
            <span>Harian</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('tahunan')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-label text-label-xs sm:text-label-sm transition-all flex-shrink-0 ${
              filters.mode === 'tahunan'
                ? 'bg-light-primary text-light-on-primary dark:bg-dark-primary dark:text-dark-on-primary font-semibold shadow-sm'
                : 'bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface-variant hover:text-light-on-surface hover:border-indigo border border-light-outline-variant dark:border-dark-outline-variant'
            }`}
          >
            <span className="material-symbols-outlined text-sm" aria-hidden="true">event_repeat</span>
            <span>Tahun (2026)</span>
          </button>
        </div>

        {/* Right: Active Match Count Badge */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant font-label text-label-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald"></span>
            <span>{totalTransactions} Transaksi Tersaring</span>
          </span>

          {filters.mode !== 'bulanan' && (
            <button
              type="button"
              onClick={handleResetToMonthly}
              className="inline-flex items-center gap-1 px-2 py-1 rounded font-label text-label-xs text-light-tertiary dark:text-dark-tertiary hover:underline"
              title="Kembali ke filter default Bulanan (Nov 2026)"
            >
              <span className="material-symbols-outlined text-xs" aria-hidden="true">restart_alt</span>
              <span>Reset</span>
            </button>
          )}
        </div>

      </div>

      {/* Custom Date Range Panel (Expanded when in 'kustom' mode, or always accessible) */}
      {filters.mode === 'kustom' && (
        <div className="pt-gutter-xs border-t border-light-outline-variant dark:border-dark-outline-variant flex flex-col lg:flex-row lg:items-center justify-between gap-gutter-sm animate-in fade-in duration-150">
          
          {/* Date Range Pickers (Start - End) */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-gutter-sm flex-1">
            
            {/* Start Date */}
            <div className="flex items-center gap-1.5 flex-1 min-w-[140px]">
              <label htmlFor="dashboard-start-date" className="font-label text-label-xs sm:text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant flex-shrink-0 font-medium">
                Mulai:
              </label>
              <div className="relative flex-1">
                <input
                  id="dashboard-start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-2.5 pr-2 py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface dark:bg-dark-surface text-light-on-surface dark:text-dark-on-surface font-body text-body-xs sm:text-body-sm focus:outline-none focus:ring-2 focus:ring-indigo transition-colors"
                />
              </div>
            </div>

            <span className="text-light-on-surface-variant dark:text-dark-on-surface-variant font-label text-xs sm:text-sm font-semibold flex-shrink-0">
              s/d
            </span>

            {/* End Date */}
            <div className="flex items-center gap-1.5 flex-1 min-w-[140px]">
              <label htmlFor="dashboard-end-date" className="font-label text-label-xs sm:text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant flex-shrink-0 font-medium">
                Selesai:
              </label>
              <div className="relative flex-1">
                <input
                  id="dashboard-end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-2.5 pr-2 py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface dark:bg-dark-surface text-light-on-surface dark:text-dark-on-surface font-body text-body-xs sm:text-body-sm focus:outline-none focus:ring-2 focus:ring-indigo transition-colors"
                />
              </div>
            </div>

            {/* Apply Button */}
            <button
              type="button"
              onClick={handleApplyCustom}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-light-secondary text-light-on-secondary dark:bg-dark-secondary dark:text-dark-on-secondary font-label text-label-xs sm:text-label-sm font-semibold shadow-sm hover:opacity-90 active:scale-95 transition-all flex-shrink-0"
            >
              <span className="material-symbols-outlined text-sm" aria-hidden="true">check</span>
              <span>Terapkan</span>
            </button>

          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 flex-wrap flex-shrink-0">
            <span className="font-label text-[11px] text-light-on-surface-variant dark:text-dark-on-surface-variant mr-1">
              Pilihan Cepat:
            </span>
            <button
              type="button"
              onClick={() => handleQuickPreset('7days')}
              className="px-2.5 py-1 rounded bg-light-surface-container-low dark:bg-dark-surface-container hover:border-indigo border border-light-outline-variant dark:border-dark-outline-variant font-label text-label-xs text-light-on-surface dark:text-dark-on-surface transition-colors"
            >
              7 Hari Terakhir
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('month')}
              className="px-2.5 py-1 rounded bg-light-surface-container-low dark:bg-dark-surface-container hover:border-indigo border border-light-outline-variant dark:border-dark-outline-variant font-label text-label-xs text-light-on-surface dark:text-dark-on-surface transition-colors"
            >
              Bulan Ini
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('all')}
              className="px-2.5 py-1 rounded bg-light-surface-container-low dark:bg-dark-surface-container hover:border-indigo border border-light-outline-variant dark:border-dark-outline-variant font-label text-label-xs text-light-on-surface dark:text-dark-on-surface transition-colors"
            >
              Semua Periode
            </button>
          </div>

        </div>
      )}

      {/* Daily Mode Panel */}
      {filters.mode === 'harian' && (
        <div className="pt-gutter-xs border-t border-light-outline-variant dark:border-dark-outline-variant flex items-center gap-3 animate-in fade-in duration-150">
          <label htmlFor="dashboard-single-date" className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant font-medium">
            Pilih Tanggal Hari:
          </label>
          <input
            id="dashboard-single-date"
            type="date"
            value={singleDate}
            onChange={(e) => {
              setSingleDate(e.target.value);
              onFilterChange({ mode: 'harian', singleDate: e.target.value });
            }}
            className="px-3 py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface dark:bg-dark-surface text-light-on-surface dark:text-dark-on-surface font-body text-body-sm focus:outline-none focus:ring-2 focus:ring-indigo transition-colors"
          />
        </div>
      )}

    </section>
  );
}
