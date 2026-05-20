import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/navigation';
import { getDocuments, getStats, getReleases } from '@/lib/supabase/queries';
import DocumentGrid from '@/components/documents/DocumentGrid';
import { ShieldAlert, Globe, Compass, Database, Layers, ArrowRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const t = await getTranslations('home');
  const tDoc = await getTranslations('document');

  // Fetch all stats, releases and featured documents server-side (SSR/ISR)
  const stats = await getStats();
  const releases = await getReleases();
  const { data: documents } = await getDocuments({ page: 1, orderBy: 'newest' });
  
  // Highlight the 6 most recent declassified cases
  const featuredDocuments = documents.slice(0, 6);

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Hero Section (Government-Noir Situation Room) ── */}
      <section className="relative py-24 md:py-32 overflow-hidden border-b border-[#c8a96e]/10 bg-black/40">
        
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(200,169,110,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(200,169,110,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-60" />
        
        {/* Glowing tactical radar sweep effect */}
        <div className="absolute inset-0 z-0 bg-radial-gradient from-transparent via-[#c8a96e]/2 to-transparent opacity-50 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Status Label */}
          <div className="inline-flex items-center space-x-2 font-mono text-[10px] font-bold tracking-[0.25em] text-[#cc3333] border border-[#cc3333]/30 px-3 py-1 rounded bg-[#cc3333]/5 mb-6 uppercase">
            <span className="w-1.5 h-1.5 bg-[#cc3333] rounded-full animate-ping" />
            <span>Archive Status: Public Disclosure Active</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#e8e8e0] mb-6">
            {t('hero_title')}
          </h1>
          <p className="font-mono text-xs sm:text-sm tracking-wider text-[#e8e8e0]/60 max-w-2xl mx-auto uppercase mb-10">
            {t('hero_subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href="/documentos"
              className="w-full sm:w-auto flex items-center justify-center space-x-2 font-mono text-xs uppercase font-bold tracking-wider bg-[#c8a96e] hover:bg-[#b0935b] text-[#0a0a0f] px-6 py-3.5 rounded shadow-lg transition-all"
            >
              <span>Explore Declassified Index</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/mapa"
              className="w-full sm:w-auto flex items-center justify-center space-x-2 font-mono text-xs uppercase font-bold tracking-wider border border-[#c8a96e]/30 hover:border-[#c8a96e] bg-[#c8a96e]/5 hover:bg-[#c8a96e]/10 px-6 py-3.5 rounded transition-all text-[#e8e8e0]"
            >
              <Compass className="h-4 w-4 text-[#c8a96e]" />
              <span>{t('explore_map')}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="bg-[#07070a] border-b border-[#c8a96e]/10 py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center">
            
            {/* Total Documents */}
            <div className="flex flex-col items-center">
              <Database className="h-5 w-5 text-[#c8a96e] mb-2" />
              <span className="font-mono text-2xl font-bold text-[#e8e8e0]">{stats.total}</span>
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#e8e8e0]/40 mt-1">
                Declassified Docs
              </span>
            </div>

            {/* Agencies Covered */}
            <div className="flex flex-col items-center">
              <ShieldAlert className="h-5 w-5 text-[#c8a96e] mb-2" />
              <span className="font-mono text-2xl font-bold text-[#e8e8e0]">{stats.agencies}</span>
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#e8e8e0]/40 mt-1">
                Agencies Covered
              </span>
            </div>

            {/* Historical Period */}
            <div className="flex flex-col items-center">
              <Compass className="h-5 w-5 text-[#c8a96e] mb-2" />
              <span className="font-mono text-2xl font-bold text-[#e8e8e0]">
                {stats.min_year && stats.max_year ? `${stats.min_year} - ${stats.max_year}` : '1947 - 2026'}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#e8e8e0]/40 mt-1">
                Historical Period
              </span>
            </div>

            {/* Release Batches */}
            <div className="flex flex-col items-center">
              <Layers className="h-5 w-5 text-[#c8a96e] mb-2" />
              <span className="font-mono text-2xl font-bold text-[#e8e8e0]">{releases.length}</span>
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#e8e8e0]/40 mt-1">
                Published Batches
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* ── Featured Documents Section ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10">
        <div className="flex flex-col sm:flex-row items-baseline justify-between border-b border-[#c8a96e]/10 pb-4 mb-10">
          <div>
            <span className="font-mono text-[9px] font-bold tracking-[0.2em] text-[#c8a96e] uppercase">
              // RECENTLY INGESTED
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#e8e8e0] mt-1">
              Latest Declassified Vault Entries
            </h2>
          </div>
          <Link
            href="/documentos"
            className="flex items-center space-x-1 font-mono text-xs uppercase text-[#c8a96e] hover:text-[#e8e8e0] transition-colors mt-2 sm:mt-0 font-bold"
          >
            <span>See Full Archive</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <DocumentGrid docs={featuredDocuments} locale={locale as 'pt' | 'en'} />
      </section>

      {/* ── Releases Timeline Section ── */}
      <section className="py-20 bg-[#07070a] border-t border-[#c8a96e]/10 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="font-mono text-[9px] font-bold tracking-[0.2em] text-[#c8a96e] uppercase">
              // HISTORICAL RECORD
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#e8e8e0] mt-1">
              Pentagon Release Chronology
            </h2>
          </div>

          <div className="relative border-l border-[#c8a96e]/20 ml-4 md:ml-6 space-y-12">
            {releases.map((release) => (
              <div key={release.id} className="relative pl-8 md:pl-10 group">
                {/* Timeline node */}
                <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-[#c8a96e] bg-[#07070a] group-hover:bg-[#c8a96e] shadow-[0_0_8px_rgba(200,169,110,0.2)] transition-colors" />

                {/* Release details */}
                <div className="border border-[#c8a96e]/10 hover:border-[#c8a96e]/30 rounded p-5 bg-white/[0.01] hover:bg-white/[0.02] transition-all">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                    <span className="font-mono text-xs font-bold text-[#c8a96e]">
                      BATCH RELEASE 0{release.release_num}
                    </span>
                    <span className="font-mono text-[10px] text-[#e8e8e0]/40">
                      {formatDate(release.released_at, locale as 'pt' | 'en')}
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#e8e8e0] mb-2">
                    {release.title}
                  </h3>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-4 pt-4 border-t border-[#c8a96e]/5 font-mono text-[10px]">
                    <span className="text-[#e8e8e0]/50 uppercase">
                      Documents Ingested: <strong className="text-[#e8e8e0]">{release.doc_count} cases</strong>
                    </span>
                    {release.source_url && (
                      <a
                        href={release.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#c8a96e] hover:text-[#e8e8e0] hover:underline transition-colors uppercase font-bold"
                      >
                        Official Release Source &rarr;
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
