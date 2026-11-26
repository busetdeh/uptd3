'use client';

import React from 'react';
import { Transaction } from '@/lib/types';
import { formatRupiah } from './KPICards';

interface TransactionTableProps {
  transactions: Transaction[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export default function TransactionTable({
  transactions,
  searchQuery,
  onSearchChange,
}: TransactionTableProps) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 5;

  const totalPages = Math.ceil(transactions.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRows = transactions.slice(startIndex, startIndex + pageSize);

  return (
    <section aria-label="Data Penerimaan Terbaru">
      <div className="w-full bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-sm overflow-hidden">
        
        {/* Table Header with Search Bar */}
        <div className="p-gutter-md sm:p-gutter-lg border-b border-light-outline-variant dark:border-dark-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-gutter-sm sm:gap-gutter-md">
          <div>
            <h2 className="font-headline text-headline-md text-light-on-surface dark:text-dark-on-surface">
              Data Penerimaan Terbaru
            </h2>
            <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant text-pretty">
              Setoran retribusi dan penerimaan kas daerah
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined text-title-md text-light-outline dark:text-dark-outline absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true">
              search
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari no bukti, kategori, uraian..."
              className="w-full pl-10 pr-gutter-md py-gutter-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface dark:bg-dark-surface text-light-on-surface dark:text-dark-on-surface font-body text-body-sm focus:outline-none focus:ring-2 focus:ring-indigo transition-colors"
            />
          </div>
        </div>

        {/* Desktop View Table (hidden on mobile, shown on md+) */}
        <div className="hidden md:block w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-light-surface-container-low dark:bg-dark-surface-container border-b border-light-outline-variant dark:border-dark-outline-variant">
              <tr>
                <th className="px-gutter-lg py-gutter-sm font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">Tanggal</th>
                <th className="px-gutter-lg py-gutter-sm font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">No Bukti</th>
                <th className="px-gutter-lg py-gutter-sm font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">Kategori</th>
                <th className="px-gutter-lg py-gutter-sm font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">Uraian</th>
                <th className="px-gutter-lg py-gutter-sm font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant text-right">Nominal</th>
                <th className="px-gutter-lg py-gutter-sm font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-outline-variant dark:divide-dark-outline-variant">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-gutter-lg py-gutter-lg text-center text-light-on-surface-variant">
                    Tidak ada transaksi yang cocok.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((tx) => (
                  <tr key={tx.id} className="hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container transition-colors">
                    <td className="px-gutter-lg py-gutter-md tabular-nums whitespace-nowrap font-body text-body-md">{tx.tanggal}</td>
                    <td className="px-gutter-lg py-gutter-md whitespace-nowrap font-mono text-mono-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">{tx.nomor_bukti}</td>
                    <td className="px-gutter-lg py-gutter-md whitespace-nowrap font-body text-body-md">{tx.nama_kategori}</td>
                    <td className="px-gutter-lg py-gutter-md font-body text-body-md max-w-xs truncate" title={tx.uraian_transaksi}>{tx.uraian_transaksi}</td>
                    <td className="px-gutter-lg py-gutter-md text-right tabular-nums whitespace-nowrap font-label text-label-lg">{formatRupiah(tx.nominal)}</td>
                    <td className="px-gutter-lg py-gutter-md whitespace-nowrap">
                      <span className={`inline-flex items-center px-gutter-sm py-gutter-xs rounded-full font-label text-label-sm ${
                        tx.status === 'Terverifikasi'
                          ? 'bg-light-secondary-container text-light-on-secondary-container dark:bg-dark-secondary-container dark:text-dark-on-secondary-container'
                          : 'bg-light-warning-container text-light-on-warning-container dark:bg-dark-warning-container dark:text-dark-on-warning-container'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View Card List (shown on mobile, hidden on md+) */}
        <ul className="md:hidden divide-y divide-light-outline-variant dark:divide-dark-outline-variant">
          {paginatedRows.length === 0 ? (
            <li className="p-gutter-md text-center text-light-on-surface-variant text-body-sm">
              Tidak ada data transaksi.
            </li>
          ) : (
            paginatedRows.map((tx) => (
              <li key={tx.id} className="p-gutter-md flex flex-col gap-gutter-xs">
                <div className="flex items-center justify-between gap-gutter-sm">
                  <span className="font-mono text-mono-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    {tx.nomor_bukti} · {tx.tanggal}
                  </span>
                  <span className={`px-gutter-sm py-gutter-xs rounded-full font-label text-label-sm ${
                    tx.status === 'Terverifikasi'
                      ? 'bg-light-secondary-container text-light-on-secondary-container dark:bg-dark-secondary-container dark:text-dark-on-secondary-container'
                      : 'bg-light-warning-container text-light-on-warning-container dark:bg-dark-warning-container dark:text-dark-on-warning-container'
                  }`}>
                    {tx.status}
                  </span>
                </div>
                <p className="font-body text-body-md text-light-on-surface dark:text-dark-on-surface">
                  {tx.uraian_transaksi}
                </p>
                <div className="flex items-center justify-between gap-gutter-sm pt-gutter-xs">
                  <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    {tx.nama_kategori}
                  </span>
                  <span className="font-label text-label-lg tabular-nums">
                    {formatRupiah(tx.nominal)}
                  </span>
                </div>
              </li>
            ))
          )}
        </ul>

        {/* Pagination Bar */}
        <div className="px-gutter-md lg:px-gutter-lg py-gutter-sm lg:py-gutter-md border-t border-light-outline-variant dark:border-dark-outline-variant flex items-center justify-between gap-gutter-sm">
          <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
            {transactions.length === 0
              ? '0 data'
              : `${startIndex + 1}–${Math.min(startIndex + pageSize, transactions.length)} dari ${transactions.length} transaksi`}
          </span>
          <div className="flex items-center gap-gutter-xs">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-gutter-sm py-gutter-xs rounded border border-light-outline-variant dark:border-dark-outline-variant font-label text-label-sm disabled:opacity-40"
            >
              Prev
            </button>
            <span className="font-label text-label-sm px-2 text-light-on-surface">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-gutter-sm py-gutter-xs rounded border border-light-outline-variant dark:border-dark-outline-variant font-label text-label-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
