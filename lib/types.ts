export interface Transaction {
  id: string;
  tanggal: string; // YYYY-MM-DD
  kode_rekening: string;
  nama_kategori: string;
  kelurahan?: string;
  wajib_pajak?: string;
  uraian_transaksi: string;
  nominal: number;
  nomor_bukti: string;
  status: 'Terverifikasi' | 'Menunggu Rekonsiliasi' | 'Dibatalkan';
  berita_acara?: string;
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
  // Standard fields
  tanggal?: string;
  kode_rekening?: string;
  nama_kategori?: string;
  uraian_transaksi?: string;
  nominal?: string | number;
  nomor_bukti?: string;

  // PBB / Pajak & Retribusi custom fields from user tables
  no?: string | number;
  wajib_pajak?: string;
  kelurahan?: string;
  desa?: string;
  nop?: string;
  tanggal_bayar?: string;
  tgl_bayar?: string;
  jumlah_pembayaran?: string | number;
  jumlah?: string | number;
  keterangan?: string;
  berita_acara?: string;
  no_berita_acara?: string;
  nomor_berita_acara?: string;
  ba?: string;
  no_ba?: string;
  bap?: string;
  [key: string]: unknown;
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
