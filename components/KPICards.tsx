'use client';

import React from 'react';

interface KPICardsProps {
  totalRealisasi: number;
  targetAnggaran: number;
  persentaseCapaian: number;
  sisaTarget: number;
  surplus: number;
}

export function formatRupiah(num: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(num);
}

export default function KPICards({
  totalRealisasi,
  targetAnggaran,
  persentaseCapaian,
  sisaTarget,
  surplus,
}: KPICardsProps) {
  // SVG circular gauge calculations
  // circumference of radius 32 = 2 * PI * 32 = ~201.06
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const cappedPercentage = Math.min(100, Math.max(0, persentaseCapaian));
  const strokeDashoffset = circumference - (cappedPercentage / 100) * circumference;

  const isSurplus = surplus > 0 || persentaseCapaian >= 100;
  const isWarning = persentaseCapaian < 50;

  return (
    <section aria-label="Ringkasan Indikator Kinerja Utama" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-gutter-sm lg:gap-gutter-md items-stretch">
      
      {/* KPI 1: Total Realisasi */}
      <article className="bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-gutter-md lg:p-gutter-lg shadow-sm flex flex-col justify-between gap-gutter-sm lg:gap-gutter-md">
        <header className="flex items-center justify-between gap-gutter-sm">
          <h2 className="font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
            Total Realisasi
          </h2>
          <span className="inline-flex items-center gap-gutter-xs px-gutter-sm py-gutter-xs rounded-full bg-light-secondary-container text-light-on-secondary-container dark:bg-dark-secondary-container dark:text-dark-on-secondary-container font-label text-label-sm tabular-nums">
            +12.4%
          </span>
        </header>
        <div className="flex flex-col gap-gutter-xs">
          <p className="font-headline text-headline-lg text-light-on-surface dark:text-dark-on-surface tabular-nums">
            {formatRupiah(totalRealisasi)}
          </p>
          <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
            Penerimaan kas daerah tercatat
          </p>
        </div>
      </article>

      {/* KPI 2: Capaian Target (Radial Progress Gauge) */}
      <article className="bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-gutter-md lg:p-gutter-lg shadow-sm flex items-center justify-between gap-gutter-sm lg:gap-gutter-md">
        <div className="flex flex-col justify-between gap-gutter-xs sm:gap-gutter-sm">
          <h2 className="font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
            Capaian Target
          </h2>
          <p className={`font-headline text-headline-lg tabular-nums ${
            isSurplus ? 'text-light-secondary dark:text-dark-secondary' : isWarning ? 'text-crimson' : 'text-light-secondary dark:text-dark-secondary'
          }`}>
            {persentaseCapaian}%
          </p>
          <span className={`inline-flex items-center gap-gutter-xs font-label text-label-sm ${
            isSurplus ? 'text-light-secondary dark:text-dark-secondary' : isWarning ? 'text-crimson' : 'text-light-secondary dark:text-dark-secondary'
          }`}>
            <span className="material-symbols-outlined text-body-md" aria-hidden="true">
              {isSurplus ? 'verified' : isWarning ? 'warning' : 'check_circle'}
            </span>
            {isSurplus ? 'Target Tercapai!' : isWarning ? 'Perlu Perhatian' : 'Target on Track'}
          </span>
        </div>

        {/* Circular SVG Progress Gauge */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 flex items-center justify-center">
          <svg viewBox="0 0 80 80" className="w-16 h-16 sm:w-20 sm:h-20 -rotate-90">
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-light-surface-container dark:text-dark-surface-container"
            />
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              stroke={isWarning ? '#EF4444' : '#10B981'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <span className="absolute font-label text-label-sm sm:text-label-md text-light-on-surface dark:text-dark-on-surface tabular-nums">
            {Math.round(persentaseCapaian)}%
          </span>
        </div>
      </article>

      {/* KPI 3: Target Anggaran */}
      <article className="bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-gutter-md lg:p-gutter-lg shadow-sm flex flex-col justify-between gap-gutter-sm lg:gap-gutter-md">
        <header className="flex items-center justify-between gap-gutter-sm">
          <h2 className="font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
            Target Anggaran
          </h2>
          <span className="material-symbols-outlined text-title-md text-light-tertiary dark:text-dark-tertiary" aria-hidden="true">
            flag
          </span>
        </header>
        <div className="flex flex-col gap-gutter-xs">
          <p className="font-headline text-headline-lg text-light-on-surface dark:text-dark-on-surface tabular-nums">
            {formatRupiah(targetAnggaran)}
          </p>
          <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
            Pagu APBD Tahun 2026
          </p>
        </div>
      </article>

      {/* KPI 4: Sisa Target / Surplus */}
      <article className="bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-gutter-md lg:p-gutter-lg shadow-sm flex flex-col justify-between gap-gutter-sm lg:gap-gutter-md">
        <header className="flex items-center justify-between gap-gutter-sm">
          <h2 className="font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
            {isSurplus ? 'Surplus Pendapatan' : 'Sisa Target'}
          </h2>
          <span className={`inline-flex items-center gap-gutter-xs px-gutter-sm py-gutter-xs rounded-full font-label text-label-sm tabular-nums ${
            isSurplus
              ? 'bg-light-secondary-container text-light-on-secondary-container dark:bg-dark-secondary-container dark:text-dark-on-secondary-container'
              : 'bg-light-warning-container text-light-on-warning-container dark:bg-dark-warning-container dark:text-dark-on-warning-container'
          }`}>
            {isSurplus ? 'Surplus' : `${(100 - cappedPercentage).toFixed(1)}%`}
          </span>
        </header>
        <div className="flex flex-col gap-gutter-xs">
          <p className="font-headline text-headline-lg text-light-on-surface dark:text-dark-on-surface tabular-nums">
            {formatRupiah(isSurplus ? surplus : sisaTarget)}
          </p>
          <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
            {isSurplus ? 'Melebihi target periode ini' : 'Selisih menuju target'}
          </p>
        </div>
      </article>

    </section>
  );
}
