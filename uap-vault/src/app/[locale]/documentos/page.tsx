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
  const tHome = await getTranslations('home');
  const tDoc = await getTranslations('document');

  // Parse filters from URL state
  const agencyFilter = typeof resolvedSearchParams.agency === 'string' ? resolvedSearchParams.agency.split(',') : undefined;
  const mediaTypeFilter = typeof resolvedSearchParams.mediaType === 'string' ? resolvedSearchParams.mediaType.split(',') : undefined;
  const classificationFilter = typeof resolvedSearchParams.classification === 'string' ? resolvedSearchParams.classification.split(',') : undefined;
  const yearFilter = typeof resolvedSearchParams.year === 'string' ? parseInt(resolvedSearchParams.year, 10) : undefined;
  const countryFilter = typeof resolvedSearchParams.country === 'string' ? resolvedSearchParams.country.split(',') : undefined;
  const programFilter = typeof resolvedSearchParams.program === 'string' ? resolvedSearchParams.program.split(',') : undefined;
  const orderByFilter = (resolvedSearchParams.orderBy as 'newest' | 'oldest' | 'views') || 'newest';
  const pageFilter = typeof resolvedSearchParams.page === 'string' ? parseInt(resolvedSearchParams.page, 10) : 1;

  // Fetch documents server-side (SSR) with dynamic filters
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

  // Helper to build pagination URL — use resolvedSearchParams (already awaited)
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* ── Header / Breadcrumbs ── */}
      <div className="border-b border-[#c8a96e]/10 pb-6 mb-8 font-mono">
        <div className="text-[10px] text-[#e8e8e0]/40 flex items-center space-x-1.5 uppercase mb-3">
          <Link href="/" className="hover:text-[#c8a96e] transition-colors">Home</Link>
          <span>&gt;</span>
          <span className="text-[#c8a96e] font-bold">{t('documents')}</span>
        </div>
        <div className="flex items-center space-x-3">
          <ShieldAlert className="h-6 w-6 text-[#cc3333]" />
          <h1 className="font-serif text-3xl font-bold text-[#e8e8e0]">
            Declassified Document Archive
          </h1>
        </div>
        <p className="text-xs text-[#e8e8e0]/60 uppercase tracking-widest mt-2">
          // TOTAL REGISTERED CASES: <strong className="text-[#c8a96e]">{count} RECORDS</strong>
        </p>
      </div>

      {/* ── Main Layout: Filters sidebar + Documents grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
          <DocumentFilters />
        </div>

        {/* Document Grid & Pagination */}
        <div className="lg:col-span-3 flex flex-col space-y-8">
          
          <DocumentGrid docs={documents} locale={locale as 'pt' | 'en'} />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-[#c8a96e]/10 pt-6 mt-4 font-mono text-xs">
              
              {/* Previous Page */}
              {pageFilter > 1 ? (
                <Link
                  href={getPaginationUrl(pageFilter - 1)}
                  className="flex items-center space-x-1 border border-[#e8e8e0]/10 hover:border-[#c8a96e]/40 hover:text-[#c8a96e] px-3.5 py-2 rounded bg-white/[0.01] transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>PREV</span>
                </Link>
              ) : (
                <div className="flex items-center space-x-1 border border-transparent text-[#e8e8e0]/20 px-3.5 py-2 cursor-not-allowed select-none">
                  <ChevronLeft className="h-4 w-4" />
                  <span>PREV</span>
                </div>
              )}

              {/* Page Indicator */}
              <span className="text-[#e8e8e0]/50">
                PAGE <strong className="text-[#e8e8e0]">{pageFilter}</strong> OF <strong className="text-[#e8e8e0]">{totalPages}</strong>
              </span>

              {/* Next Page */}
              {pageFilter < totalPages ? (
                <Link
                  href={getPaginationUrl(pageFilter + 1)}
                  className="flex items-center space-x-1 border border-[#e8e8e0]/10 hover:border-[#c8a96e]/40 hover:text-[#c8a96e] px-3.5 py-2 rounded bg-white/[0.01] transition-colors"
                >
                  <span>NEXT</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              ) : (
                <div className="flex items-center space-x-1 border border-transparent text-[#e8e8e0]/20 px-3.5 py-2 cursor-not-allowed select-none">
                  <span>NEXT</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
