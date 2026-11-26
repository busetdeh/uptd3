import Papa from 'papaparse';
import { CSVParseRow, CSVValidationError, CSVValidationResult, Transaction } from './types';

function parseFlexibleDate(rawDate: string): string | null {
  const clean = rawDate.trim();
  if (!clean) return null;

  // Handle DD-MM-YYYY or DD/MM/YYYY (e.g. 09-11-2026 or 09/11/2026)
  if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(clean)) {
    const separator = clean.includes('-') ? '-' : '/';
    const parts = clean.split(separator);
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }

  // Handle YYYY-MM-DD or YYYY/MM/DD
  if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(clean)) {
    const separator = clean.includes('-') ? '-' : '/';
    const parts = clean.split(separator);
    const year = parts[0];
    const month = parts[1].padStart(2, '0');
    const day = parts[2].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const parsed = Date.parse(clean);
  if (!isNaN(parsed)) {
    return new Date(parsed).toISOString().split('T')[0];
  }

  return null;
}

function parseFlexibleNominal(raw: unknown): number | null {
  if (typeof raw === 'number') return raw > 0 ? raw : null;
  if (!raw) return null;

  let str = String(raw).trim();

  // Handle currency symbols
  str = str.replace(/^(Rp\.?|IDR)\s*/i, '');

  // Detect format:
  // e.g. "2,139,598.00" -> comma thousands, dot decimal
  if (/,\d{3}/.test(str) && /\.\d{2}$/.test(str)) {
    str = str.replace(/,/g, '');
  } else if (/\.\d{3}/.test(str) && /,\d{2}$/.test(str)) {
    // Indonesian format: "2.139.598,00" -> dot thousands, comma decimal
    str = str.replace(/\./g, '').replace(',', '.');
  } else if (str.includes(',') && !str.includes('.')) {
    // e.g. "2,139,598" or "2139598,00"
    if (/,\d{3}/.test(str)) {
      str = str.replace(/,/g, '');
    } else {
      str = str.replace(',', '.');
    }
  } else if (str.includes(',')) {
    str = str.replace(/,/g, '');
  }

  // Remove any remaining invalid characters except dot and digits
  const cleaned = str.replace(/[^0-9.-]+/g, '');
  const num = parseFloat(cleaned);
  return !isNaN(num) && num > 0 ? num : null;
}

export function validateAndParseCSV(csvText: string): CSVValidationResult {
  const parsed = Papa.parse<CSVParseRow>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) =>
      h.trim().toLowerCase().replace(/[\s\.\/_-]+/g, '_'),
  });

  const validRows: Omit<Transaction, 'id' | 'created_at'>[] = [];
  const errors: CSVValidationError[] = [];

  parsed.data.forEach((row, index) => {
    const rowNum = index + 2; // header is row 1

    // 1. Resolve Tanggal
    const rawDate =
      (row.tanggal_bayar as string) ||
      (row.tgl_bayar as string) ||
      (row.tanggal as string) ||
      (row.tgl as string) ||
      '';

    const formattedDate = parseFlexibleDate(rawDate);
    if (!formattedDate) {
      errors.push({
        row: rowNum,
        field: 'tanggal',
        message: 'Format tanggal bayar tidak valid (gunakan DD-MM-YYYY atau YYYY-MM-DD)',
        rawValue: rawDate,
      });
      return;
    }

    // 2. Resolve Nominal
    const rawNominal =
      row.jumlah_pembayaran ??
      row.nominal ??
      row.jumlah ??
      row.total_bayar ??
      row.bayar;

    const nominal = parseFlexibleNominal(rawNominal);
    if (!nominal) {
      errors.push({
        row: rowNum,
        field: 'nominal',
        message: 'Jumlah pembayaran / nominal harus berupa angka lebih dari 0',
        rawValue: rawNominal,
      });
      return;
    }

    // 3. Resolve Wajib Pajak & Uraian
    const wajibPajak = (row.wajib_pajak as string)?.trim();
    const keterangan = (row.keterangan as string)?.trim();
    const nop = (row.nop as string)?.trim();

    let uraian = (row.uraian_transaksi as string)?.trim() || '';
    if (!uraian) {
      if (wajibPajak) {
        uraian = `Pembayaran PBB: ${wajibPajak}${keterangan ? ` (Th: ${keterangan})` : ''}`;
      } else if (keterangan) {
        uraian = keterangan;
      } else {
        uraian = 'Penerimaan Setoran Pajak Daerah';
      }
    }

    // 4. Resolve Kategori & Kode Rekening
    let kategori = (row.nama_kategori as string)?.trim();
    if (!kategori) {
      kategori = nop ? 'PBB-P2' : 'Pajak & Retribusi Daerah';
    }

    let kodeRekening = (row.kode_rekening as string)?.trim();
    if (!kodeRekening) {
      kodeRekening = nop ? '4.1.1.01.01' : '4.1.2.01.01';
    }

    // 5. Resolve Nomor Bukti / NOP
    const nomorBukti =
      (row.nomor_bukti as string)?.trim() ||
      (nop ? `NOP-${nop}` : `STS-${formattedDate.replace(/-/g, '')}-${index + 1}`);

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
