'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatRupiah } from './KPICards';

interface CategoryItem {
  name: string;
  total: number;
  percentage: number;
}

interface CategoryDonutProps {
  categories: CategoryItem[];
}

const CATEGORY_COLORS = ['#10B981', '#6366F1', '#F59E0B', '#B91A24', '#00A572', '#C0C1FF'];

export default function CategoryDonut({ categories }: CategoryDonutProps) {
  const chartData = categories.map((cat, i) => ({
    name: cat.name,
    value: cat.total,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));

  return (
    <article className="lg:col-span-4 bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-gutter-md lg:p-gutter-lg shadow-sm flex flex-col justify-between gap-gutter-md">
      <header>
        <h2 className="font-headline text-headline-md text-light-on-surface dark:text-dark-on-surface">
          Proporsi Kategori Pendapatan
        </h2>
        <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
          Distribusi retribusi periode aktif
        </p>
      </header>

      {/* Donut Chart */}
      <div className="flex items-center justify-center py-gutter-xs sm:py-gutter-sm">
        <div className="relative w-40 h-40 sm:w-44 sm:h-44 flex items-center justify-center flex-shrink-0">
          {categories.length === 0 ? (
            <div className="text-light-on-surface-variant text-body-sm">Belum ada data</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart width={160} height={160}>
                  <Tooltip
                    formatter={(val) => [formatRupiah(Number(val)), 'Total']}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      color: '#FFFFFF',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '12px',
                    }}
                  />
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center pointer-events-none">
                <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant block">
                  Total
                </span>
                <span className="font-headline text-headline-md text-light-on-surface dark:text-dark-on-surface tabular-nums block">
                  100%
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Category Breakdown List */}
      <ul className="flex flex-col gap-gutter-sm pt-gutter-xs sm:pt-gutter-sm border-t border-light-outline-variant dark:border-dark-outline-variant max-h-44 overflow-y-auto pr-1">
        {categories.map((cat, idx) => {
          const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
          return (
            <li key={cat.name} className="flex items-center justify-between gap-gutter-sm text-pretty">
              <div className="flex items-center gap-gutter-sm min-w-0">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} aria-hidden="true" />
                <span className="font-body text-body-sm text-light-on-surface dark:text-dark-on-surface truncate max-w-[130px] sm:max-w-[160px]" title={cat.name}>
                  {cat.name} ({cat.percentage}%)
                </span>
              </div>
              <span className="font-mono text-mono-sm text-light-on-surface-variant dark:text-dark-on-surface-variant tabular-nums flex-shrink-0">
                {formatRupiah(cat.total)}
              </span>
            </li>
          );
        })}
      </ul>
    </article>
  );
}
