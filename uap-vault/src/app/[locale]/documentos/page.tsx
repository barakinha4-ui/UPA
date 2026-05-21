import { getTranslations } from 'next-intl/server';
import { getDocuments } from '@/lib/supabase/queries';
import DocumentGrid from '@/components/documents/DocumentGrid';
import DocumentFilters from '@/components/documents/DocumentFilters';
import { Link } from '@/lib/navigation';
import { ShieldAlert, ChevronLeft, ChevronRight } from 'lucide-react';

export default async function DocumentsPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const t = await getTranslations('nav');

  const agencyFilter = typeof resolvedSearchParams.agency === 'string' ? resolvedSearchParams.agency.split(',') : undefined;
  const mediaTypeFilter = typeof resolvedSearchParams.mediaType === 'string' ? resolvedSearchParams.mediaType.split(',') : undefined;
  const classificationFilter = typeof resolvedSearchParams.classification === 'string' ? resolvedSearchParams.classification.split(',') : undefined;
  const yearFilter = typeof resolvedSearchParams.year === 'string' ? parseInt(resolvedSearchParams.year, 10) : undefined;
  const countryFilter = typeof resolvedSearchParams.country === 'string' ? resolvedSearchParams.country.split(',') : undefined;
  const programFilter = typeof resolvedSearchParams.program === 'string' ? resolvedSearchParams.program.split(',') : undefined;
  const orderByFilter = (resolvedSearchParams.orderBy as 'newest' | 'oldest' | 'views') || 'newest';
  const pageFilter = typeof resolvedSearchParams.page === 'string' ? parseInt(resolvedSearchParams.page, 10) : 1;

  const { data: documents, count } = await getDocuments({
    agency: agencyFilter,
    mediaType: mediaTypeFilter,
    classification: classificationFilter,
    country: countryFilter,
    program: programFilter,
    year: yearFilter,
    orderBy: orderByFilter,
    page: pageFilter,
  });

  const totalPages = Math.ceil(count / 20);

  const getPaginationUrl = (pageNum: number) => {
    const urlParams = new URLSearchParams();
    Object.entries(resolvedSearchParams).forEach(([key, val]) => {
      if (key !== 'page' && typeof val === 'string') {
        urlParams.set(key, val);
      }
    });
    urlParams.set('page', pageNum.toString());
    return `/documentos?${urlParams.toString()}`;
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-10">

      {/* ── Header ── */}
      <div className="border-b border-[#c8a96e]/10 pb-6 mb-6 font-mono">
        <div className="text-[10px] text-[#e8e8e0]/40 flex items-center space-x-1.5 uppercase mb-3">
          <Link href="/" className="hover:text-[#c8a96e] transition-colors">Home</Link>
          <span>&gt;</span>
          <span className="text-[#c8a96e] font-bold">{t('documents')}</span>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-3">
            <ShieldAlert className="h-6 w-6 text-[#cc3333]" />
            <h1 className="font-serif text-3xl font-bold text-[#e8e8e0]">
              Declassified Document Archive
            </h1>
          </div>
          <span className="font-mono text-xs text-[#e8e8e0]/40 uppercase tracking-widest">
            // <strong className="text-[#c8a96e]">{count} RECORDS</strong>
          </span>
        </div>
      </div>

      {/* ── Horizontal Filters Bar ── */}
      <DocumentFilters />

      {/* ── Full-width Document Grid ── */}
      <DocumentGrid docs={documents} locale={locale as 'pt' | 'en'} />

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[#c8a96e]/10 pt-6 mt-8 font-mono text-xs">
          {pageFilter > 1 ? (
            <Link
              href={getPaginationUrl(pageFilter - 1)}
              className="flex items-center space-x-1 border border-[#e8e8e0]/10 hover:border-[#c8a96e]/40 hover:text-[#c8a96e] px-4 py-2 rounded-sm bg-white/[0.01] transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>PREV</span>
            </Link>
          ) : (
            <div className="flex items-center space-x-1 border border-transparent text-[#e8e8e0]/20 px-4 py-2 cursor-not-allowed select-none">
              <ChevronLeft className="h-4 w-4" />
              <span>PREV</span>
            </div>
          )}

          <span className="text-[#e8e8e0]/50">
            PAGE <strong className="text-[#e8e8e0]">{pageFilter}</strong> OF <strong className="text-[#e8e8e0]">{totalPages}</strong>
          </span>

          {pageFilter < totalPages ? (
            <Link
              href={getPaginationUrl(pageFilter + 1)}
              className="flex items-center space-x-1 border border-[#e8e8e0]/10 hover:border-[#c8a96e]/40 hover:text-[#c8a96e] px-4 py-2 rounded-sm bg-white/[0.01] transition-colors"
            >
              <span>NEXT</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <div className="flex items-center space-x-1 border border-transparent text-[#e8e8e0]/20 px-4 py-2 cursor-not-allowed select-none">
              <span>NEXT</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          )}
        </div>
      )}

    </div>
  );
}
