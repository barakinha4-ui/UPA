import { notFound } from 'next/navigation';
import { getDocumentBySlug, getRelatedDocuments } from '@/lib/supabase/queries';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { COUNTRIES } from '@/types/database';
import { ShieldAlert, Calendar, MapPin, ExternalLink, ArrowLeft, FileText, Database } from 'lucide-react';
import { Link } from '@/lib/navigation';

interface RouteParams {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
}

// ── SEO Dinâmico ──
export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { slug, locale } = await params;
  const doc = await getDocumentBySlug(slug);
  if (!doc) return {};

  const title = locale === 'pt' ? doc.title_pt : doc.title_en;
  const description = locale === 'pt'
    ? doc.meta_description_pt || doc.summary_pt
    : doc.meta_description_en || doc.summary_en;

  return {
    title: `${title} | UAP Vault - Deep Dive`,
    description: description ? description.substring(0, 160) : 'UAP Vault Iconic Case.',
  };
}

export default async function CasoDetailPage({ params }: RouteParams) {
  const { slug, locale } = await params;
  const t = await getTranslations('cases');
  const tDoc = await getTranslations('document');
  const doc = await getDocumentBySlug(slug);
  
  if (!doc) {
    notFound();
  }

  const title = locale === 'pt' ? doc.title_pt : doc.title_en;
  const summary = locale === 'pt' ? doc.summary_pt : doc.summary_en;
  const analysis = locale === 'pt' ? doc.analysis_pt : doc.analysis_en;

  const countryInfo = COUNTRIES.find(c => c.code === doc.country);
  const flag = countryInfo?.flag || '🏳️';
  const countryName = countryInfo ? (locale === 'pt' ? countryInfo.name_pt : countryInfo.name_en) : doc.country;

  return (
    <div className="flex flex-col min-h-screen bg-[#050508]">
      {/* ── Editorial Hero ── */}
      <section className="relative min-h-[60vh] flex items-end pb-16 pt-32 overflow-hidden border-b border-[#c8a96e]/20">
        <div className="absolute inset-0 z-0">
          {doc.thumbnail_url ? (
            <>
              <img
                src={doc.thumbnail_url}
                alt={title}
                className="w-full h-full object-cover opacity-30 grayscale mix-blend-luminosity"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/80 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full bg-[#cc3333]/5 bg-[linear-gradient(rgba(200,169,110,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(200,169,110,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
          )}
          {/* Scanline effect */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjIiIGZpbGw9IiMwMDAiIG9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')] pointer-events-none opacity-50" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <Link
            href="/documentos"
            className="inline-flex items-center space-x-2 font-mono text-[10px] uppercase font-bold text-[#c8a96e] hover:text-[#e8e8e0] mb-8 transition-colors bg-black/40 px-3 py-1.5 rounded-full border border-[#c8a96e]/20 backdrop-blur-md"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>{t('back')}</span>
          </Link>

          <div className="flex flex-wrap items-center gap-3 mb-4 font-mono text-[10px] uppercase font-bold tracking-wider">
            <span className="bg-[#c8a96e]/20 text-[#c8a96e] px-2 py-1 rounded border border-[#c8a96e]/30">
              {flag} {countryName}
            </span>
            <span className="bg-white/5 text-[#e8e8e0]/70 px-2 py-1 rounded border border-white/10">
              {doc.agency}
            </span>
            <span className="bg-[#cc3333]/20 text-[#cc3333] px-2 py-1 rounded border border-[#cc3333]/30">
              ID: {doc.official_id || doc.slug.substring(0, 8)}
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white mb-6 leading-[1.1] text-shadow-lg">
            {title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 font-mono text-xs text-[#e8e8e0]/60">
            {doc.incident_date && (
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-[#c8a96e]" />
                <span>{doc.incident_date}</span>
              </div>
            )}
            {doc.location_name && (
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-[#c8a96e]" />
                <span>{doc.location_name}</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-[#c8a96e]" />
              <span>{doc.source_program?.replace(/_/g, ' ')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Deep Dive Content ── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Main Article (Left, 2 columns) */}
          <div className="md:col-span-2 space-y-12">
            <article className="prose prose-invert prose-p:text-[#e8e8e0]/80 prose-p:leading-relaxed prose-p:font-serif prose-headings:text-white prose-headings:font-serif prose-a:text-[#c8a96e] max-w-none">
              <h2 className="text-2xl border-b border-[#c8a96e]/20 pb-2 mb-6 font-bold flex items-center space-x-2">
                <span className="text-[#c8a96e] font-mono text-sm">01.</span>
                <span>{t('key_facts')}</span>
              </h2>
              <p className="text-lg first-letter:text-5xl first-letter:font-bold first-letter:text-[#c8a96e] first-letter:float-left first-letter:mr-3 first-letter:mt-1">
                {summary}
              </p>
              
              {analysis && (
                <>
                  <h2 className="text-2xl border-b border-[#c8a96e]/20 pb-2 mt-12 mb-6 font-bold flex items-center space-x-2">
                    <span className="text-[#c8a96e] font-mono text-sm">02.</span>
                    <span>{tDoc('analysis')}</span>
                  </h2>
                  <div className="bg-[#c8a96e]/5 border-l-2 border-[#c8a96e] p-6 rounded-r font-mono text-sm text-[#e8e8e0]/80 leading-relaxed shadow-inner">
                    {analysis}
                  </div>
                </>
              )}
            </article>

            {doc.original_url && (
              <div className="pt-8 border-t border-white/5">
                <a
                  href={doc.original_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center space-x-2 bg-[#c8a96e] hover:bg-[#b0935b] text-[#050508] font-mono text-xs font-bold uppercase tracking-widest px-6 py-4 rounded shadow-lg transition-colors w-full sm:w-auto"
                >
                  <FileText className="h-4 w-4" />
                  <span>{tDoc('view_original')}</span>
                  <ExternalLink className="h-3.5 w-3.5 ml-1" />
                </a>
              </div>
            )}
          </div>

          {/* Sidebar (Right, 1 column) */}
          <div className="space-y-8">
            <div className="border border-[#c8a96e]/20 bg-black/40 p-6 rounded-lg backdrop-blur-sm">
              <h3 className="font-mono text-[10px] uppercase font-bold tracking-[0.2em] text-[#c8a96e] mb-4 flex items-center space-x-2">
                <ShieldAlert className="h-3 w-3" />
                <span>Classification Data</span>
              </h3>
              
              <dl className="space-y-4 font-mono text-xs">
                <div>
                  <dt className="text-[#e8e8e0]/40 mb-1">Status</dt>
                  <dd className="text-white font-bold uppercase tracking-wider">{tDoc(doc.classification)}</dd>
                </div>
                <div>
                  <dt className="text-[#e8e8e0]/40 mb-1">Media Format</dt>
                  <dd className="text-white uppercase">{doc.media_type}</dd>
                </div>
                <div>
                  <dt className="text-[#e8e8e0]/40 mb-1">Declassification Date</dt>
                  <dd className="text-[#e8e8e0]/80">{doc.release_date || 'N/A'}</dd>
                </div>
                {doc.tags && doc.tags.length > 0 && (
                  <div>
                    <dt className="text-[#e8e8e0]/40 mb-1">Index Tags</dt>
                    <dd className="flex flex-wrap gap-1.5 mt-2">
                      {doc.tags.map(tag => (
                        <span key={tag} className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-[#e8e8e0]/60 uppercase text-[9px]">
                          {tag}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
            
            {doc.video_url && (
              <div className="border border-red-500/20 bg-red-500/5 p-6 rounded-lg backdrop-blur-sm">
                <h3 className="font-mono text-[10px] uppercase font-bold tracking-[0.2em] text-red-400 mb-2">
                  Visual Evidence Available
                </h3>
                <p className="font-serif text-sm text-[#e8e8e0]/70 mb-4">
                  This case contains verified video footage captured during the incident.
                </p>
                <a
                  href={doc.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white font-mono text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded transition-colors w-full"
                >
                  <span>View Footage</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
