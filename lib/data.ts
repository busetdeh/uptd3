import fs from 'fs';
import path from 'path';
import { Transaction, TargetBudget, FilterState } from './types';

const dataDir = path.join(process.cwd(), 'data');
const transactionsFile = path.join(dataDir, 'transactions.json');
const targetsFile = path.join(dataDir, 'targets.json');

export function getTransactions(): Transaction[] {
  try {
    if (!fs.existsSync(transactionsFile)) {
      return [];
    }
    const content = fs.readFileSync(transactionsFile, 'utf-8');
    return JSON.parse(content) as Transaction[];
  } catch (error) {
    console.error('Error reading transactions:', error);
    return [];
  }
}

export function saveTransactions(transactions: Transaction[]): boolean {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(transactionsFile, JSON.stringify(transactions, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error saving transactions:', error);
    return false;
  }
}

export function getTargetBudget(): TargetBudget {
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
  } catch (error) {
    console.error('Error reading target:', error);
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
        tx.nomor_bukti.toLowerCase().includes(q) ||
        tx.nama_kategori.toLowerCase().includes(q) ||
        tx.uraian_transaksi.toLowerCase().includes(q) ||
        tx.tanggal.includes(q);
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
  const totalRealisasi = transactions.reduce((sum, tx) => sum + tx.nominal, 0);
  const targetNominal = target.total_target;
  const persentaseCapaian = targetNominal > 0 ? (totalRealisasi / targetNominal) * 100 : 0;
  const sisaTarget = Math.max(0, targetNominal - totalRealisasi);
  const surplus = totalRealisasi > targetNominal ? totalRealisasi - targetNominal : 0;

  // Category breakdown
  const categoryMap: Record<string, number> = {};
  for (const tx of transactions) {
    categoryMap[tx.nama_kategori] = (categoryMap[tx.nama_kategori] || 0) + tx.nominal;
  }

  const categoryBreakdown = Object.entries(categoryMap).map(([name, total]) => ({
    name,
    total,
    percentage: totalRealisasi > 0 ? Math.round((total / totalRealisasi) * 100) : 0,
  }));

  // Daily timeline (last 14 days or grouped)
  const dailyMap: Record<string, number> = {};
  for (const tx of transactions) {
    dailyMap[tx.tanggal] = (dailyMap[tx.tanggal] || 0) + tx.nominal;
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
