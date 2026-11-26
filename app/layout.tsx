import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SIP-Pendapatan UPTD — Sistem Informasi Rekapitulasi Pendapatan',
  description: 'Aplikasi pelaporan dan rekapitulasi realisasi pendapatan daerah dengan visualisasi target dan import CSV.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Spline+Sans+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-body transition-colors duration-150">
        {children}
      </body>
    </html>
  );
}
