import { NextRequest, NextResponse } from 'next/server';
import { validateAndParseCSV } from '@/lib/csv';
import { getTransactions, saveTransactions } from '@/lib/data';
import { Transaction } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const csvContent = formData.get('csvContent') as string | null;
    const preventDuplicates = formData.get('preventDuplicates') === 'true';

    let textData = '';
    if (file) {
      textData = await file.text();
    } else if (csvContent) {
      textData = csvContent;
    } else {
      return NextResponse.json(
        { success: false, message: 'Berkas CSV atau konten CSV tidak ditemukan' },
        { status: 400 }
      );
    }

    const result = validateAndParseCSV(textData);

    if (result.validRows.length === 0 && result.errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Format berkas CSV tidak valid atau tidak memiliki baris data yang benar.',
          errors: result.errors,
          totalRows: result.totalRows,
        },
        { status: 422 }
      );
    }

    const existingTransactions = await getTransactions();
    const existingProofNumbers = new Set(
      existingTransactions.map((tx) => tx.nomor_bukti?.toLowerCase())
    );

    const toInsert: Transaction[] = [];
    let skippedDuplicatesCount = 0;

    for (const row of result.validRows) {
      if (preventDuplicates && existingProofNumbers.has(row.nomor_bukti?.toLowerCase())) {
        skippedDuplicatesCount++;
        continue;
      }

      toInsert.push({
        ...row,
        id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        created_at: new Date().toISOString(),
      });
    }

    if (toInsert.length > 0) {
      const updatedList = [...toInsert, ...existingTransactions];
      await saveTransactions(updatedList);
    }

    return NextResponse.json({
      success: true,
      message: `${toInsert.length} data transaksi berhasil diimpor dan disinkronkan.${
        skippedDuplicatesCount > 0 ? ` (${skippedDuplicatesCount} data duplikat dilewati)` : ''
      }`,
      importedCount: toInsert.length,
      skippedDuplicatesCount,
      errors: result.errors,
      totalRowsInCSV: result.totalRows,
    });
  } catch (error) {
    console.error('Import CSV error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan sistem saat memproses berkas CSV' },
      { status: 500 }
    );
  }
}
