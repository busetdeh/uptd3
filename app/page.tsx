'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import KPICards from '@/components/KPICards';
import TransactionTable from '@/components/TransactionTable';
import CSVImportModal from '@/components/CSVImportModal';
import EditTargetModal from '@/components/EditTargetModal';
import { FilterState, Transaction, TargetBudget } from '@/lib/types';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { getClientAuth, clearClientAuth, AuthUser } from '@/lib/auth';

const TrendChart = dynamic(() => import('@/components/TrendChart'), {
  ssr: false,
  loading: () => (
    <div className="lg:col-span-8 h-72 bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant rounded-md animate-pulse flex items-center justify-center text-body-sm text-light-on-surface-variant">
      Memuat grafik tren...
    </div>
  ),
});

const CategoryDonut = dynamic(() => import('@/components/CategoryDonut'), {
  ssr: false,
  loading: () => (
    <div className="lg:col-span-4 h-72 bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant rounded-md animate-pulse flex items-center justify-center text-body-sm text-light-on-surface-variant">
      Memuat proporsi kategori...
    </div>
  ),
});

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
  const [isRealtimeConnected, setIsRealtimeConnected] = React.useState(false);
  const [authUser, setAuthUser] = React.useState<AuthUser | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);
  const [isEditTargetModalOpen, setIsEditTargetModalOpen] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Check login state on mount
  React.useEffect(() => {
    setAuthUser(getClientAuth());
  }, []);

  const handleLogout = () => {
    clearClientAuth();
    setAuthUser(null);
    showToast('Anda telah keluar dari sesi.');
  };

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

  // Supabase Realtime WebSocket listener
  React.useEffect(() => {
    if (!isSupabaseConfigured()) {
      setIsRealtimeConnected(false);
      return;
    }

    const channel = supabase
      .channel('realtime:dashboard_data')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        (payload) => {
          console.log('Realtime transactions change received:', payload);
          loadData();
          showToast(`⚡ Realtime: Data transaksi baru tersinkronisasi!`);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'targets' },
        (payload) => {
          console.log('Realtime targets change received:', payload);
          loadData();
          showToast(`⚡ Realtime: Target Anggaran berhasil diperbarui!`);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsRealtimeConnected(true);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
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
      `"${(t.uraian_transaksi || '').replace(/"/g, '""')}"`,
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
        onOpenImportModal={() => {
          if (!authUser) {
            showToast('Silakan masuk terlebih dahulu untuk mengimpor CSV.');
            window.location.href = '/login';
            return;
          }
          setIsImportModalOpen(true);
        }}
        onExportData={handleExportCSV}
        isAutosyncing={isLoading}
        isRealtimeConnected={isRealtimeConnected}
        isLoggedIn={Boolean(authUser)}
        username={authUser?.displayName || authUser?.username}
        role={authUser?.role}
        onLogout={handleLogout}
      />

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-gutter-md lg:px-gutter-lg py-gutter-md lg:py-gutter-lg pb-28 md:pb-gutter-lg flex flex-col gap-gutter-md lg:gap-gutter-lg">
        
        {/* Top KPI Cards (Target, Realisasi, %, Sisa) */}
        <KPICards
          totalRealisasi={summary.totalRealisasi}
          targetAnggaran={summary.targetNominal}
          persentaseCapaian={summary.persentaseCapaian}
          sisaTarget={summary.sisaTarget}
          surplus={summary.surplus}
          onEditTarget={authUser ? () => setIsEditTargetModalOpen(true) : undefined}
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
          onDataChanged={() => {
            loadData();
            showToast('Data transaksi berhasil diperbarui');
          }}
          isLoggedIn={Boolean(authUser)}
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

      {/* Edit Target Anggaran Modal */}
      <EditTargetModal
        isOpen={isEditTargetModalOpen}
        currentTarget={target}
        onClose={() => setIsEditTargetModalOpen(false)}
        onSuccess={(updated) => {
          showToast(`Target Anggaran berhasil diperbarui: Rp ${updated.total_target.toLocaleString('id-ID')}`);
          loadData();
        }}
      />

    </div>
  );
}
