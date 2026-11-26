import fs from 'fs';
import path from 'path';
import { Transaction, TargetBudget, FilterState } from './types';
import { isSupabaseConfigured, supabase } from './supabase';

const dataDir = path.join(process.cwd(), 'data');
const transactionsFile = path.join(dataDir, 'transactions.json');
const targetsFile = path.join(dataDir, 'targets.json');

// Synchronous fallback helper for local JSON
export function getLocalTransactions(): Transaction[] {
  try {
    if (!fs.existsSync(transactionsFile)) return [];
    const content = fs.readFileSync(transactionsFile, 'utf-8');
    return JSON.parse(content) as Transaction[];
  } catch (error) {
    console.error('Error reading local transactions:', error);
    return [];
  }
}

export function saveLocalTransactions(transactions: Transaction[]): boolean {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(transactionsFile, JSON.stringify(transactions, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error saving local transactions:', error);
    return false;
  }
}

// Async Fetch Transactions (Supabase with Local Fallback)
export async function getTransactions(): Promise<Transaction[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('tanggal', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as Transaction[];
      }

      if (!error && data && data.length === 0) {
        const local = getLocalTransactions();
        if (local.length > 0) {
          return local;
        }
        return [];
      }
      console.warn('Supabase fetch failed, falling back to local:', error?.message);
    } catch (e) {
      console.warn('Supabase query error, falling back to local:', e);
    }
  }

  return getLocalTransactions();
}

// Async Save Transactions (Supabase with Local Fallback)
export async function saveTransactions(transactions: Transaction[]): Promise<boolean> {
  // Deduplikasi array berdasarkan nomor_bukti agar tidak memicu error PostgreSQL ON CONFLICT
  const uniqueMap = new Map<string, Transaction>();
  transactions.forEach((tx) => {
    const key = tx.nomor_bukti || tx.id;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, tx);
    }
  });
  const dedupedTransactions = Array.from(uniqueMap.values());

  // Always update local file as backup
  saveLocalTransactions(dedupedTransactions);

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('transactions')
        .upsert(dedupedTransactions, { onConflict: 'nomor_bukti' });

      if (error) {
        console.warn('Supabase save error:', error.message);
        // Fallback: jika kolom kelurahan belum dibuat di tabel Supabase, simpan tanpa field kelurahan
        if (error.message.includes('kelurahan') || (error as { code?: string }).code === 'PGRST204') {
          const sanitized = dedupedTransactions.map(({ kelurahan, ...rest }) => rest);
          const { error: retryError } = await supabase
            .from('transactions')
            .upsert(sanitized, { onConflict: 'nomor_bukti' });
          if (!retryError) return true;
          console.error('Supabase retry upsert error:', retryError.message);
        }
        return false;
      }
      return true;
    } catch (e) {
      console.error('Supabase upsert exception:', e);
      return false;
    }
  }

  return true;
}

// Target Budget
export async function getTargetBudget(): Promise<TargetBudget> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('targets')
        .select('*')
        .eq('tahun', 2026)
        .eq('bulan', 11)
        .single();

      if (!error && data) {
        return {
          tahun: data.tahun,
          bulan: data.bulan,
          total_target: Number(data.total_target),
          target_harian: Number(data.target_harian),
        };
      }
    } catch (e) {
      console.warn('Supabase target fetch error, using local:', e);
    }
  }

  try {
    if (!fs.existsSync(targetsFile)) {
      return {
        tahun: 2026,
        bulan: 11,
        total_target: 1500000000,
        target_harian: 50000000,
      };
    }
    const content = fs.readFileSync(targetsFile, 'utf-8');
    return JSON.parse(content) as TargetBudget;
  } catch {
    return {
      tahun: 2026,
      bulan: 11,
      total_target: 1500000000,
      target_harian: 50000000,
    };
  }
}

export function filterTransactions(transactions: Transaction[], filters: FilterState): Transaction[] {
  return transactions.filter((tx) => {
    // 1. Search filter
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchSearch =
        tx.nomor_bukti?.toLowerCase().includes(q) ||
        tx.nama_kategori?.toLowerCase().includes(q) ||
        tx.uraian_transaksi?.toLowerCase().includes(q) ||
        tx.tanggal?.includes(q);
      if (!matchSearch) return false;
    }

    // 2. Category filter
    if (filters.categoryFilter && filters.categoryFilter !== 'Semua') {
      if (tx.nama_kategori !== filters.categoryFilter) return false;
    }

    // 3. Time filter
    const txDate = new Date(tx.tanggal);
    const txYear = txDate.getFullYear();
    const txMonth = txDate.getMonth() + 1;

    if (filters.mode === 'harian') {
      if (filters.singleDate) {
        return tx.tanggal === filters.singleDate;
      }
    } else if (filters.mode === 'bulanan') {
      if (filters.year && filters.month) {
        return txYear === filters.year && txMonth === filters.month;
      }
    } else if (filters.mode === 'tahunan') {
      if (filters.year) {
        return txYear === filters.year;
      }
    } else if (filters.mode === 'kustom') {
      if (filters.startDate && tx.tanggal < filters.startDate) return false;
      if (filters.endDate && tx.tanggal > filters.endDate) return false;
      return true;
    }

    return true;
  });
}

export function calculateSummary(transactions: Transaction[], target: TargetBudget) {
  const totalRealisasi = transactions.reduce((sum, tx) => sum + Number(tx.nominal || 0), 0);
  const targetNominal = target.total_target;
  const persentaseCapaian = targetNominal > 0 ? (totalRealisasi / targetNominal) * 100 : 0;
  const sisaTarget = Math.max(0, targetNominal - totalRealisasi);
  const surplus = totalRealisasi > targetNominal ? totalRealisasi - targetNominal : 0;

  // Category breakdown
  const categoryMap: Record<string, number> = {};
  for (const tx of transactions) {
    categoryMap[tx.nama_kategori] = (categoryMap[tx.nama_kategori] || 0) + Number(tx.nominal || 0);
  }

  const categoryBreakdown = Object.entries(categoryMap).map(([name, total]) => ({
    name,
    total,
    percentage: totalRealisasi > 0 ? Math.round((total / totalRealisasi) * 100) : 0,
  }));

  // Daily timeline
  const dailyMap: Record<string, number> = {};
  for (const tx of transactions) {
    dailyMap[tx.tanggal] = (dailyMap[tx.tanggal] || 0) + Number(tx.nominal || 0);
  }

  const dailyTrend = Object.entries(dailyMap)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, total]) => ({
      date: date.substring(5), // MM-DD
      fullDate: date,
      realisasi: total,
      targetHarian: target.target_harian,
    }));

  return {
    totalRealisasi,
    targetNominal,
    persentaseCapaian: Number(persentaseCapaian.toFixed(1)),
    sisaTarget,
    surplus,
    categoryBreakdown,
    dailyTrend,
    count: transactions.length,
  };
}
