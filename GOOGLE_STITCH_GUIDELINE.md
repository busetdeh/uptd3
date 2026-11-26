# Guideline Google Stitch
## Desain & Prototyping UI Web Rekapitulasi Pendapatan

Dokumen ini berisi panduan gaya, prinsip desain, dan kumpulan prompt siap pakai untuk membuat prototipe UI beresolusi tinggi (*high-fidelity*) di **Google Stitch** (Google Labs AI UI Canvas).

---

### 1. Konsep & Prinsip Desain
- **Vibe**: *Executive Financial Analytics, Clean, Data-Dense, Modern Governmental Dashboard*.
- **Warna Utama**:
  - *Base Background*: Soft Slate/Off-white (`#F8FAFC`) atau Dark Mode (`#020617`).
  - *Brand & Status*: Slate 900 (`#0F172A`), Emerald Green (`#10B981`) untuk capaian surplus, Indigo (`#6366F1`) untuk tren, Amber (`#F59E0B`) untuk perhatian, Crimson (`#EF4444`) untuk defisit.
- **Komponen Utama**:
  1. *Progress Gauge / Ring*: Menampilkan persentase realisasi vs target secara menonjol.
  2. *Dual-axis Trend Chart*: Batang realisasi harian/bulanan dengan garis target ambang.
  3. *Filtering Bar*: Pengubah cepat dimensi waktu (Harian / Bulanan / Tahunan / Kustom).
  4. *CSV Import Modal*: Area dropzone berkas CSV, tabel pratinjau validasi data sebelum commit.

---

### 2. Kumpulan Prompt Siap Pakai (Tinggal Copy-Paste ke Stitch)

#### Prompt 1: Dasbor Utama (Executive Analytics Dashboard)
```text
Create a modern, high-fidelity responsive web analytics dashboard for a regional revenue and retribution management office (UPTD Pendapatan Daerah). 

Design specifications:
- Theme: Clean financial intelligence dashboard with a refined light theme (#F8FAFC background) with dark mode toggle. Primary colors: deep slate (#0F172A), vibrant emerald green (#10B981) for revenue progress, and indigo (#6366F1) for trend lines.
- Header: App logo 'SIP-Pendapatan UPTD', an interactive date filter pill showing 'Tahun 2026 - November', a live green indicator dot labelled 'Autosync: Active', and action buttons for '+ Import CSV' and 'Export PDF/Excel'.
- Top KPI Row (4 cards):
  1. 'Total Realisasi': Display 'Rp 1.275.000.000' with a +12.4% trend indicator.
  2. 'Target Anggaran': Display 'Rp 1.500.000.000'.
  3. 'Capaian Target': Display a prominent circular radial progress gauge showing '85.0%' in emerald green, labeled 'Target on Track'.
  4. 'Sisa Target': Display 'Rp 225.000.000' (remaining shortfall).
- Main Content Section (2-column layout):
  - Left column (65% width): Large interactive bar and line chart titled 'Tren Penerimaan Harian vs Target Harian' featuring date axes, bar volumes for actual income, and a horizontal dashed line for daily target baseline. Include a pill filter switcher [Harian | Bulanan | Tahunan | Custom Date].
  - Right column (35% width): Donut chart titled 'Proporsi Kategori Pendapatan' displaying breakdown for 'Retribusi Pasar (45%)', 'Retribusi Parkir (30%)', 'Retribusi Kebersihan (25%)'.
- Bottom Section: Modern tabular list titled 'Data Penerimaan Terbaru' with columns: Tanggal, No Bukti, Kategori, Uraian, Nominal (IDR), Status. Include subtle pagination and search input.
- Style: Crisp typography (Inter/Geist), subtle shadows, border-radius 12px, clean spacing and high contrast.
```

#### Prompt 2: Modal Import CSV & Preview Validasi (CSV Import Modal)
```text
Design a clean, accessible modal dialog for 'Import Data Rekapitulasi CSV' overlaid on top of the revenue dashboard.

Modal specifications:
- Title: 'Import Transaksi Pendapatan' with subtitle 'Unggah berkas CSV untuk sinkronisasi otomatis ke basis data'.
- Top Banner: Quick link button 'Unduh Template CSV (.csv)' with a document download icon.
- Upload Area: A modern dashed border drag-and-drop zone with a cloud upload icon, stating 'Tarik & lepas file CSV di sini, atau Klik untuk Menelusuri'. Supported format hint: '.csv (Maksimal 10MB)'.
- File Preview Section (Simulate an uploaded file 'rekap_pendapatan_november.csv'):
  - Summary badges: '145 Baris Ditemukan', '143 Valid (Hijau)', '2 Membutuhkan Perhatian (Merah)'.
  - A scrollable table showing the first 4 rows of parsed data: Tanggal (2026-11-25), Kode Rekening, Kategori, Nominal (Rp 1.500.000), Status.
  - Show row 4 with a soft red background highlight and a tooltip warning: 'Baris 4: Format nominal tidak valid (terdapat karakter alfabet)'.
- Options: Checkbox 'Lewati baris dengan nomor bukti yang sudah ada (Prevent Duplicates)' and 'Kirim notifikasi autosync ke dasbor pimpinan'.
- Footer Actions: 'Batal' (secondary button) and 'Konfirmasi & Sinkronisasi Data' (primary emerald green button).
```

#### Prompt 3: Komponen Filter Interaktif (Date Range Popover/Drawer)
```text
Design an interactive popover dropdown component for the dashboard's filtering system.

Features:
- Segmented tab switch at the top: [Harian] | [Bulanan] | [Tahunan] | [Rentang Kustom].
- In [Bulanan] tab: A grid of 12 month pills (Jan - Des) with current year selector (2025, 2026), with 'November 2026' highlighted as selected.
- In [Rentang Kustom] tab: Dual calendar date-picker showing start date to end date with quick presets: '7 Hari Terakhir', '30 Hari Terakhir', 'Bulan Ini', 'Tahun Berjalan (YTD)'.
- Bottom bar: 'Reset Filter' text button and 'Terapkan Filter' primary button.
```
