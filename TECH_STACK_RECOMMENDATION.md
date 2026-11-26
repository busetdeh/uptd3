# Rekomendasi Tech Stack
## Sistem Informasi Rekapitulasi & Pelaporan Pendapatan (Autosync & Responsive)

Berikut arsitektur teknologi yang direkomendasikan untuk menjamin performa cepat, responsif di semua perangkat, dan kemampuan autosync instan:

### 1. Stack Komponen

| Lapisan | Teknologi | Peran & Alasan |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 15 (React 19, TypeScript)** | Rendering SSR/CSR cepat, routing App Router modern, SEO & performa optimal. |
| **Styling & UI Kit** | **Tailwind CSS + Shadcn UI** | Komponen UI bersih, aksesibel, sangat ringan tanpa runtime overhead. |
| **Visualisasi / Charts** | **Recharts / Tremor** | Grafik responsif, animasi transisi halus, mendukung custom target lines dan gauge. |
| **Realtime Autosync** | **Supabase Realtime (WebSocket)** | Mengirim event update secara instan (< 100ms) ke semua perangkat yang membuka dashboard tanpa perlu reload. |
| **Database** | **PostgreSQL (via Supabase)** | Agregasi matematis keuangan (`SUM`, `GROUP BY`, `DATE_TRUNC`) sangat cepat dan akurat. |
| **CSV Engine** | **PapaParse (Web Worker)** | Parsing puluhan ribu baris CSV di background thread browser tanpa membekukan antarmuka pengguna. |
| **State Management** | **TanStack Query v5** | Caching, deduplikasi request, dan sinkronisasi data otomatis dengan database. |

### 2. Alur Autosync

```
[Staf Unggah CSV]
       |
       v
[Parsing & Validasi Client-side (PapaParse)]
       |
       v
[Batch Insert ke PostgreSQL (Supabase)]
       |
       +---> [Trigger WebSocket: postgres_changes]
                   |
                   v (Broadcast dalam hitungan milidetik)
       [Dashboard Pimpinan / Tablet Ter-update Otomatis]
```
