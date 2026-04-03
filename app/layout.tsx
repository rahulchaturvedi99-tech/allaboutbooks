import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: {
    default: 'AllAboutBooks — AI Book Summaries in English & Hindi',
    template: '%s | AllAboutBooks',
  },
  description: 'Discover books with AI-powered summaries. Explore English and Hindi literature with detailed book insights, trending picks, and curated recommendations.',
  metadataBase: new URL('https://allaboutbooks.co'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://allaboutbooks.co',
    siteName: 'AllAboutBooks',
    title: 'AllAboutBooks — AI Book Summaries',
    description: 'Discover books with AI-powered summaries in English and Hindi',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
