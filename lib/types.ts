export interface Transaction {
  id: string;
  tanggal: string; // YYYY-MM-DD
  kode_rekening: string;
  nama_kategori: string;
  uraian_transaksi: string;
  nominal: number;
  nomor_bukti: string;
  status: 'Terverifikasi' | 'Menunggu Rekonsiliasi' | 'Dibatalkan';
  created_at: string;
}

export interface TargetBudget {
  tahun: number;
  bulan?: number; // 1-12, optional for annual
  total_target: number;
  target_harian: number;
}

export type TimeFilterMode = 'harian' | 'bulanan' | 'tahunan' | 'kustom';

export interface FilterState {
  mode: TimeFilterMode;
  year: number;
  month: number; // 1-12
  singleDate?: string;
  startDate?: string;
  endDate?: string;
  searchQuery: string;
  categoryFilter?: string;
}

export interface CSVParseRow {
  tanggal?: string;
  kode_rekening?: string;
  nama_kategori?: string;
  uraian_transaksi?: string;
  nominal?: string | number;
  nomor_bukti?: string;
}

export interface CSVValidationError {
  row: number;
  message: string;
  field: string;
  rawValue: unknown;
}

export interface CSVValidationResult {
  validRows: Omit<Transaction, 'id' | 'created_at'>[];
  errors: CSVValidationError[];
  totalRows: number;
}
