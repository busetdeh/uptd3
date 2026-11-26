-- ==============================================================================
-- SKEMA BASIS DATA SUPABASE: SIP-PENDAPATAN UPTD
-- Jalankan skrip ini di: Supabase Dashboard > SQL Editor > New Query > Run
-- ==============================================================================

-- 1. Buat Tabel Transaksi Penerimaan
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    tanggal DATE NOT NULL,
    kode_rekening VARCHAR(50) NOT NULL,
    nama_kategori VARCHAR(100) NOT NULL,
    uraian_transaksi TEXT,
    nominal NUMERIC(15, 2) NOT NULL CHECK (nominal > 0),
    nomor_bukti VARCHAR(100) UNIQUE,
    kelurahan VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Terverifikasi',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Buat Indeks untuk kecepatan filter tanggal & pencarian
CREATE INDEX IF NOT EXISTS idx_transactions_tanggal ON public.transactions(tanggal);
CREATE INDEX IF NOT EXISTS idx_transactions_kategori ON public.transactions(nama_kategori);
CREATE INDEX IF NOT EXISTS idx_transactions_kelurahan ON public.transactions(kelurahan);
CREATE INDEX IF NOT EXISTS idx_transactions_nomor_bukti ON public.transactions(nomor_bukti);

-- 2. Buat Tabel Target Anggaran
CREATE TABLE IF NOT EXISTS public.targets (
    id SERIAL PRIMARY KEY,
    tahun INT NOT NULL,
    bulan INT DEFAULT 11,
    total_target NUMERIC(15, 2) NOT NULL DEFAULT 1500000000,
    target_harian NUMERIC(15, 2) NOT NULL DEFAULT 50000000,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_tahun_bulan UNIQUE (tahun, bulan)
);

-- 3. Masukkan Data Target Awal (Pagu Anggaran 2026)
INSERT INTO public.targets (tahun, bulan, total_target, target_harian)
VALUES (2026, 11, 1500000000, 50000000)
ON CONFLICT (tahun, bulan) DO NOTHING;

-- 4. Masukkan Data Sampel Transaksi Awal
INSERT INTO public.transactions (tanggal, kode_rekening, nama_kategori, uraian_transaksi, nominal, nomor_bukti, status)
VALUES
('2026-11-25', '4.1.2.01.01', 'Retribusi Pasar', 'Setoran Harian Kios Pasar Induk Blok A–D', 24500000, 'STS-2026-1145', 'Terverifikasi'),
('2026-11-25', '4.1.2.02.01', 'Retribusi Parkir', 'Rekap Parkir Tepi Jalan Umum Zona Pusat', 14250000, 'STS-2026-1144', 'Terverifikasi'),
('2026-11-24', '4.1.2.01.02', 'Retribusi Kebersihan', 'Pelayanan Persampahan Kawasan Niaga', 11800000, 'STS-2026-1143', 'Menunggu Rekonsiliasi'),
('2026-11-24', '4.1.2.01.01', 'Retribusi Pasar', 'Setoran Pelataran Pasar Baru Selatan', 18900000, 'STS-2026-1142', 'Terverifikasi'),
('2026-11-23', '4.1.2.02.01', 'Retribusi Parkir', 'Parkir Khusus Terminal & Area Wisata', 16400000, 'STS-2026-1141', 'Terverifikasi'),
('2026-11-21', '4.1.2.01.01', 'Retribusi Pasar', 'Retribusi Los Basah & Kios Buah', 22100000, 'STS-2026-1140', 'Terverifikasi'),
('2026-11-19', '4.1.2.02.01', 'Retribusi Parkir', 'Setoran Juru Parkir Wilayah Timur', 19500000, 'STS-2026-1139', 'Terverifikasi'),
('2026-11-17', '4.1.2.01.02', 'Retribusi Kebersihan', 'Iuran Retribusi Sampah Pemukiman Tahap 2', 15300000, 'STS-2026-1138', 'Terverifikasi'),
('2026-11-15', '4.1.2.01.01', 'Retribusi Pasar', 'Sewa Kios Semi Permanen Blok C', 28400000, 'STS-2026-1137', 'Terverifikasi'),
('2026-11-13', '4.1.2.02.01', 'Retribusi Parkir', 'Retribusi Parkir Pelataran Gedung Olahraga', 12700000, 'STS-2026-1136', 'Terverifikasi')
ON CONFLICT (nomor_bukti) DO NOTHING;

-- 5. Berikan Hak Akses ke Role anon & authenticated
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;

-- Aktifkan Row Level Security (RLS) & Policy Akses
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.targets ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses: Izinkan baca dan tulis untuk anon & authenticated
DROP POLICY IF EXISTS "Izinkan baca publik transaksi" ON public.transactions;
CREATE POLICY "Izinkan baca publik transaksi" ON public.transactions
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Izinkan insert transaksi" ON public.transactions;
CREATE POLICY "Izinkan insert transaksi" ON public.transactions
    FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Izinkan update transaksi" ON public.transactions;
CREATE POLICY "Izinkan update transaksi" ON public.transactions
    FOR UPDATE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Izinkan delete transaksi" ON public.transactions;
CREATE POLICY "Izinkan delete transaksi" ON public.transactions
    FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Izinkan baca publik target" ON public.targets;
CREATE POLICY "Izinkan baca publik target" ON public.targets
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Izinkan update target" ON public.targets;
CREATE POLICY "Izinkan update target" ON public.targets
    FOR ALL TO anon, authenticated USING (true);

-- 6. AKTIFKAN SUPABASE REALTIME (PENTING untuk Autosync)
-- Perintah ini memancarkan setiap perubahan INSERT/UPDATE/DELETE melalui WebSocket
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.targets;
