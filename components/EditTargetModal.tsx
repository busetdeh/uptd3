'use client';

import React from 'react';
import { TargetBudget } from '@/lib/types';
import { formatRupiah } from './KPICards';

interface EditTargetModalProps {
  isOpen: boolean;
  currentTarget: TargetBudget;
  onClose: () => void;
  onSuccess: (updated: TargetBudget) => void;
}

export default function EditTargetModal({
  isOpen,
  currentTarget,
  onClose,
  onSuccess,
}: EditTargetModalProps) {
  const [totalTarget, setTotalTarget] = React.useState<number>(currentTarget.total_target);
  const [targetHarian, setTargetHarian] = React.useState<number>(currentTarget.target_harian);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setTotalTarget(currentTarget.total_target);
      setTargetHarian(currentTarget.target_harian);
      setErrorMessage(null);
    }
  }, [isOpen, currentTarget]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalTarget <= 0 || targetHarian <= 0) {
      setErrorMessage('Nominal target harus bernilai lebih dari 0.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tahun: currentTarget.tahun,
          bulan: currentTarget.bulan,
          total_target: totalTarget,
          target_harian: targetHarian,
        }),
      });

      const json = await res.json();
      if (json.success) {
        onSuccess(json.data);
        onClose();
      } else {
        setErrorMessage(json.message || 'Gagal menyimpan target');
      }
    } catch {
      setErrorMessage('Terjadi gangguan jaringan saat memperbarui target.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle ESC key to close modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const setPreset = (total: number, harian: number) => {
    setTotalTarget(total);
    setTargetHarian(harian);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-gutter-sm sm:p-gutter-md bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-md bg-light-surface-container-lowest dark:bg-dark-surface-container-low text-light-on-surface dark:text-dark-on-surface border border-light-outline-variant dark:border-dark-outline-variant shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-100 cursor-default"
      >
        
        {/* Modal Header */}
        <header className="flex items-start justify-between gap-gutter-md p-gutter-md sm:p-gutter-lg border-b border-light-outline-variant dark:border-dark-outline-variant">
          <div className="flex items-center gap-gutter-sm">
            <div className="w-9 h-9 rounded bg-light-primary text-light-on-primary dark:bg-dark-primary dark:text-dark-on-primary flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-title-md" aria-hidden="true">edit_note</span>
            </div>
            <div>
              <h2 className="font-headline text-headline-md leading-tight">Ubah Target Anggaran</h2>
              <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                Pagu periode {currentTarget.bulan ? `Bulan ${currentTarget.bulan} - ` : ''}Tahun {currentTarget.tahun}
              </p>
            </div>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-gutter-md sm:p-gutter-lg flex flex-col gap-gutter-md">
          
          {/* Quick Preset Buttons */}
          <div className="flex flex-col gap-gutter-xs">
            <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Pilihan Cepat Pagu Target:
            </span>
            <div className="grid grid-cols-3 gap-gutter-xs">
              <button
                type="button"
                onClick={() => setPreset(800000000, 26666667)}
                className="px-gutter-sm py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant font-label text-label-sm hover:border-indigo transition-colors text-left"
              >
                800 Juta <span className="text-[10px] text-light-on-surface-variant block">Harian: 26.6 Jt</span>
              </button>
              <button
                type="button"
                onClick={() => setPreset(1000000000, 33333333)}
                className="px-gutter-sm py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant font-label text-label-sm hover:border-indigo transition-colors text-left"
              >
                1 Miliar <span className="text-[10px] text-light-on-surface-variant block">Harian: 33.3 Jt</span>
              </button>
              <button
                type="button"
                onClick={() => setPreset(1500000000, 50000000)}
                className="px-gutter-sm py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant font-label text-label-sm hover:border-indigo transition-colors text-left"
              >
                1.5 Miliar <span className="text-[10px] text-light-on-surface-variant block">Harian: 50 Jt</span>
              </button>
              <button
                type="button"
                onClick={() => setPreset(2000000000, 66666667)}
                className="px-gutter-sm py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant font-label text-label-sm hover:border-indigo transition-colors text-left"
              >
                2 Miliar <span className="text-[10px] text-light-on-surface-variant block">Harian: 66.6 Jt</span>
              </button>
              <button
                type="button"
                onClick={() => setPreset(2500000000, 83333333)}
                className="px-gutter-sm py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant font-label text-label-sm hover:border-indigo transition-colors text-left"
              >
                2.5 Miliar <span className="text-[10px] text-light-on-surface-variant block">Harian: 83.3 Jt</span>
              </button>
              <button
                type="button"
                onClick={() => setPreset(3000000000, 100000000)}
                className="px-gutter-sm py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant font-label text-label-sm hover:border-indigo transition-colors text-left"
              >
                3 Miliar <span className="text-[10px] text-light-on-surface-variant block">Harian: 100 Jt</span>
              </button>
            </div>
          </div>

          {/* Input Total Target */}
          <div className="flex flex-col gap-gutter-xs">
            <label htmlFor="total-target-input" className="font-label text-label-md">
              Total Target Periode (IDR)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-mono-sm text-light-outline dark:text-dark-outline">
                Rp
              </span>
              <input
                id="total-target-input"
                type="number"
                min="0"
                step="any"
                required
                value={totalTarget}
                onChange={(e) => setTotalTarget(Number(e.target.value))}
                className="w-full pl-10 pr-gutter-md py-2.5 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface dark:bg-dark-surface text-light-on-surface dark:text-dark-on-surface font-body text-body-md focus:outline-none focus:ring-2 focus:ring-indigo transition-colors"
              />
            </div>
            <span className="font-body text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Terbaca: <strong className="text-light-on-surface dark:text-dark-on-surface">{formatRupiah(totalTarget)}</strong>
            </span>
          </div>

          {/* Input Target Harian */}
          <div className="flex flex-col gap-gutter-xs">
            <label htmlFor="daily-target-input" className="font-label text-label-md">
              Target Ambang Harian (Garis Batas Grafik)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-mono-sm text-light-outline dark:text-dark-outline">
                Rp
              </span>
              <input
                id="daily-target-input"
                type="number"
                min="0"
                step="any"
                required
                value={targetHarian}
                onChange={(e) => setTargetHarian(Number(e.target.value))}
                className="w-full pl-10 pr-gutter-md py-2.5 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface dark:bg-dark-surface text-light-on-surface dark:text-dark-on-surface font-body text-body-md focus:outline-none focus:ring-2 focus:ring-indigo transition-colors"
              />
            </div>
            <span className="font-body text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Terbaca: <strong className="text-light-on-surface dark:text-dark-on-surface">{formatRupiah(targetHarian)}</strong> per hari
            </span>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-gutter-sm rounded bg-light-error-container text-light-on-error-container text-body-sm flex items-center gap-gutter-xs">
              <span className="material-symbols-outlined text-title-md">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-gutter-sm pt-gutter-md border-t border-light-outline-variant dark:border-dark-outline-variant">
            <button
              type="button"
              onClick={onClose}
              className="px-gutter-md py-gutter-sm rounded border border-light-outline-variant dark:border-dark-outline-variant font-label text-label-md"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-gutter-md py-gutter-sm rounded bg-light-primary text-light-on-primary dark:bg-dark-primary dark:text-dark-on-primary font-label text-label-md shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
