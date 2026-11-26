'use client';

import React from 'react';
import { Transaction } from '@/lib/types';
import { formatRupiah } from './KPICards';

interface TransactionDetailModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onUpdateBeritaAcara?: (id: string, newBA: string) => Promise<boolean>;
  isLoggedIn?: boolean;
}

export default function TransactionDetailModal({
  isOpen,
  transaction,
  onClose,
  onUpdateBeritaAcara,
  isLoggedIn = false,
}: TransactionDetailModalProps) {
  const [isEditingBA, setIsEditingBA] = React.useState(false);
  const [baInput, setBaInput] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (transaction) {
      setBaInput(transaction.berita_acara || '');
      setIsEditingBA(false);
      setCopied(false);
    }
  }, [transaction]);

  if (!isOpen || !transaction) return null;

  // Extract Taxpayer name from uraian if not explicitly provided
  const extractWajibPajak = (tx: Transaction): string => {
    if (tx.wajib_pajak) return tx.wajib_pajak;
    const match = tx.uraian_transaksi?.match(/Pembayaran\s+(?:PBB|Pajak|Retribusi):\s*([^[(]+)/i);
    if (match && match[1]) {
      return match[1].trim();
    }
    return 'Wajib Pajak / Retribusi Daerah';
  };

  const handleCopyNoBukti = () => {
    if (transaction.nomor_bukti) {
      navigator.clipboard.writeText(transaction.nomor_bukti);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveBA = async () => {
    if (!onUpdateBeritaAcara) return;
    setIsSaving(true);
    try {
      const ok = await onUpdateBeritaAcara(transaction.id, baInput.trim());
      if (ok) {
        setIsEditingBA(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const taxpayerName = extractWajibPajak(transaction);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-gutter-sm sm:p-gutter-md bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="w-full max-w-2xl rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low text-light-on-surface dark:text-dark-on-surface border border-light-outline-variant dark:border-dark-outline-variant shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <header className="flex items-start justify-between gap-gutter-md p-gutter-md sm:p-gutter-lg border-b border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low/50 dark:bg-dark-surface-container/50">
          <div className="flex items-center gap-gutter-sm">
            <div className="w-10 h-10 rounded bg-light-primary text-light-on-primary dark:bg-dark-primary dark:text-dark-on-primary flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-title-lg" aria-hidden="true">receipt_long</span>
            </div>
            <div>
              <h2 id="modal-title" className="font-headline text-headline-sm sm:text-headline-md leading-tight">
                Detail Transaksi Penerimaan
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-mono-xs text-light-on-surface-variant dark:text-dark-on-surface-variant truncate max-w-[200px] sm:max-w-xs">
                  {transaction.nomor_bukti}
                </span>
                <button
                  type="button"
                  onClick={handleCopyNoBukti}
                  className="font-label text-[11px] text-indigo hover:underline flex items-center gap-0.5"
                  title="Salin Nomor Bukti"
                >
                  <span className="material-symbols-outlined text-xs" aria-hidden="true">
                    {copied ? 'check' : 'content_copy'}
                  </span>
                  <span>{copied ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            aria-label="Tutup dialog detail"
            className="p-1 rounded text-light-on-surface-variant hover:bg-light-surface-container dark:hover:bg-dark-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-title-lg" aria-hidden="true">close</span>
          </button>
        </header>

        {/* Scrollable Body */}
        <div className="p-gutter-md sm:p-gutter-lg flex flex-col gap-gutter-md overflow-y-auto print:p-0">
          
          {/* Top Summary Banner: Nominal & Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-gutter-sm p-gutter-md rounded bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant">
            <div>
              <span className="font-label text-label-xs text-light-on-surface-variant dark:text-dark-on-surface-variant block uppercase tracking-wider">
                Jumlah Pembayaran (Realisasi)
              </span>
              <span className="font-headline text-headline-md sm:text-headline-lg font-bold text-emerald tabular-nums">
                {formatRupiah(transaction.nominal)}
              </span>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-label text-label-sm font-semibold ${
                transaction.status === 'Terverifikasi'
                  ? 'bg-light-secondary-container text-light-on-secondary-container dark:bg-dark-secondary-container dark:text-dark-on-secondary-container'
                  : 'bg-light-warning-container text-light-on-warning-container dark:bg-dark-warning-container dark:text-dark-on-warning-container'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald"></span>
                <span>{transaction.status}</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-light-surface-container-high dark:bg-dark-surface-container-high text-light-on-surface dark:text-dark-on-surface font-label text-label-xs font-semibold">
                {transaction.nama_kategori}
              </span>
            </div>
          </div>

          {/* Key Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-gutter-sm">
            
            {/* Wajib Pajak */}
            <div className="p-gutter-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface dark:bg-dark-surface flex flex-col">
              <span className="font-label text-label-xs text-light-on-surface-variant dark:text-dark-on-surface-variant uppercase tracking-wider">
                Wajib Pajak / Penyetor
              </span>
              <span className="font-headline text-title-md font-semibold mt-0.5 text-light-on-surface dark:text-dark-on-surface">
                {taxpayerName}
              </span>
            </div>

            {/* Kelurahan */}
            <div className="p-gutter-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface dark:bg-dark-surface flex flex-col">
              <span className="font-label text-label-xs text-light-on-surface-variant dark:text-dark-on-surface-variant uppercase tracking-wider">
                Kelurahan / Lokasi Objek
              </span>
              <span className="font-headline text-title-md font-semibold mt-0.5 text-light-on-surface dark:text-dark-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base text-indigo" aria-hidden="true">location_on</span>
                <span>{transaction.kelurahan ? `Kel. ${transaction.kelurahan}` : 'Wilayah UPTD'}</span>
              </span>
            </div>

            {/* Tanggal Transaksi */}
            <div className="p-gutter-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface dark:bg-dark-surface flex flex-col">
              <span className="font-label text-label-xs text-light-on-surface-variant dark:text-dark-on-surface-variant uppercase tracking-wider">
                Tanggal Pembayaran
              </span>
              <span className="font-body text-body-md font-medium mt-0.5 tabular-nums text-light-on-surface dark:text-dark-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base text-light-tertiary dark:text-dark-tertiary" aria-hidden="true">event</span>
                <span>{transaction.tanggal}</span>
              </span>
            </div>

            {/* Kode Rekening */}
            <div className="p-gutter-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface dark:bg-dark-surface flex flex-col">
              <span className="font-label text-label-xs text-light-on-surface-variant dark:text-dark-on-surface-variant uppercase tracking-wider">
                Kode Rekening Kas
              </span>
              <span className="font-mono text-mono-sm font-semibold mt-0.5 text-light-on-surface dark:text-dark-on-surface">
                {transaction.kode_rekening}
              </span>
            </div>

          </div>

          {/* Full Transaction Description */}
          <div className="p-gutter-md rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface dark:bg-dark-surface flex flex-col gap-1">
            <span className="font-label text-label-xs text-light-on-surface-variant dark:text-dark-on-surface-variant uppercase tracking-wider">
              Uraian Lengkap Transaksi
            </span>
            <p className="font-body text-body-sm sm:text-body-md text-light-on-surface dark:text-dark-on-surface leading-relaxed">
              {transaction.uraian_transaksi}
            </p>
          </div>

          {/* Berita Acara (BA / BAP) Card */}
          <div className="p-gutter-md rounded-lg border-2 border-indigo/40 bg-indigo/5 dark:bg-indigo/10 flex flex-col gap-gutter-sm transition-all">
            <div className="flex items-center justify-between gap-gutter-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-title-lg text-indigo dark:text-indigo-400" aria-hidden="true">
                  assignment
                </span>
                <div>
                  <h3 className="font-headline text-title-md font-bold text-light-on-surface dark:text-dark-on-surface">
                    Berita Acara Rekonsiliasi (BA)
                  </h3>
                  <span className="font-body text-body-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    Nomor register arsip dokumen Berita Acara Penerimaan
                  </span>
                </div>
              </div>

              {isLoggedIn && !isEditingBA && (
                <button
                  type="button"
                  onClick={() => setIsEditingBA(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-indigo/40 text-indigo dark:text-indigo-300 hover:bg-indigo/10 font-label text-label-xs font-semibold transition-colors flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-sm" aria-hidden="true">edit</span>
                  <span>{transaction.berita_acara ? 'Ubah BA' : '+ Tambah BA'}</span>
                </button>
              )}
            </div>

            {/* BA Content or Edit Form */}
            {isEditingBA ? (
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-1 animate-in fade-in duration-150">
                <input
                  type="text"
                  value={baInput}
                  onChange={(e) => setBaInput(e.target.value)}
                  placeholder="Contoh: BA-UPTD/2026/XI/089 atau No. BAP"
                  className="flex-1 w-full px-3 py-2 rounded border border-indigo focus:ring-2 focus:ring-indigo bg-light-surface dark:bg-dark-surface font-mono text-mono-sm text-light-on-surface dark:text-dark-on-surface"
                  autoFocus
                />
                <div className="flex items-center gap-1.5 self-end sm:self-auto w-full sm:w-auto">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={handleSaveBA}
                    className="flex-1 sm:flex-initial px-3.5 py-2 rounded bg-indigo text-white font-label text-label-sm font-semibold hover:bg-indigo/90 shadow-sm disabled:opacity-50"
                  >
                    {isSaving ? 'Menyimpan...' : 'Simpan BA'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBaInput(transaction.berita_acara || '');
                      setIsEditingBA(false);
                    }}
                    className="px-3 py-2 rounded border border-light-outline-variant dark:border-dark-outline-variant font-label text-label-sm text-light-on-surface-variant hover:bg-light-surface-container"
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : transaction.berita_acara ? (
              <div className="flex items-center justify-between gap-2 p-3 rounded bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-indigo/20">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-emerald" aria-hidden="true">verified</span>
                  <div>
                    <span className="font-mono text-title-md font-bold text-indigo dark:text-indigo-400 block tracking-wide">
                      {transaction.berita_acara}
                    </span>
                    <span className="font-body text-body-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      Terverifikasi dan tercatat dalam berkas Berita Acara
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant/60 flex items-center justify-between gap-2">
                <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant italic">
                  Belum ada nomor Berita Acara terlampir untuk transaksi ini.
                </span>
                {!isLoggedIn && (
                  <span className="font-label text-label-xs text-amber-600 dark:text-amber-400">
                    Masuk untuk mengedit BA
                  </span>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <footer className="p-gutter-md sm:p-gutter-lg border-t border-light-outline-variant dark:border-dark-outline-variant flex items-center justify-between gap-gutter-sm bg-light-surface-container-low/40 dark:bg-dark-surface-container/40">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded border border-light-outline-variant dark:border-dark-outline-variant text-light-on-surface hover:bg-light-surface-container dark:hover:bg-dark-surface-container font-label text-label-sm transition-colors"
            title="Cetak Tanda Terima"
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true">print</span>
            <span>Cetak Tanda Terima</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded bg-light-primary text-light-on-primary dark:bg-dark-primary dark:text-dark-on-primary font-label text-label-sm font-semibold hover:opacity-90 shadow-sm transition-opacity"
          >
            Tutup
          </button>
        </footer>

      </div>
    </div>
  );
}
