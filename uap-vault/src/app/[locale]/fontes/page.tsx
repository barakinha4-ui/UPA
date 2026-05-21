import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/navigation';
import { COUNTRIES } from '@/types/database';
import { getGlobalStats } from '@/lib/supabase/queries';
import { Globe, ArrowRight, ShieldAlert, Database, ExternalLink } from 'lucide-react';

export default async function FontesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const t = await getTranslations('sources');
  const tCountries = await getTranslations('countries');
  const stats = await getGlobalStats();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="relative py-20 md:py-28 overflow-hidden border-b border-[#c8a96e]/10 bg-black/40">
        <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(200,169,110,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(200,169,110,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-60" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 font-mono text-[10px] font-bold tracking-[0.25em] text-[#c8a96e] border border-[#c8a96e]/30 px-3 py-1 rounded bg-[#c8a96e]/5 mb-6 uppercase">
            <Globe className="h-3.5 w-3.5" />
            <span>// MULTI-NATION INTELLIGENCE</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#e8e8e0] mb-4">
            {t('title')}
          </h1>
          <p className="font-mono text-xs sm:text-sm tracking-wider text-[#e8e8e0]/50 max-w-2xl mx-auto uppercase">
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* Country Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {COUNTRIES.map((country) => {
            const docCount = stats.byCountry[country.code] || 0;
            const countryName = locale === 'pt' ? country.name_pt : country.name_en;

            return (
              <div
                key={country.code}
                className="group relative border border-[#c8a96e]/10 hover:border-[#c8a96e]/40 rounded-lg overflow-hidden bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-300"
              >
                {/* Country Header */}
                <div className="flex items-center justify-between p-6 pb-4 border-b border-[#c8a96e]/5">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{country.flag}</span>
                    <div>
                      <h3 className="font-serif text-xl font-bold text-[#e8e8e0] group-hover:text-[#c8a96e] transition-colors">
                        {countryName}
                      </h3>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-[#e8e8e0]/40">
                        {country.code}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-2xl font-bold text-[#c8a96e]">{docCount}</span>
                    <div className="font-mono text-[9px] uppercase tracking-wider text-[#e8e8e0]/40">
                      {t('indexed')}
                    </div>
                  </div>
                </div>

                {/* Agencies */}
                <div className="p-6 pt-4 space-y-4">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#c8a96e]/70 font-bold">
                      {t('agency_label')}
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {country.agencies.map((ag) => (
                        <span
                          key={ag}
                          className="font-mono text-[10px] font-bold tracking-wider border border-[#e8e8e0]/10 text-[#e8e8e0]/60 px-2 py-0.5 rounded bg-white/[0.02]"
                        >
                          {ag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#c8a96e]/70 font-bold">
                      {t('program')}
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {country.programs.map((prog) => (
                        <span
                          key={prog}
                          className="font-mono text-[9px] tracking-wider border border-[#c8a96e]/10 text-[#e8e8e0]/40 px-2 py-0.5 rounded bg-[#c8a96e]/5"
                        >
                          {prog.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Explore Link */}
                  <Link
                    href={`/documentos?country=${country.code}`}
                    className="flex items-center justify-between w-full mt-4 pt-4 border-t border-[#c8a96e]/5 font-mono text-xs uppercase font-bold text-[#c8a96e] hover:text-[#e8e8e0] transition-colors group/link"
                  >
                    <span>{t('explore')} {countryName}</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
