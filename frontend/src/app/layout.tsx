'use client';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [qc] = useState(() => new QueryClient());
  return (
    <html lang="id">
      <head>
        <title>ERP Samas</title>
        <meta name="description" content="Sistem ERP untuk manajemen distribusi" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <QueryClientProvider client={qc}>{children}</QueryClientProvider>
      </body>
    </html>
  );
}
