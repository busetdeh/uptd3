import { NextRequest, NextResponse } from 'next/server';
import { getTargetBudget } from '@/lib/data';
import fs from 'fs';
import path from 'path';

const targetsFile = path.join(process.cwd(), 'data', 'targets.json');

export async function GET() {
  const target = getTargetBudget();
  return NextResponse.json({ success: true, data: target });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const current = getTargetBudget();
    const updated = {
      ...current,
      ...body,
    };

    fs.writeFileSync(targetsFile, JSON.stringify(updated, null, 2), 'utf-8');
    return NextResponse.json({ success: true, message: 'Target berhasil diperbarui', data: updated });
  } catch (error) {
    console.error('Error updating target:', error);
    return NextResponse.json({ success: false, message: 'Gagal memperbarui target' }, { status: 500 });
  }
}
