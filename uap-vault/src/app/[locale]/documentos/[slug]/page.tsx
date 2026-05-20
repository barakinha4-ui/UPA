import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createStaticClient } from '@/lib/supabase/static';
import { getDocumentBySlug, getRelatedDocuments } from '@/lib/supabase/queries';
import DocumentDetail from '@/components/documents/DocumentDetail';
import type { Metadata } from 'next';

interface RouteParams {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
}

// ── 1. Geração Estática Dinâmica (ISR) ──
export async function generateStaticParams() {
  try {
    const supabase = createStaticClient();
    const { data } = await supabase
      .from('documents')
      .select('slug')
      .eq('is_published', true);

    if (!data) return [];
    return data.map((doc) => ({
      slug: doc.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// ── 2. SEO Dinâmico (OG Tags & Meta) ──
export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { slug, locale } = await params;
  const doc = await getDocumentBySlug(slug);
  if (!doc) return {};

  const title = locale === 'pt' ? doc.title_pt : doc.title_en;
  const description = locale === 'pt'
    ? doc.meta_description_pt || doc.summary_pt
    : doc.meta_description_en || doc.summary_en;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://uapvault.com';

  return {
    title: `${title} | UAP Vault`,
    description: description ? description.substring(0, 160) : 'UAP Vault Declassified Intel Archives.',
    openGraph: {
      title,
      description: description || 'UAP Vault Case Files.',
      url: `${siteUrl}/${locale}/documentos/${slug}`,
      siteName: 'UAP Vault',
      images: doc.thumbnail_url ? [{ url: doc.thumbnail_url, width: 800, height: 450, alt: title }] : [],
      locale: locale === 'pt' ? 'pt_BR' : 'en_US',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: description || 'UAP Vault Case Files.',
      images: doc.thumbnail_url ? [doc.thumbnail_url] : [],
    }
  };
}

// ── 3. Page Component Server-Side Fetching ──
export default async function DocumentDetailPage({ params }: RouteParams) {
  const { slug, locale } = await params;
  const doc = await getDocumentBySlug(slug);
  
  if (!doc) {
    notFound();
  }

  // Fetch 4 related declassified entries
  const relatedDocs = await getRelatedDocuments(slug, doc.agency, doc.incident_year || 0);

  return (
    <DocumentDetail
      doc={doc}
      relatedDocs={relatedDocs}
      locale={locale as 'pt' | 'en'}
    />
  );
}
