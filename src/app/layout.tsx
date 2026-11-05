import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CafeOS — Independent Café Operations & Quick-Order Platform',
  description: 'Multi-tenant cloud operations platform for independent cafés in Punjab and beyond. Mobile ordering, live kitchen order management, and instant menu controls.',
  keywords: ['CafeOS', 'Cafe management', 'Kurali Cafe', 'Punjab food ordering', 'QR menu', 'kitchen display'],
  openGraph: {
    title: 'CafeOS — Independent Café Operations Platform',
    description: 'Empowering independent cafés with zero-commission mobile ordering and live operations.',
    siteName: 'CafeOS',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#1C130E',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FDFBF7] text-[#1C130E] antialiased">
        {children}
      </body>
    </html>
  );
}

