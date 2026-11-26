import { NextRequest, NextResponse } from 'next/server';
import { getTargetBudget } from '@/lib/data';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

const targetsFile = path.join(process.cwd(), 'data', 'targets.json');

export async function GET() {
  const target = await getTargetBudget();
  return NextResponse.json({ success: true, data: target });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const current = await getTargetBudget();
    const updated = {
      ...current,
      ...body,
      total_target: Number(body.total_target || current.total_target),
      target_harian: Number(body.target_harian || current.target_harian),
    };

    // 1. Update Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('targets')
          .upsert(
            {
              tahun: updated.tahun || 2026,
              bulan: updated.bulan || 11,
              total_target: updated.total_target,
              target_harian: updated.target_harian,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'tahun,bulan' }
          );

        if (error) {
          console.error('Supabase targets upsert error:', error.message);
        }
      } catch (e) {
        console.error('Supabase targets exception:', e);
      }
    }

    // 2. Always backup to local JSON
    try {
      const dataDir = path.dirname(targetsFile);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(targetsFile, JSON.stringify(updated, null, 2), 'utf-8');
    } catch (fsErr) {
      console.warn('Local targets backup write warning:', fsErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Target Anggaran berhasil diperbarui',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating target:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui target anggaran' },
      { status: 500 }
    );
  }
}
