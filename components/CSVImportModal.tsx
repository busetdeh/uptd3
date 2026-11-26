'use client';

import React from 'react';
import { validateAndParseCSV } from '@/lib/csv';
import { CSVValidationResult } from '@/lib/types';
import { formatRupiah } from './KPICards';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (count: number) => void;
}

export default function CSVImportModal({
  isOpen,
  onClose,
  onSuccess,
}: CSVImportModalProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [isParsing, setIsParsing] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [preventDuplicates, setPreventDuplicates] = React.useState(true);
  const [previewResult, setPreviewResult] = React.useState<CSVValidationResult | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setErrorMessage(null);
    setIsParsing(true);

    try {
      const text = await selectedFile.text();
      const result = validateAndParseCSV(text);
      setPreviewResult(result);
    } catch {
      setErrorMessage('Gagal membaca berkas CSV. Pastikan file dalam format teks CSV.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file && !previewResult) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      }
      formData.append('preventDuplicates', String(preventDuplicates));

      const res = await fetch('/api/import-csv', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        onSuccess(data.importedCount);
        onClose();
      } else {
        setErrorMessage(data.message || 'Gagal mengimpor data');
      }
    } catch {
      setErrorMessage('Terjadi gangguan jaringan saat sinkronisasi CSV.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadSampleTemplate = () => {
    const csvContent =
      'NO,WAJIB PAJAK,KELURAHAN,NOP,TANGGAL BAYAR,JUMLAH PEMBAYARAN,KETERANGAN,BERITA ACARA\n' +
      '1,H SUADAH B H SAI,MEKARSARI,36.72.020.011.003.0302.0,16-11-2026,256868,2020-2026,BA-UPTD/2026/XI/001\n' +
      '2,H MUCLIS,LEBAKGEDE,36.72.020.013.004.0004.0,16-11-2026,280195,2025,BA-UPTD/2026/XI/001\n' +
      '3,SAMTANI,MEKARSARI,36.72.020.011.004.0038.0,16-11-2026,214656,2024-2026,BA-UPTD/2026/XI/002\n' +
      '4,SANAWIRI,MEKARSARI,36.72.020.011.004.0083.0,16-11-2026,352560,2024-2026,BA-UPTD/2026/XI/002\n' +
      '5,RUSDI B TIMAN,LEBAKGEDE,36.72.020.013.005.0008.0,16-11-2026,454720,1995-1999,BA-UPTD/2026/XI/003\n' +
      '6,H NAWAWI,LEBAKGEDE,36.72.020.013.005.0008.0,16-11-2026,2391540,"2007,2009,2011",BA-UPTD/2026/XI/003\n' +
      '7,H MUCHLIS,LEBAKGEDE,36.72.020.013.005.0008.0,16-11-2026,8124581,2025-2026,BA-UPTD/2026/XI/004\n' +
      '8,ANIMAH,LEBAKGEDE,36.72.020.013.007.0243.0,16-11-2026,169600,2025,BA-UPTD/2026/XI/004\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'contoh_data_rekap_pendapatan.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-gutter-sm sm:p-gutter-md bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      
      <div className="w-full max-w-3xl rounded-md bg-light-surface-container-lowest dark:bg-dark-surface-container-low text-light-on-surface dark:text-dark-on-surface border border-light-outline-variant dark:border-dark-outline-variant shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Modal Header */}
        <header className="flex items-start justify-between gap-gutter-md p-gutter-md sm:p-gutter-lg border-b border-light-outline-variant dark:border-dark-outline-variant">
          <div>
            <h2 className="font-headline text-headline-md">Import Transaksi Pendapatan</h2>
            <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant mt-gutter-xs">
              Unggah berkas CSV untuk sinkronisasi otomatis ke basis data rekapitulasi.
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            aria-label="Tutup dialog"
            className="p-gutter-xs rounded text-light-on-surface-variant hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container"
          >
            <span className="material-symbols-outlined text-headline-md" aria-hidden="true">close</span>
          </button>
        </header>

        {/* Modal Scrollable Body */}
        <div className="p-gutter-md sm:p-gutter-lg flex flex-col gap-gutter-md overflow-y-auto">
          
          {/* Top Banner with Download Template Link */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-gutter-xs sm:gap-gutter-sm px-gutter-sm sm:px-gutter-md py-gutter-sm rounded bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant">
            <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Kolom didukung: <code className="font-mono text-xs">NO, WAJIB PAJAK, KELURAHAN, NOP, TANGGAL BAYAR, JUMLAH PEMBAYARAN, KETERANGAN, BERITA ACARA</code>
            </span>
            <button
              onClick={downloadSampleTemplate}
              type="button"
              className="inline-flex items-center gap-gutter-xs font-label text-label-sm sm:text-label-md text-light-tertiary dark:text-dark-tertiary hover:underline self-start sm:self-auto"
            >
              <span className="material-symbols-outlined text-title-md" aria-hidden="true">description</span>
              Unduh Template CSV (.csv)
            </button>
          </div>

          {/* Upload Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-light-outline-variant dark:border-dark-outline-variant rounded-md p-gutter-md sm:p-gutter-lg text-center bg-light-surface dark:bg-dark-surface flex flex-col items-center gap-gutter-xs cursor-pointer hover:border-indigo transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />
            <span className="material-symbols-outlined text-headline-lg sm:text-display-md text-light-tertiary dark:text-dark-tertiary" aria-hidden="true">
              cloud_upload
            </span>
            <p className="font-label text-label-md sm:text-label-lg text-light-on-surface dark:text-dark-on-surface">
              {file ? file.name : 'Tarik & lepas file CSV di sini, atau Ketuk untuk Memilih'}
            </p>
            <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Berkas CSV (Maksimal 10MB)
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-gutter-sm rounded bg-light-error-container text-light-on-error-container dark:bg-dark-error-container dark:text-dark-on-error-container text-body-sm flex items-center gap-gutter-xs">
              <span className="material-symbols-outlined text-title-md">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Preview Section */}
          {previewResult && (
            <div className="flex flex-col gap-gutter-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-gutter-xs sm:gap-gutter-sm">
                <div className="flex items-center gap-gutter-xs">
                  <span className="material-symbols-outlined text-title-md text-light-secondary dark:text-dark-secondary" aria-hidden="true">csv</span>
                  <span className="font-mono text-mono-sm sm:text-mono-md truncate max-w-[200px] sm:max-w-none">
                    {file?.name || 'File CSV Terbaca'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-gutter-xs">
                  <span className="px-gutter-sm py-gutter-xs rounded-full bg-light-surface-container dark:bg-dark-surface-container font-label text-label-sm">
                    {previewResult.totalRows} Baris Ditemukan
                  </span>
                  <span className="px-gutter-sm py-gutter-xs rounded-full bg-light-secondary-container text-light-on-secondary-container dark:bg-dark-secondary-container dark:text-dark-on-secondary-container font-label text-label-sm">
                    {previewResult.validRows.length} Valid
                  </span>
                  {previewResult.errors.length > 0 && (
                    <span className="px-gutter-sm py-gutter-xs rounded-full bg-light-error-container text-light-on-error-container dark:bg-dark-error-container dark:text-dark-on-error-container font-label text-label-sm">
                      {previewResult.errors.length} Anomali
                    </span>
                  )}
                </div>
              </div>

              {/* Preview Table */}
              <div className="border border-light-outline-variant dark:border-dark-outline-variant rounded-md overflow-x-auto max-h-48">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead className="bg-light-surface-container-low dark:bg-dark-surface-container border-b border-light-outline-variant dark:border-dark-outline-variant sticky top-0">
                    <tr>
                      <th className="px-gutter-sm sm:px-gutter-md py-gutter-xs font-label text-label-sm">Tanggal</th>
                      <th className="px-gutter-sm sm:px-gutter-md py-gutter-xs font-label text-label-sm">Kode Rek</th>
                      <th className="px-gutter-sm sm:px-gutter-md py-gutter-xs font-label text-label-sm">Kategori</th>
                      <th className="px-gutter-sm sm:px-gutter-md py-gutter-xs font-label text-label-sm text-right">Nominal</th>
                      <th className="px-gutter-sm sm:px-gutter-md py-gutter-xs font-label text-label-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-light-outline-variant dark:divide-dark-outline-variant">
                    {previewResult.validRows.slice(0, 4).map((row, i) => (
                      <tr key={i}>
                        <td className="px-gutter-sm sm:px-gutter-md py-gutter-xs font-body text-body-sm tabular-nums">{row.tanggal}</td>
                        <td className="px-gutter-sm sm:px-gutter-md py-gutter-xs font-mono text-mono-sm">{row.kode_rekening}</td>
                        <td className="px-gutter-sm sm:px-gutter-md py-gutter-xs font-body text-body-sm">{row.nama_kategori}</td>
                        <td className="px-gutter-sm sm:px-gutter-md py-gutter-xs font-body text-body-sm text-right tabular-nums">{formatRupiah(row.nominal)}</td>
                        <td className="px-gutter-sm sm:px-gutter-md py-gutter-xs">
                          <span className="px-gutter-sm py-0.5 rounded-full bg-light-secondary-container text-light-on-secondary-container font-label text-xs">Valid</span>
                        </td>
                      </tr>
                    ))}
                    {previewResult.errors.map((err, i) => (
                      <tr key={`err-${i}`} className="bg-light-error-container text-light-on-error-container dark:bg-dark-error-container dark:text-dark-on-error-container">
                        <td colSpan={5} className="px-gutter-sm sm:px-gutter-md py-gutter-xs font-body text-body-sm">
                          <span className="font-semibold">Baris {err.row}:</span> {err.message} (Data: {String(err.rawValue)})
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sync Options */}
          <div className="flex flex-col gap-gutter-sm pt-gutter-xs">
            <label className="inline-flex items-center gap-gutter-sm cursor-pointer select-none">
              <input
                type="checkbox"
                checked={preventDuplicates}
                onChange={(e) => setPreventDuplicates(e.target.checked)}
                className="w-4 h-4 rounded border-light-outline-variant text-light-secondary focus:ring-indigo"
              />
              <span className="font-body text-body-sm">
                Lewati baris dengan nomor bukti yang sudah ada (Cegah Duplikasi)
              </span>
            </label>
          </div>

        </div>

        {/* Modal Actions Footer */}
        <footer className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-gutter-xs sm:gap-gutter-sm px-gutter-md sm:px-gutter-lg py-gutter-sm sm:py-gutter-md border-t border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container">
          <button
            onClick={onClose}
            type="button"
            className="px-gutter-md py-gutter-xs sm:py-gutter-sm rounded bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant font-label text-label-md"
          >
            Batal
          </button>
          <button
            disabled={!previewResult || previewResult.validRows.length === 0 || isSubmitting || isParsing}
            onClick={handleSubmit}
            type="button"
            className="px-gutter-md py-gutter-xs sm:py-gutter-sm rounded bg-light-secondary text-light-on-secondary dark:bg-dark-secondary dark:text-dark-on-secondary font-label text-label-md whitespace-nowrap disabled:opacity-40 shadow-sm"
          >
            {isSubmitting ? 'Menyinkronkan...' : `Konfirmasi & Sinkronisasi (${previewResult?.validRows.length || 0} Data)`}
          </button>
        </footer>

      </div>
    </div>
  );
}
