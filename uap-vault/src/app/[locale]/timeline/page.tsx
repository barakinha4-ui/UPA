import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/navigation';
import { getAllDocuments } from '@/lib/supabase/queries';
import { Clock, MapPin, ChevronRight, Filter } from 'lucide-react';
import { COUNTRIES } from '@/types/database';

export default async function TimelinePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const t = await getTranslations('timeline');

  // Get all documents and group by decade
  const allDocs = await getAllDocuments();
  
  // Sort by year descending
  const sorted = [...allDocs]
    .filter(d => d.incident_year)
    .sort((a, b) => (b.incident_year || 0) - (a.incident_year || 0));

  // Group by decade
  const byDecade = new Map<number, typeof sorted>();
  sorted.forEach(doc => {
    const decade = Math.floor((doc.incident_year || 2000) / 10) * 10;
    if (!byDecade.has(decade)) byDecade.set(decade, []);
    byDecade.get(decade)!.push(doc);
  });

  const decades = Array.from(byDecade.keys()).sort((a, b) => b - a);

  // Get country flag from country code
  const getFlag = (code: string | undefined) => {
    if (!code) return '🇺🇸';
    const c = COUNTRIES.find(c => c.code === code);
    return c?.flag || '🏳️';
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="relative py-20 md:py-28 overflow-hidden border-b border-[#c8a96e]/10 bg-black/40">
        <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(200,169,110,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(200,169,110,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-60" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 font-mono text-[10px] font-bold tracking-[0.25em] text-[#c8a96e] border border-[#c8a96e]/30 px-3 py-1 rounded bg-[#c8a96e]/5 mb-6 uppercase">
            <Clock className="h-3.5 w-3.5" />
            <span>// TEMPORAL ANALYSIS</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#e8e8e0] mb-4">
            {t('title')}
          </h1>
          <p className="font-mono text-xs sm:text-sm tracking-wider text-[#e8e8e0]/50 max-w-2xl mx-auto uppercase">
            {t('subtitle')}
          </p>

          {/* Decade quick nav */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {decades.map(decade => (
              <a
                key={decade}
                href={`#decade-${decade}`}
                className="font-mono text-[10px] font-bold tracking-wider border border-[#c8a96e]/20 hover:border-[#c8a96e]/60 text-[#e8e8e0]/60 hover:text-[#c8a96e] px-3 py-1.5 rounded transition-colors bg-[#c8a96e]/5 hover:bg-[#c8a96e]/10"
              >
                {decade}s
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-[#c8a96e]/40 via-[#c8a96e]/20 to-transparent" />

          {decades.map(decade => {
            const docs = byDecade.get(decade) || [];
            // Show max 10 per decade to avoid massive page
            const displayDocs = docs.slice(0, 10);
            const remaining = docs.length - displayDocs.length;

            return (
              <div key={decade} id={`decade-${decade}`} className="mb-16">
                {/* Decade header */}
                <div className="relative pl-12 md:pl-20 mb-8">
                  <div className="absolute left-2 md:left-6 top-1 w-5 h-5 rounded-full border-2 border-[#c8a96e] bg-[#0a0a0f] shadow-[0_0_12px_rgba(200,169,110,0.3)]" />
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#c8a96e]">
                    {decade}s
                  </h2>
                  <span className="font-mono text-[10px] text-[#e8e8e0]/40 uppercase tracking-widest">
                    {docs.length} {t('documents')}
                  </span>
                </div>

                {/* Events */}
                <div className="space-y-4">
                  {displayDocs.map(doc => {
                    const title = locale === 'pt' ? doc.title_pt : doc.title_en;
                    const flag = getFlag(doc.country);

                    return (
                      <Link
                        key={doc.id}
                        href={`/documentos/${doc.slug}`}
                        className="group relative pl-12 md:pl-20 block"
                      >
                        {/* Small dot */}
                        <div className="absolute left-3 md:left-7 top-3 w-2.5 h-2.5 rounded-full border border-[#c8a96e]/40 bg-[#0a0a0f] group-hover:bg-[#c8a96e] group-hover:border-[#c8a96e] transition-colors shadow-sm" />

                        <div className="border border-[#c8a96e]/10 hover:border-[#c8a96e]/30 rounded p-4 bg-white/[0.01] hover:bg-white/[0.02] transition-all group-hover:translate-x-1 duration-200">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{flag}</span>
                              <span className="font-mono text-[10px] font-bold tracking-wider text-[#c8a96e] uppercase">
                                {doc.agency}
                              </span>
                              <span className="font-mono text-[10px] text-[#e8e8e0]/30">
                                {doc.incident_date || doc.incident_year}
                              </span>
                            </div>
                            <ChevronRight className="h-3.5 w-3.5 text-[#e8e8e0]/20 group-hover:text-[#c8a96e] transition-colors hidden sm:block" />
                          </div>
                          <h3 className="font-serif text-sm font-bold text-[#e8e8e0] group-hover:text-[#c8a96e] transition-colors line-clamp-1">
                            {title}
                          </h3>
                          {doc.location_name && (
                            <div className="flex items-center space-x-1 mt-1 text-[10px] font-mono text-[#e8e8e0]/30">
                              <MapPin className="h-3 w-3 text-[#c8a96e]/50" />
                              <span>{doc.location_name}</span>
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}

                  {remaining > 0 && (
                    <Link
                      href={`/documentos?year=${decade}`}
                      className="relative pl-12 md:pl-20 block"
                    >
                      <div className="border border-dashed border-[#c8a96e]/10 hover:border-[#c8a96e]/30 rounded p-3 text-center font-mono text-xs text-[#c8a96e]/60 hover:text-[#c8a96e] transition-colors bg-white/[0.005]">
                        + {remaining} {locale === 'pt' ? 'documentos adicionais' : 'additional documents'} →
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
