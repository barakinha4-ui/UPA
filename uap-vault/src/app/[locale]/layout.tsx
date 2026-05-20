import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import type { Metadata } from 'next';

const locales = ['pt', 'en'];

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
  title: {
    default: 'UAP Vault — Arquivos Desclassificados',
    template: '%s | UAP Vault',
  },
  description:
    'Portal público bilíngue com documentos UAP/OVNI desclassificados pelo Pentágono, FBI, CIA e outras agências.',
  keywords: ['UAP', 'OVNI', 'UFO', 'Pentágono', 'desclassificado', 'documentos secretos'],
  openGraph: {
    type: 'website',
    siteName: 'UAP Vault',
  },
};

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  // Valida o locale
  if (!locales.includes(locale)) {
    notFound();
  }

  // Carrega as mensagens para o cliente
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;700;900&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0a0a0f] text-[#e8e8e0] min-h-screen flex flex-col antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Navbar />
          <main className="flex-grow flex flex-col">
            {children}
          </main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
