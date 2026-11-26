import { NextRequest, NextResponse } from 'next/server';
import { getTransactions, getTargetBudget, filterTransactions, calculateSummary, saveTransactions } from '@/lib/data';
import { FilterState, Transaction, TimeFilterMode } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const mode = (searchParams.get('mode') || 'bulanan') as TimeFilterMode;
    const year = Number(searchParams.get('year')) || 2026;
    const month = Number(searchParams.get('month')) || 11;
    const singleDate = searchParams.get('singleDate') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const searchQuery = searchParams.get('q') || '';
    const categoryFilter = searchParams.get('category') || undefined;

    const filters: FilterState = {
      mode,
      year,
      month,
      singleDate,
      startDate,
      endDate,
      searchQuery,
      categoryFilter,
    };

    const allTransactions = getTransactions();
    const target = getTargetBudget();
    const filtered = filterTransactions(allTransactions, filters);
    const summary = calculateSummary(filtered, target);

    return NextResponse.json({
      success: true,
      data: filtered,
      summary,
      target,
      filters,
    });
  } catch (error) {
    console.error('API Transactions Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data transaksi' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const all = getTransactions();

    if (Array.isArray(body)) {
      // Bulk insert
      const newTransactions: Transaction[] = body.map((item, idx) => ({
        id: item.id || `tx-${Date.now()}-${idx}`,
        tanggal: item.tanggal,
        kode_rekening: item.kode_rekening,
        nama_kategori: item.nama_kategori,
        uraian_transaksi: item.uraian_transaksi,
        nominal: Number(item.nominal),
        nomor_bukti: item.nomor_bukti,
        status: item.status || 'Terverifikasi',
        created_at: new Date().toISOString(),
      }));

      const merged = [...newTransactions, ...all];
      saveTransactions(merged);

      return NextResponse.json({
        success: true,
        message: `${newTransactions.length} transaksi berhasil ditambahkan`,
        data: newTransactions,
      });
    } else {
      // Single insert
      const newTx: Transaction = {
        id: body.id || `tx-${Date.now()}`,
        tanggal: body.tanggal,
        kode_rekening: body.kode_rekening,
        nama_kategori: body.nama_kategori,
        uraian_transaksi: body.uraian_transaksi,
        nominal: Number(body.nominal),
        nomor_bukti: body.nomor_bukti,
        status: body.status || 'Terverifikasi',
        created_at: new Date().toISOString(),
      };

      all.unshift(newTx);
      saveTransactions(all);

      return NextResponse.json({
        success: true,
        message: 'Transaksi berhasil ditambahkan',
        data: newTx,
      });
    }
  } catch (error) {
    console.error('Save Transaction Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menyimpan transaksi' },
      { status: 500 }
    );
  }
}
