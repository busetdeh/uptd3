'use client';

import React from 'react';
import { FilterState, TimeFilterMode } from '@/lib/types';

interface DateFilterPopoverProps {
  filters: FilterState;
  onApply: (newFilters: Partial<FilterState>) => void;
  onClose: () => void;
  placement?: 'top' | 'bottom';
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

export default function DateFilterPopover({
  filters,
  onApply,
  onClose,
  placement = 'top',
}: DateFilterPopoverProps) {
  const [activeTab, setActiveTab] = React.useState<TimeFilterMode>(filters.mode);
  const [selectedYear, setSelectedYear] = React.useState<number>(filters.year);
  const [selectedMonth, setSelectedMonth] = React.useState<number>(filters.month);
  const [singleDate, setSingleDate] = React.useState<string>(filters.singleDate || '2026-11-25');
  const [startDate, setStartDate] = React.useState<string>(filters.startDate || '2026-11-01');
  const [endDate, setEndDate] = React.useState<string>(filters.endDate || '2026-11-25');

  // Synchronize when filters prop changes
  React.useEffect(() => {
    setActiveTab(filters.mode);
    if (filters.year) setSelectedYear(filters.year);
    if (filters.month) setSelectedMonth(filters.month);
    if (filters.singleDate) setSingleDate(filters.singleDate);
    if (filters.startDate) setStartDate(filters.startDate);
    if (filters.endDate) setEndDate(filters.endDate);
  }, [filters]);

  const handleApply = () => {
    onApply({
      mode: activeTab,
      year: selectedYear,
      month: selectedMonth,
      singleDate: activeTab === 'harian' ? singleDate : undefined,
      startDate: activeTab === 'kustom' ? startDate : undefined,
      endDate: activeTab === 'kustom' ? endDate : undefined,
    });
  };

  const handleReset = () => {
    setActiveTab('bulanan');
    setSelectedYear(2026);
    setSelectedMonth(11);
    setSingleDate('2026-11-25');
    setStartDate('2026-11-01');
    setEndDate('2026-11-25');
    onApply({
      mode: 'bulanan',
      year: 2026,
      month: 11,
      singleDate: undefined,
      startDate: undefined,
      endDate: undefined,
    });
  };

  return (
    <>
      {/* Backdrop overlay to close on outside click */}
      <div
        className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={`z-50 rounded-md bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant shadow-2xl p-gutter-md sm:p-gutter-lg animate-in fade-in duration-100 ${
          placement === 'bottom'
            ? 'fixed left-3 right-3 bottom-20 sm:left-auto sm:right-6 sm:bottom-20 w-auto sm:w-[500px] zoom-in-95'
            : 'absolute left-0 right-0 md:left-auto md:right-0 top-full mt-gutter-sm w-full md:w-[540px] zoom-in-95'
        }`}
      >
      
      {/* Segmented Mode Tabs */}
      <div className="grid grid-cols-4 gap-gutter-xs p-gutter-xs rounded bg-light-surface-container-low dark:bg-dark-surface-container mb-gutter-md">
        {(['harian', 'bulanan', 'tahunan', 'kustom'] as TimeFilterMode[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`py-gutter-xs rounded-sm font-label text-label-sm sm:text-label-md capitalize transition-colors ${
              activeTab === tab
                ? 'bg-light-surface-container-lowest dark:bg-dark-surface-container-high text-light-on-surface dark:text-dark-on-surface shadow-sm'
                : 'text-light-on-surface-variant dark:text-dark-on-surface-variant hover:text-light-on-surface'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Panel: Bulanan */}
      {activeTab === 'bulanan' && (
        <div className="space-y-gutter-md">
          <div className="flex items-center justify-between">
            <span className="font-label text-label-sm sm:text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Pilih Tahun &amp; Bulan
            </span>
            <div className="flex items-center gap-gutter-xs">
              {[2024, 2025, 2026].map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setSelectedYear(yr)}
                  className={`px-gutter-sm py-gutter-xs rounded font-label text-label-sm sm:text-label-md transition-colors ${
                    selectedYear === yr
                      ? 'bg-light-primary text-light-on-primary dark:bg-dark-primary dark:text-dark-on-primary'
                      : 'border border-light-outline-variant dark:border-dark-outline-variant text-light-on-surface-variant'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-gutter-xs sm:gap-gutter-sm">
            {MONTHS.map((m, idx) => {
              const monthNum = idx + 1;
              const isSelected = selectedMonth === monthNum;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelectedMonth(monthNum)}
                  className={`py-gutter-xs sm:py-gutter-sm rounded font-label text-label-sm sm:text-label-md transition-all ${
                    isSelected
                      ? 'bg-light-secondary text-light-on-secondary dark:bg-dark-secondary dark:text-dark-on-secondary font-semibold shadow-sm'
                      : 'border border-light-outline-variant dark:border-dark-outline-variant text-light-on-surface hover:border-indigo'
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab Panel: Harian */}
      {activeTab === 'harian' && (
        <div className="space-y-gutter-sm">
          <label htmlFor="single-date" className="block font-label text-label-sm sm:text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
            Pilih Tanggal Spesifik
          </label>
          <input
            id="single-date"
            type="date"
            value={singleDate}
            onChange={(e) => setSingleDate(e.target.value)}
            className="w-full rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface dark:bg-dark-surface text-light-on-surface dark:text-dark-on-surface font-body text-body-sm sm:text-body-md px-gutter-sm sm:px-gutter-md py-gutter-xs sm:py-gutter-sm"
          />
        </div>
      )}

      {/* Tab Panel: Tahunan */}
      {activeTab === 'tahunan' && (
        <div className="space-y-gutter-sm">
          <span className="block font-label text-label-sm sm:text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
            Pilih Tahun Rekapitulasi
          </span>
          <div className="grid grid-cols-3 gap-gutter-xs sm:gap-gutter-sm">
            {[2024, 2025, 2026].map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => setSelectedYear(yr)}
                className={`py-gutter-sm rounded font-label text-label-md transition-all ${
                  selectedYear === yr
                    ? 'bg-light-secondary text-light-on-secondary dark:bg-dark-secondary dark:text-dark-on-secondary font-bold shadow-sm'
                    : 'border border-light-outline-variant dark:border-dark-outline-variant'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab Panel: Rentang Kustom */}
      {activeTab === 'kustom' && (
        <div className="space-y-gutter-md">
          <div className="flex flex-wrap gap-gutter-xs">
            <button
              type="button"
              onClick={() => {
                const now = new Date('2026-11-25');
                const past7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                setStartDate(past7.toISOString().split('T')[0]);
                setEndDate('2026-11-25');
              }}
              className="px-gutter-sm py-gutter-xs rounded-full border border-light-outline-variant dark:border-dark-outline-variant font-label text-label-sm hover:border-indigo"
            >
              7 Hari Terakhir
            </button>
            <button
              type="button"
              onClick={() => {
                setStartDate('2026-11-01');
                setEndDate('2026-11-25');
              }}
              className="px-gutter-sm py-gutter-xs rounded-full bg-light-tertiary-container text-light-on-tertiary-container dark:bg-dark-tertiary-container dark:text-dark-on-tertiary-container font-label text-label-sm"
            >
              Bulan Ini
            </button>
            <button
              type="button"
              onClick={() => {
                setStartDate('2026-01-01');
                setEndDate('2026-11-25');
              }}
              className="px-gutter-sm py-gutter-xs rounded-full border border-light-outline-variant dark:border-dark-outline-variant font-label text-label-sm hover:border-indigo"
            >
              Tahun Berjalan (YTD)
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-gutter-sm sm:gap-gutter-md">
            <div>
              <label htmlFor="start-date" className="block font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant mb-gutter-xs">
                Tanggal Mulai
              </label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface dark:bg-dark-surface text-light-on-surface dark:text-dark-on-surface font-body text-body-sm px-gutter-sm py-gutter-xs"
              />
            </div>
            <div>
              <label htmlFor="end-date" className="block font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant mb-gutter-xs">
                Tanggal Akhir
              </label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface dark:bg-dark-surface text-light-on-surface dark:text-dark-on-surface font-body text-body-sm px-gutter-sm py-gutter-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* Popover Bottom Actions */}
      <div className="flex items-center justify-between pt-gutter-sm sm:pt-gutter-md border-t border-light-outline-variant dark:border-dark-outline-variant mt-gutter-md">
        <button
          type="button"
          onClick={handleReset}
          className="font-label text-label-sm sm:text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant hover:text-light-on-surface"
        >
          Reset Filter
        </button>
        <div className="flex items-center gap-gutter-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-gutter-md py-gutter-xs sm:py-gutter-sm rounded border border-light-outline-variant dark:border-dark-outline-variant font-label text-label-sm sm:text-label-md"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-gutter-md py-gutter-xs sm:py-gutter-sm rounded bg-light-secondary text-light-on-secondary dark:bg-dark-secondary dark:text-dark-on-secondary font-label text-label-sm sm:text-label-md shadow-sm"
          >
            Terapkan Filter
          </button>
        </div>
      </div>

    </div>
  </>
);
}
