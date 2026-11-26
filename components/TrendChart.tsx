'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { TimeFilterMode } from '@/lib/types';
import { formatRupiah } from './KPICards';

interface DailyTrendItem {
  date: string;
  fullDate: string;
  realisasi: number;
  targetHarian: number;
}

interface TrendChartProps {
  data: DailyTrendItem[];
  activeMode: TimeFilterMode;
  onModeChange: (mode: TimeFilterMode) => void;
  targetHarian: number;
}

export default function TrendChart({
  data,
  activeMode,
  onModeChange,
  targetHarian,
}: TrendChartProps) {
  return (
    <article className="lg:col-span-8 bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-gutter-md lg:p-gutter-lg shadow-sm flex flex-col justify-between gap-gutter-md">
      
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-gutter-sm sm:gap-gutter-md">
        <div>
          <h2 className="font-headline text-headline-md text-light-on-surface dark:text-dark-on-surface">
            Tren Penerimaan Harian vs Target Harian
          </h2>
          <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant text-pretty">
            Garis putus-putus menandakan ambang target harian ({formatRupiah(targetHarian)}/hari)
          </p>
        </div>

        {/* Pill Mode Switcher */}
        <div className="grid grid-cols-4 sm:inline-flex items-center p-gutter-xs rounded-full bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant gap-gutter-xs flex-shrink-0">
          {(['harian', 'bulanan', 'tahunan', 'kustom'] as TimeFilterMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onModeChange(mode)}
              className={`py-gutter-xs sm:px-gutter-sm rounded-full font-label text-label-sm capitalize transition-colors ${
                activeMode === mode
                  ? 'bg-light-primary text-light-on-primary dark:bg-dark-primary dark:text-dark-on-primary shadow-sm'
                  : 'text-light-on-surface-variant dark:text-dark-on-surface-variant hover:text-light-on-surface'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </header>

      {/* Recharts Container */}
      <div className="w-full h-64 sm:h-72">
        {data.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-light-on-surface-variant font-body text-body-sm">
            Tidak ada transaksi pada rentang filter yang dipilih.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: 'currentColor' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(val) => `${(val / 1000000).toFixed(0)} jt`}
                tick={{ fontSize: 11, fill: 'currentColor' }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip
                formatter={(val) => [formatRupiah(Number(val)), 'Realisasi']}
                labelFormatter={(lbl) => `Tanggal: ${lbl}`}
                contentStyle={{
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '12px',
                }}
              />
              <ReferenceLine
                y={targetHarian}
                stroke="#6366F1"
                strokeWidth={2}
                strokeDasharray="5 5"
                label={{
                  value: `Target: ${(targetHarian / 1000000).toFixed(0)} jt`,
                  fill: '#6366F1',
                  fontSize: 11,
                  position: 'insideTopRight',
                }}
              />
              <Bar
                dataKey="realisasi"
                fill="#10B981"
                radius={[4, 4, 0, 0]}
                maxBarSize={36}
              />
              <Line
                type="monotone"
                dataKey="realisasi"
                stroke="#6366F1"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#6366F1' }}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <footer className="flex flex-wrap items-center gap-gutter-md sm:gap-gutter-lg pt-gutter-xs sm:pt-gutter-sm border-t border-light-outline-variant dark:border-dark-outline-variant">
        <div className="flex items-center gap-gutter-xs">
          <span className="w-3 h-3 rounded-sm bg-emerald" aria-hidden="true"></span>
          <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
            Realisasi Penerimaan
          </span>
        </div>
        <div className="flex items-center gap-gutter-xs">
          <span className="w-4 h-0.5 bg-indigo" aria-hidden="true"></span>
          <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
            Garis Tren &amp; Ambang Target
          </span>
        </div>
      </footer>
    </article>
  );
}
