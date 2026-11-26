import Papa from 'papaparse';
import { CSVParseRow, CSVValidationError, CSVValidationResult, Transaction } from './types';

export function validateAndParseCSV(csvText: string): CSVValidationResult {
  const parsed = Papa.parse<CSVParseRow>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase().replace(/[\s_-]+/g, '_'),
  });

  const validRows: Omit<Transaction, 'id' | 'created_at'>[] = [];
  const errors: CSVValidationError[] = [];

  parsed.data.forEach((row, index) => {
    const rowNum = index + 2; // header is row 1

    // 1. Validate Tanggal
    const rawDate = row.tanggal?.trim();
    if (!rawDate) {
      errors.push({
        row: rowNum,
        field: 'tanggal',
        message: 'Kolom tanggal wajib diisi',
        rawValue: rawDate,
      });
      return;
    }

    // Format check (YYYY-MM-DD or DD/MM/YYYY)
    let formattedDate = rawDate;
    if (rawDate.includes('/')) {
      const parts = rawDate.split('/');
      if (parts.length === 3) {
        if (parts[2].length === 4) {
          formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      }
    }

    const isValidDate = !isNaN(Date.parse(formattedDate));
    if (!isValidDate) {
      errors.push({
        row: rowNum,
        field: 'tanggal',
        message: 'Format tanggal tidak valid (gunakan YYYY-MM-DD)',
        rawValue: rawDate,
      });
      return;
    }

    // 2. Validate Nominal
    const rawNominal = String(row.nominal || '').replace(/[^0-9.-]+/g, '');
    const nominal = Number(rawNominal);

    if (isNaN(nominal) || nominal <= 0) {
      errors.push({
        row: rowNum,
        field: 'nominal',
        message: 'Nominal harus berupa angka valid lebih dari 0',
        rawValue: row.nominal,
      });
      return;
    }

    // 3. Category & Kode Rekening
    const kategori = (row.nama_kategori || 'Lain-lain').trim();
    const kodeRekening = (row.kode_rekening || '4.1.2.99.99').trim();
    const uraian = (row.uraian_transaksi || '-').trim();
    const nomorBukti = (row.nomor_bukti || `STS-${Date.now()}-${index + 1}`).trim();

    validRows.push({
      tanggal: formattedDate,
      kode_rekening: kodeRekening,
      nama_kategori: kategori,
      uraian_transaksi: uraian,
      nominal,
      nomor_bukti: nomorBukti,
      status: 'Terverifikasi',
    });
  });

  return {
    validRows,
    errors,
    totalRows: parsed.data.length,
  };
}
