'use client';

import React from 'react';
import Header from '@/components/Header';
import KPICards from '@/components/KPICards';
import TrendChart from '@/components/TrendChart';
import CategoryDonut from '@/components/CategoryDonut';
import TransactionTable from '@/components/TransactionTable';
import CSVImportModal from '@/components/CSVImportModal';
import { FilterState, Transaction, TargetBudget } from '@/lib/types';

interface SummaryData {
  totalRealisasi: number;
  targetNominal: number;
  persentaseCapaian: number;
  sisaTarget: number;
  surplus: number;
  categoryBreakdown: { name: string; total: number; percentage: number }[];
  dailyTrend: { date: string; fullDate: string; realisasi: number; targetHarian: number }[];
  count: number;
}

export default function DashboardPage() {
  const [filters, setFilters] = React.useState<FilterState>({
    mode: 'bulanan',
    year: 2026,
    month: 11,
    searchQuery: '',
  });

  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [summary, setSummary] = React.useState<SummaryData>({
    totalRealisasi: 0,
    targetNominal: 1500000000,
    persentaseCapaian: 0,
    sisaTarget: 1500000000,
    surplus: 0,
    categoryBreakdown: [],
    dailyTrend: [],
    count: 0,
  });
  const [target, setTarget] = React.useState<TargetBudget>({
    tahun: 2026,
    bulan: 11,
    total_target: 1500000000,
    target_harian: 50000000,
  });

  const [isLoading, setIsLoading] = React.useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Fetch transactions based on filter state
  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('mode', filters.mode);
      params.set('year', String(filters.year));
      params.set('month', String(filters.month));
      if (filters.singleDate) params.set('singleDate', filters.singleDate);
      if (filters.startDate) params.set('startDate', filters.startDate);
      if (filters.endDate) params.set('endDate', filters.endDate);
      if (filters.searchQuery) params.set('q', filters.searchQuery);
      if (filters.categoryFilter) params.set('category', filters.categoryFilter);

      const res = await fetch(`/api/transactions?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setTransactions(json.data);
        setSummary(json.summary);
        setTarget(json.target);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle CSV Export
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      alert('Tidak ada data untuk diekspor pada filter aktif.');
      return;
    }

    const headers = ['Tanggal', 'Kode Rekening', 'Nama Kategori', 'Uraian Transaksi', 'Nominal', 'Nomor Bukti', 'Status'];
    const rows = transactions.map((t) => [
      t.tanggal,
      t.kode_rekening,
      `"${t.nama_kategori}"`,
      `"${t.uraian_transaksi.replace(/"/g, '""')}"`,
      t.nominal,
      t.nomor_bukti,
      t.status,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rekap_pendapatan_${filters.year}_${filters.month}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-light-surface text-light-on-surface dark:bg-dark-surface dark:text-dark-on-surface transition-colors">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-gutter-md py-gutter-sm rounded bg-light-primary text-light-on-primary dark:bg-dark-primary dark:text-dark-on-primary shadow-xl font-label text-label-md flex items-center gap-gutter-sm animate-in slide-in-from-bottom duration-200">
          <span className="material-symbols-outlined text-title-md text-emerald" aria-hidden="true">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        filters={filters}
        onFilterChange={(newFilters) => setFilters((prev) => ({ ...prev, ...newFilters }))}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onExportData={handleExportCSV}
        isAutosyncing={isLoading}
      />

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-gutter-md lg:px-gutter-lg py-gutter-md lg:py-gutter-lg flex flex-col gap-gutter-md lg:gap-gutter-lg">
        
        {/* Top KPI Cards (Target, Realisasi, %, Sisa) */}
        <KPICards
          totalRealisasi={summary.totalRealisasi}
          targetAnggaran={summary.targetNominal}
          persentaseCapaian={summary.persentaseCapaian}
          sisaTarget={summary.sisaTarget}
          surplus={summary.surplus}
        />

        {/* Charts Section: Left (Dual-Axis Trend) & Right (Donut Category) */}
        <section aria-label="Grafik Tren dan Proporsi Pendapatan" className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-sm lg:gap-gutter-md items-stretch">
          <TrendChart
            data={summary.dailyTrend}
            activeMode={filters.mode}
            onModeChange={(mode) => setFilters((prev) => ({ ...prev, mode }))}
            targetHarian={target.target_harian}
          />
          <CategoryDonut categories={summary.categoryBreakdown} />
        </section>

        {/* Bottom Section: Transaction Table & Card List */}
        <TransactionTable
          transactions={transactions}
          searchQuery={filters.searchQuery}
          onSearchChange={(q) => setFilters((prev) => ({ ...prev, searchQuery: q }))}
        />

      </main>

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={(count) => {
          showToast(`Berhasil mengimpor dan menyinkronkan ${count} transaksi!`);
          loadData();
        }}
      />

    </div>
  );
}
