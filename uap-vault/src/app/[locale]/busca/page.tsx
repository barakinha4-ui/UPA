'use client';

import { useState, useEffect, use } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';
import { createClient } from '@/lib/supabase/client';
import { UapDocument } from '@/types/database';
import DocumentCard from '@/components/documents/DocumentCard';
import { Search, Loader2, Globe, Sparkles, HelpCircle } from 'lucide-react';

interface SearchPageProps {
  params: Promise<{
    locale: 'pt' | 'en';
  }>;
}

const SUGGESTIONS = {
  pt: ['Tic Tac', 'Gimbal', 'Pentágono', 'Roswell', 'Varginha', 'Operação Prato'],
  en: ['Tic Tac', 'Gimbal', 'Pentagon', 'Roswell', 'UFO', 'Declassified'],
};

export default function SearchPage({ params }: SearchPageProps) {
  const { locale } = use(params);
  const t = useTranslations('search');
  const tNav = useTranslations('nav');
  
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchLang, setSearchLang] = useState<'pt' | 'en'>(locale);
  const [results, setResults] = useState<UapDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // ── Debounce Query Input ──
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  // ── Fetch Results on Query/Lang Change ──
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const performSearch = async () => {
      setLoading(true);
      setHasSearched(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase.rpc('search_documents', {
          query: debouncedQuery,
          lang: searchLang,
          limit_n: 20,
          offset_n: 0,
        });

        if (error) {
          console.error('Search error:', error);
          setResults([]);
        } else {
          setResults((data as UapDocument[]) || []);
        }
      } catch (err) {
        console.error('Failed to search documents:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery, searchLang]);

  // Highlight search term helper
  const highlightText = (text: string | null | undefined, term: string) => {
    if (!text) return '';
    if (!term) return text;
    
    const parts = text.split(new RegExp(`(${term})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === term.toLowerCase() ? (
            <mark key={i} className="bg-[#c8a96e]/30 text-[#e8e8e0] px-0.5 rounded font-bold">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow flex flex-col">
      {/* ── Breadcrumb & Title ── */}
      <div className="border-b border-[#c8a96e]/10 pb-6 mb-8 font-mono">
        <div className="text-[10px] text-[#e8e8e0]/40 flex items-center space-x-1.5 uppercase mb-3">
          <Link href="/" className="hover:text-[#c8a96e] transition-colors">Home</Link>
          <span>&gt;</span>
          <span className="text-[#c8a96e] font-bold">{tNav('search')}</span>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-3">
            <Search className="h-6 w-6 text-[#c8a96e]" />
            <h1 className="font-serif text-3xl font-bold text-[#e8e8e0]">
              Full-Text Intelligence Search
            </h1>
          </div>

          {/* Search Scope Toggler */}
          <button
            onClick={() => setSearchLang(searchLang === 'pt' ? 'en' : 'pt')}
            className="flex items-center space-x-1.5 font-mono text-[10px] tracking-widest text-[#e8e8e0]/60 hover:text-[#c8a96e] transition-colors border border-[#e8e8e0]/10 px-2.5 py-1.5 rounded uppercase"
          >
            <Globe className="h-3 w-3 text-[#c8a96e]" />
            <span>Search scope: {searchLang === 'pt' ? 'Portuguese' : 'English'}</span>
          </button>
        </div>
      </div>

      {/* ── Search Input Box ── */}
      <div className="max-w-3xl mx-auto w-full relative mb-12">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('placeholder')}
            className="w-full font-mono text-sm bg-black/60 border border-[#e8e8e0]/10 hover:border-[#c8a96e]/30 rounded pl-12 pr-12 py-4 text-[#e8e8e0] focus:border-[#c8a96e] focus:outline-none focus:ring-0 placeholder-[#e8e8e0]/30 shadow-2xl transition-all"
            autoFocus
          />
          <Search className="absolute left-4 top-[17px] h-5 w-5 text-[#e8e8e0]/30" />
          {loading && (
            <Loader2 className="absolute right-4 top-[17px] h-5 w-5 text-[#c8a96e] animate-spin" />
          )}
        </div>

        {/* Suggested Searches */}
        <div className="flex flex-wrap items-center gap-2 mt-4 px-1 font-mono text-[10px]">
          <span className="text-[#e8e8e0]/40 uppercase flex items-center space-x-1">
            <Sparkles className="h-3 w-3 text-[#c8a96e]/70 mr-1" />
            <span>Suggestions:</span>
          </span>
          {SUGGESTIONS[searchLang].map((sug) => (
            <button
              key={sug}
              onClick={() => setQuery(sug)}
              className="border border-[#e8e8e0]/10 hover:border-[#c8a96e]/30 text-[#e8e8e0]/60 hover:text-[#c8a96e] px-2 py-0.5 rounded transition-all"
            >
              {sug}
            </button>
          ))}
        </div>
      </div>

      {/* ── Search Results ── */}
      <div className="flex-grow">
        {loading ? (
          /* Skeletons loading block */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="border border-[#c8a96e]/10 rounded h-80 flex flex-col p-5 bg-[#050508]/30 overflow-hidden"
              >
                <div className="aspect-video w-full rounded bg-white/[0.02] skeleton-shimmer mb-4" />
                <div className="h-4 w-3/4 rounded bg-white/[0.02] skeleton-shimmer mb-3" />
                <div className="h-4 w-1/2 rounded bg-white/[0.02] skeleton-shimmer mt-auto" />
              </div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-6">
            <div className="font-mono text-[10px] text-[#e8e8e0]/40 uppercase tracking-wider mb-2">
              {t('results', { count: results.length })}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((doc) => (
                <DocumentCard key={doc.id} doc={doc} locale={locale} />
              ))}
            </div>
          </div>
        ) : hasSearched ? (
          /* Empty results state */
          <div className="text-center py-20 border border-[#c8a96e]/10 rounded bg-[#050508]/40 max-w-xl mx-auto w-full flex flex-col items-center justify-center p-6">
            <HelpCircle className="h-10 w-10 text-[#cc3333] mb-4" />
            <p className="font-mono text-sm font-bold text-[#e8e8e0] mb-2 uppercase">
              {t('no_results', { query: debouncedQuery })}
            </p>
            <p className="font-mono text-xs text-[#e8e8e0]/40 max-w-sm">
              Please refine your search string or toggle your search scope language (PT/EN) to search within translated records.
            </p>
          </div>
        ) : (
          /* Initial empty state */
          <div className="text-center py-20 border border-dashed border-[#c8a96e]/15 rounded max-w-xl mx-auto w-full flex flex-col items-center justify-center p-6">
            <Search className="h-10 w-10 text-[#e8e8e0]/20 mb-4" />
            <p className="font-mono text-sm text-[#e8e8e0]/60 uppercase tracking-widest font-bold mb-2">
              Ready for Search Inputs
            </p>
            <p className="font-mono text-xs text-[#e8e8e0]/40 max-w-sm leading-relaxed">
              Use keywords to query all UAP declassified archives. Terms found in titles, summaries, and locations will be surfaced.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
