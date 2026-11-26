'use client';

import React from 'react';
import { Transaction } from '@/lib/types';
import { formatRupiah } from './KPICards';
import TransactionDetailModal from './TransactionDetailModal';

interface TransactionTableProps {
  transactions: Transaction[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onDataChanged?: () => void;
  isLoggedIn?: boolean;
}

export default function TransactionTable({
  transactions,
  searchQuery,
  onSearchChange,
  onDataChanged,
  isLoggedIn = false,
}: TransactionTableProps) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [selectedTransaction, setSelectedTransaction] = React.useState<Transaction | null>(null);
  const [confirmModal, setConfirmModal] = React.useState<{
    isOpen: boolean;
    mode: 'selected' | 'all';
    count: number;
  } | null>(null);

  const handleUpdateBeritaAcara = async (id: string, newBA: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/transactions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, berita_acara: newBA }),
      });
      const data = await res.json();
      if (data.success) {
        if (selectedTransaction && selectedTransaction.id === id) {
          setSelectedTransaction({ ...selectedTransaction, berita_acara: newBA });
        }
        if (onDataChanged) {
          onDataChanged();
        }
        return true;
      } else {
        alert(data.message || 'Gagal memperbarui Berita Acara');
        return false;
      }
    } catch (err) {
      console.error('Update BA error:', err);
      alert('Terjadi kesalahan jaringan.');
      return false;
    }
  };

  // Custom rows per page state
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [isAllSelected, setIsAllSelected] = React.useState<boolean>(false);
  const [isCustom, setIsCustom] = React.useState<boolean>(false);
  const [customInputValue, setCustomInputValue] = React.useState<string>('15');

  const effectivePageSize = isAllSelected
    ? Math.max(1, transactions.length)
    : Math.max(1, pageSize);

  const totalPages = Math.ceil(transactions.length / effectivePageSize) || 1;
  const startIndex = (currentPage - 1) * effectivePageSize;
  const paginatedRows = transactions.slice(startIndex, startIndex + effectivePageSize);

  const handlePageSizeSelect = (val: string) => {
    setCurrentPage(1);
    if (val === 'all') {
      setIsAllSelected(true);
      setIsCustom(false);
    } else if (val === 'custom') {
      setIsCustom(true);
      setIsAllSelected(false);
      const parsed = parseInt(customInputValue, 10);
      if (!isNaN(parsed) && parsed > 0) {
        setPageSize(parsed);
      }
    } else {
      setIsAllSelected(false);
      setIsCustom(false);
      const num = parseInt(val, 10);
      if (!isNaN(num) && num > 0) {
        setPageSize(num);
      }
    }
  };

  const handleCustomInputChange = (val: string) => {
    setCustomInputValue(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setPageSize(parsed);
      setCurrentPage(1);
    }
  };

  // Check if all rows on current page are selected
  const isAllCurrentPageSelected =
    paginatedRows.length > 0 && paginatedRows.every((tx) => selectedIds.has(tx.id));

  // Toggle individual row selection
  const handleToggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Toggle all on current page
  const handleToggleSelectPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (isAllCurrentPageSelected) {
        paginatedRows.forEach((tx) => next.delete(tx.id));
      } else {
        paginatedRows.forEach((tx) => next.add(tx.id));
      }
      return next;
    });
  };

  // Select all filtered transactions
  const handleSelectAllTransactions = () => {
    setSelectedIds(new Set(transactions.map((tx) => tx.id)));
  };

  // Clear selection
  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  // Execute deletion
  const executeDelete = async (mode: 'selected' | 'all') => {
    setIsDeleting(true);
    try {
      const payload =
        mode === 'selected' ? { ids: Array.from(selectedIds) } : { all: true };

      const res = await fetch('/api/transactions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setSelectedIds(new Set());
        setConfirmModal(null);
        if (onDataChanged) {
          onDataChanged();
        }
      } else {
        alert(json.message || 'Gagal menghapus data');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Terjadi kesalahan jaringan saat menghapus data.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section aria-label="Data Penerimaan Terbaru">
      <div className="w-full bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-sm overflow-hidden flex flex-col">
        
        {/* Table Header with Search Bar and Actions */}
        <div className="p-gutter-md sm:p-gutter-lg border-b border-light-outline-variant dark:border-dark-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-gutter-sm sm:gap-gutter-md">
          <div>
            <h2 className="font-headline text-headline-md text-light-on-surface dark:text-dark-on-surface">
              Data Penerimaan Terbaru
            </h2>
            <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant text-pretty">
              Setoran retribusi dan penerimaan kas daerah ({transactions.length} total)
            </p>
          </div>

          <div className="flex items-center gap-gutter-xs sm:gap-gutter-sm w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
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
                placeholder="Cari no bukti, wajib pajak, kelurahan..."
                className="w-full pl-10 pr-gutter-md py-gutter-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface dark:bg-dark-surface text-light-on-surface dark:text-dark-on-surface font-body text-body-sm focus:outline-none focus:ring-2 focus:ring-indigo transition-colors"
              />
            </div>

            {/* Rows Per Page Filter (Header) */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <label htmlFor="top-page-size" className="hidden lg:inline text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant font-label">
                Tampilkan:
              </label>
              <select
                id="top-page-size"
                aria-label="Pilih jumlah data per halaman"
                value={isAllSelected ? 'all' : isCustom ? 'custom' : String(pageSize)}
                onChange={(e) => handlePageSizeSelect(e.target.value)}
                className="px-2.5 py-2 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface dark:bg-dark-surface text-light-on-surface dark:text-dark-on-surface font-label text-xs focus:ring-2 focus:ring-indigo cursor-pointer transition-colors"
                title="Pilih jumlah baris data yang ditampilkan"
              >
                <option value="5">5 data</option>
                <option value="10">10 data</option>
                <option value="25">25 data</option>
                <option value="50">50 data</option>
                <option value="100">100 data</option>
                <option value="all">Semua ({transactions.length})</option>
                <option value="custom">Kustom...</option>
              </select>

              {isCustom && (
                <div className="flex items-center gap-1 animate-in fade-in duration-100">
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={customInputValue}
                    onChange={(e) => handleCustomInputChange(e.target.value)}
                    className="w-16 px-2 py-2 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface dark:bg-dark-surface text-light-on-surface dark:text-dark-on-surface font-mono text-xs focus:ring-2 focus:ring-indigo"
                    title="Ketik jumlah data kustom"
                    placeholder="Jml"
                  />
                  <span className="text-xs text-light-on-surface-variant font-label hidden sm:inline">baris</span>
                </div>
              )}
            </div>

            {/* Kosongkan Semua Data Button */}
            {isLoggedIn && transactions.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  setConfirmModal({
                    isOpen: true,
                    mode: 'all',
                    count: transactions.length,
                  })
                }
                title="Hapus / Kosongkan Seluruh Data Transaksi"
                className="inline-flex items-center gap-1 px-3 py-2 rounded border border-light-error/40 text-light-error hover:bg-light-error-container hover:border-light-error dark:border-dark-error/40 dark:text-dark-error dark:hover:bg-dark-error-container/40 font-label text-label-sm transition-colors flex-shrink-0"
              >
                <span className="material-symbols-outlined text-body-md" aria-hidden="true">delete_sweep</span>
                <span className="hidden sm:inline">Kosongkan Semua</span>
              </button>
            )}
          </div>
        </div>

        {/* Guest Mode Notice Banner */}
        {!isLoggedIn && (
          <div className="px-gutter-md sm:px-gutter-lg py-2.5 bg-amber/10 border-b border-amber/30 text-amber-700 dark:text-amber-300 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-amber flex-shrink-0" aria-hidden="true">info</span>
              <span>
                <strong>Mode Tamu (Hanya Lihat):</strong> Anda dapat melihat dan mengekspor data. Masuk sebagai petugas untuk menghapus transaksi atau mengimpor berkas CSV.
              </span>
            </div>
            <a href="/login" className="font-semibold underline hover:text-amber-800 dark:hover:text-amber-200 flex-shrink-0">
              Masuk &rarr;
            </a>
          </div>
        )}

        {/* Bulk Action Banner (Appears when items are selected) */}
        {isLoggedIn && selectedIds.size > 0 && (
          <div className="px-gutter-md sm:px-gutter-lg py-2.5 bg-light-surface-container dark:bg-dark-surface-container border-b border-light-outline-variant dark:border-dark-outline-variant flex flex-wrap items-center justify-between gap-gutter-sm animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="flex items-center gap-gutter-sm">
              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-light-primary text-light-on-primary dark:bg-dark-primary dark:text-dark-on-primary font-label text-xs font-semibold">
                {selectedIds.size}
              </span>
              <span className="font-body text-body-sm font-medium text-light-on-surface dark:text-dark-on-surface">
                transaksi dipilih
              </span>
              {selectedIds.size < transactions.length && (
                <button
                  type="button"
                  onClick={handleSelectAllTransactions}
                  className="font-label text-label-xs text-indigo underline hover:text-indigo/80 ml-2"
                >
                  Pilih Semua ({transactions.length} data)
                </button>
              )}
            </div>

            <div className="flex items-center gap-gutter-xs">
              <button
                type="button"
                onClick={() =>
                  setConfirmModal({
                    isOpen: true,
                    mode: 'selected',
                    count: selectedIds.size,
                  })
                }
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-crimson text-white hover:bg-crimson/90 font-label text-label-sm shadow-sm active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-body-md" aria-hidden="true">delete</span>
                <span>Hapus {selectedIds.size} Terpilih</span>
              </button>
              <button
                type="button"
                onClick={handleClearSelection}
                className="px-2.5 py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant font-label text-label-sm text-light-on-surface-variant hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container"
              >
                Batal
              </button>
            </div>
          </div>
        )}

        {/* Desktop View Table (hidden on mobile, shown on md+) */}
        <div className="hidden md:block w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-light-surface-container-low dark:bg-dark-surface-container border-b border-light-outline-variant dark:border-dark-outline-variant">
              <tr>
                {isLoggedIn && (
                  <th className="w-10 px-gutter-md py-gutter-sm">
                    <input
                      type="checkbox"
                      checked={isAllCurrentPageSelected}
                      onChange={handleToggleSelectPage}
                      aria-label="Pilih semua transaksi pada halaman ini"
                      className="w-4 h-4 rounded text-indigo focus:ring-indigo border-light-outline-variant dark:border-dark-outline-variant cursor-pointer accent-indigo"
                    />
                  </th>
                )}
                <th className="px-gutter-md py-gutter-sm font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">Tanggal</th>
                <th className="px-gutter-md py-gutter-sm font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">No Bukti / NOP</th>
                <th className="px-gutter-md py-gutter-sm font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">Kategori</th>
                <th className="px-gutter-md py-gutter-sm font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">Uraian &amp; Kelurahan</th>
                <th className="px-gutter-md py-gutter-sm font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant text-right">Nominal</th>
                <th className="px-gutter-md py-gutter-sm font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-outline-variant dark:divide-dark-outline-variant">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={isLoggedIn ? 7 : 6} className="px-gutter-lg py-gutter-lg text-center text-light-on-surface-variant">
                    Tidak ada transaksi yang cocok.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((tx) => {
                  const isChecked = selectedIds.has(tx.id);
                  return (
                    <tr
                      key={tx.id}
                      onClick={() => setSelectedTransaction(tx)}
                      className={`cursor-pointer hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container transition-colors group ${
                        isChecked ? 'bg-light-surface-container/60 dark:bg-dark-surface-container/60' : ''
                      }`}
                      title="Klik untuk melihat detail & berita acara"
                    >
                      {isLoggedIn && (
                        <td
                          className="w-10 px-gutter-md py-gutter-md"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleRow(tx.id)}
                            aria-label={`Pilih transaksi ${tx.nomor_bukti}`}
                            className="w-4 h-4 rounded text-indigo focus:ring-indigo border-light-outline-variant dark:border-dark-outline-variant cursor-pointer accent-indigo"
                          />
                        </td>
                      )}
                      <td className="px-gutter-md py-gutter-md tabular-nums whitespace-nowrap font-body text-body-md">
                        {tx.tanggal}
                      </td>
                      <td className="px-gutter-md py-gutter-md whitespace-nowrap font-mono text-mono-sm text-light-on-surface-variant dark:text-dark-on-surface-variant max-w-[150px] truncate" title={tx.nomor_bukti}>
                        {tx.nomor_bukti}
                      </td>
                      <td className="px-gutter-md py-gutter-md whitespace-nowrap font-body text-body-md max-w-[140px] truncate" title={tx.nama_kategori}>
                        {tx.nama_kategori}
                      </td>
                      <td className="px-gutter-md py-gutter-md font-body text-body-md max-w-xs">
                        <div className="truncate font-medium group-hover:text-indigo dark:group-hover:text-indigo-400 transition-colors" title={tx.uraian_transaksi}>
                          {tx.uraian_transaksi}
                        </div>
                        <div className="flex flex-wrap items-center gap-1 mt-0.5">
                          {tx.kelurahan && (
                            <div className="inline-flex items-center gap-1 text-xs text-light-on-surface-variant/80 dark:text-dark-on-surface-variant/80 font-mono">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo inline-block" aria-hidden="true"></span>
                              <span>Kel. {tx.kelurahan}</span>
                            </div>
                          )}
                          {tx.berita_acara && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-indigo/10 text-indigo dark:text-indigo-400 font-mono text-[10px]">
                              <span className="material-symbols-outlined text-[10px]" aria-hidden="true">assignment</span>
                              <span>BA: {tx.berita_acara}</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-gutter-md py-gutter-md text-right tabular-nums whitespace-nowrap font-label text-label-lg">
                        {formatRupiah(tx.nominal)}
                      </td>
                      <td className="px-gutter-md py-gutter-md whitespace-nowrap">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className={`inline-flex items-center px-gutter-sm py-gutter-xs rounded-full font-label text-label-sm ${
                            tx.status === 'Terverifikasi'
                              ? 'bg-light-secondary-container text-light-on-secondary-container dark:bg-dark-secondary-container dark:text-dark-on-secondary-container'
                              : 'bg-light-warning-container text-light-on-warning-container dark:bg-dark-warning-container dark:text-dark-on-warning-container'
                          }`}>
                            {tx.status}
                          </span>
                          <span className="material-symbols-outlined text-sm text-light-outline dark:text-dark-outline group-hover:text-indigo transition-colors" title="Buka Detail">
                            chevron_right
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
            paginatedRows.map((tx) => {
              const isChecked = selectedIds.has(tx.id);
              return (
                <li
                  key={tx.id}
                  onClick={() => setSelectedTransaction(tx)}
                  className={`cursor-pointer p-gutter-md flex flex-col gap-gutter-xs transition-colors hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container active:scale-[0.99] ${
                    isChecked ? 'bg-light-surface-container/60 dark:bg-dark-surface-container/60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {isLoggedIn && (
                        <div onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleRow(tx.id)}
                            aria-label={`Pilih transaksi ${tx.nomor_bukti}`}
                            className="w-4 h-4 rounded text-indigo focus:ring-indigo border-light-outline-variant dark:border-dark-outline-variant cursor-pointer accent-indigo flex-shrink-0"
                          />
                        </div>
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="font-mono text-mono-xs sm:text-mono-sm text-light-on-surface-variant dark:text-dark-on-surface-variant truncate max-w-[180px]" title={tx.nomor_bukti}>
                          {tx.nomor_bukti}
                        </span>
                        <span className="font-body text-body-xs text-light-on-surface-variant/70">
                          {tx.tanggal}
                        </span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full font-label text-label-xs flex-shrink-0 ${
                      tx.status === 'Terverifikasi'
                        ? 'bg-light-secondary-container text-light-on-secondary-container dark:bg-dark-secondary-container dark:text-dark-on-secondary-container'
                        : 'bg-light-warning-container text-light-on-warning-container dark:bg-dark-warning-container dark:text-dark-on-warning-container'
                    }`}>
                      {tx.status}
                    </span>
                  </div>

                  <p className="font-body text-body-sm text-light-on-surface dark:text-dark-on-surface line-clamp-2 pl-6">
                    {tx.uraian_transaksi}
                  </p>

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-light-outline-variant/40 dark:border-dark-outline-variant/40 pl-6">
                    <div className="flex items-center gap-1.5 truncate max-w-[180px]">
                      <span className="font-body text-body-xs text-light-on-surface-variant dark:text-dark-on-surface-variant truncate">
                        {tx.nama_kategori}
                      </span>
                      {tx.kelurahan && (
                        <span className="px-1.5 py-0.2 rounded bg-light-surface-container dark:bg-dark-surface-container font-mono text-[10px] text-light-on-surface-variant flex-shrink-0">
                          {tx.kelurahan}
                        </span>
                      )}
                      {tx.berita_acara && (
                        <span className="px-1.5 py-0.2 rounded bg-indigo/10 font-mono text-[10px] text-indigo dark:text-indigo-400 flex-shrink-0">
                          BA
                        </span>
                      )}
                    </div>
                    <span className="font-label text-label-md tabular-nums flex-shrink-0 font-semibold text-emerald">
                      {formatRupiah(tx.nominal)}
                    </span>
                  </div>
                </li>
              );
            })
          )}
        </ul>

        {/* Pagination Bar */}
        <div className="px-gutter-md lg:px-gutter-lg py-gutter-sm lg:py-gutter-md border-t border-light-outline-variant dark:border-dark-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-gutter-sm">
          
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
              {transactions.length === 0
                ? '0 data'
                : `${startIndex + 1}–${Math.min(startIndex + effectivePageSize, transactions.length)} dari ${transactions.length} transaksi`}
            </span>

            {/* Quick Rows selector in footer */}
            <div className="inline-flex items-center gap-1.5 text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant pl-2 border-l border-light-outline-variant dark:border-dark-outline-variant">
              <label htmlFor="bottom-page-size" className="font-label">
                Baris:
              </label>
              <select
                id="bottom-page-size"
                aria-label="Pilih jumlah baris di bagian bawah tabel"
                value={isAllSelected ? 'all' : isCustom ? 'custom' : String(pageSize)}
                onChange={(e) => handlePageSizeSelect(e.target.value)}
                className="px-2 py-1 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface dark:bg-dark-surface text-light-on-surface dark:text-dark-on-surface font-label text-xs focus:ring-1 focus:ring-indigo cursor-pointer"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="all">Semua</option>
                <option value="custom">Kustom</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-gutter-xs self-end sm:self-auto">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-gutter-sm py-gutter-xs rounded border border-light-outline-variant dark:border-dark-outline-variant font-label text-label-sm disabled:opacity-40 hover:bg-light-surface-container dark:hover:bg-dark-surface-container transition-colors"
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
              className="px-gutter-sm py-gutter-xs rounded border border-light-outline-variant dark:border-dark-outline-variant font-label text-label-sm disabled:opacity-40 hover:bg-light-surface-container dark:hover:bg-dark-surface-container transition-colors"
            >
              Next
            </button>
          </div>
        </div>

      </div>

      {/* Confirmation Modal for Bulk Delete & Clear All */}
      {confirmModal && confirmModal.isOpen && (
        <div
          onClick={() => setConfirmModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-gutter-sm sm:p-gutter-md bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-md bg-light-surface-container-lowest dark:bg-dark-surface-container-low text-light-on-surface dark:text-dark-on-surface border border-light-outline-variant dark:border-dark-outline-variant shadow-2xl p-gutter-md sm:p-gutter-lg flex flex-col gap-gutter-md animate-in zoom-in-95 duration-100 cursor-default"
          >
            <div className="flex items-center gap-gutter-sm text-crimson">
              <span className="material-symbols-outlined text-headline-md">warning</span>
              <h3 className="font-headline text-headline-sm">
                {confirmModal.mode === 'all'
                  ? 'Kosongkan Seluruh Data?'
                  : `Hapus ${confirmModal.count} Transaksi?`}
              </h3>
            </div>

            <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
              {confirmModal.mode === 'all'
                ? `Seluruh ${confirmModal.count} data transaksi akan dihapus secara permanen dari sistem dan database. Tindakan ini tidak dapat dibatalkan.`
                : `Sebanyak ${confirmModal.count} data transaksi terpilih akan dihapus secara permanen. Anda yakin ingin melanjutkan?`}
            </p>

            <div className="flex items-center justify-end gap-gutter-sm pt-gutter-xs border-t border-light-outline-variant dark:border-dark-outline-variant">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setConfirmModal(null)}
                className="px-gutter-md py-gutter-sm rounded border border-light-outline-variant dark:border-dark-outline-variant font-label text-label-md"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => executeDelete(confirmModal.mode)}
                className="px-gutter-md py-gutter-sm rounded bg-crimson text-white font-label text-label-md shadow-sm disabled:opacity-50 inline-flex items-center gap-1"
              >
                {isDeleting ? (
                  <span>Menghapus...</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-body-md">delete_forever</span>
                    <span>Ya, Hapus</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Detail & Berita Acara Popup Modal */}
      <TransactionDetailModal
        isOpen={Boolean(selectedTransaction)}
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        onUpdateBeritaAcara={handleUpdateBeritaAcara}
        isLoggedIn={isLoggedIn}
      />
    </section>
  );
}
