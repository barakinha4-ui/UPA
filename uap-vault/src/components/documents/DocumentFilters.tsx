'use client';

import { useSearchParams } from 'next/navigation';
import { usePathname, useRouter } from '@/lib/navigation';
import { useTranslations } from 'next-intl';
import { SlidersHorizontal, ArrowUpDown, RefreshCw, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const AGENCIES = ['DOW', 'FBI', 'NASA', 'STATE', 'ODNI', 'DOE', 'USAF', 'USN', 'CIA', 'OTHER'];
const MEDIA_TYPES = ['video', 'pdf', 'image', 'document', 'mixed'];
const CLASSIFICATIONS = ['unresolved', 'resolved_natural', 'resolved_manmade', 'unknown'];

export default function DocumentFilters() {
  const t = useTranslations('filters');
  const tDoc = useTranslations('document');
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Active filters from URL
  const activeAgencies = searchParams.get('agency') ? searchParams.get('agency')!.split(',') : [];
  const activeMediaTypes = searchParams.get('mediaType') ? searchParams.get('mediaType')!.split(',') : [];
  const activeClassifications = searchParams.get('classification') ? searchParams.get('classification')!.split(',') : [];
  const activeYear = searchParams.get('year') || '';
  const activeSort = searchParams.get('orderBy') || 'newest';

  // Available incident years from seed data and archives (1947 to 2026)
  const years = Array.from({ length: 2026 - 1947 + 1 }, (_, i) => 2026 - i);

  const updateParam = (key: string, value: string | string[] | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
      params.delete(key);
    } else if (Array.isArray(value)) {
      params.set(key, value.join(','));
    } else {
      params.set(key, value);
    }
    // Always reset page to 1 on filter changes
    params.delete('page');
    replace(`${pathname}?${params.toString()}`);
  };

  const handleMultiSelect = (key: string, currentList: string[], item: string) => {
    const newList = currentList.includes(item)
      ? currentList.filter((i) => i !== item)
      : [...currentList, item];
    updateParam(key, newList);
  };

  const clearAllFilters = () => {
    replace(pathname);
  };

  const FilterSections = () => (
    <div className="space-y-6">
      {/* Agency Filter */}
      <div>
        <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#c8a96e] mb-3">
          {tDoc('agency')}
        </h4>
        <div className="flex flex-wrap gap-2">
          {AGENCIES.map((agency) => {
            const isSelected = activeAgencies.includes(agency);
            return (
              <button
                key={agency}
                onClick={() => handleMultiSelect('agency', activeAgencies, agency)}
                className={`font-mono text-[10px] tracking-wider border rounded px-2.5 py-1 transition-colors ${
                  isSelected
                    ? 'border-[#c8a96e] text-[#c8a96e] bg-[#c8a96e]/10 font-bold'
                    : 'border-[#e8e8e0]/10 text-[#e8e8e0]/60 hover:border-[#e8e8e0]/20 hover:text-[#e8e8e0]'
                }`}
              >
                {agency}
              </button>
            );
          })}
        </div>
      </div>

      {/* Media Type Filter */}
      <div>
        <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#c8a96e] mb-3">
          {tDoc('media_type')}
        </h4>
        <div className="flex flex-wrap gap-2">
          {MEDIA_TYPES.map((type) => {
            const isSelected = activeMediaTypes.includes(type);
            return (
              <button
                key={type}
                onClick={() => handleMultiSelect('mediaType', activeMediaTypes, type)}
                className={`font-mono text-[10px] tracking-wider border rounded px-2.5 py-1 transition-colors capitalize ${
                  isSelected
                    ? 'border-[#c8a96e] text-[#c8a96e] bg-[#c8a96e]/10 font-bold'
                    : 'border-[#e8e8e0]/10 text-[#e8e8e0]/60 hover:border-[#e8e8e0]/20 hover:text-[#e8e8e0]'
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Classification Filter */}
      <div>
        <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#c8a96e] mb-3">
          {tDoc('classification')}
        </h4>
        <div className="flex flex-col space-y-1.5">
          {CLASSIFICATIONS.map((classification) => {
            const isSelected = activeClassifications.includes(classification);
            return (
              <label
                key={classification}
                className="flex items-center space-x-2.5 font-mono text-xs text-[#e8e8e0]/70 cursor-pointer select-none py-1 hover:text-[#e8e8e0]"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleMultiSelect('classification', activeClassifications, classification)}
                  className="rounded border-[#e8e8e0]/20 text-[#c8a96e] focus:ring-[#c8a96e] bg-black/40 h-3.5 w-3.5"
                />
                <span>{tDoc(classification)}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Incident Year Filter */}
      <div>
        <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#c8a96e] mb-3">
          Incident Year
        </h4>
        <div className="relative">
          <select
            value={activeYear}
            onChange={(e) => updateParam('year', e.target.value)}
            className="w-full font-mono text-xs bg-black/60 border border-[#e8e8e0]/10 hover:border-[#c8a96e]/30 rounded px-3 py-2 text-[#e8e8e0]/80 focus:border-[#c8a96e] focus:outline-none appearance-none cursor-pointer"
          >
            <option value="">{t('all_years')}</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-2.5 h-3.5 w-3.5 text-[#e8e8e0]/40 pointer-events-none" />
        </div>
      </div>

      {/* Clear Button */}
      {(activeAgencies.length > 0 ||
        activeMediaTypes.length > 0 ||
        activeClassifications.length > 0 ||
        activeYear) && (
        <button
          onClick={clearAllFilters}
          className="w-full flex items-center justify-center space-x-1.5 font-mono text-[10px] uppercase font-bold text-[#cc3333] border border-[#cc3333]/20 hover:border-[#cc3333]/40 hover:bg-[#cc3333]/5 py-2 rounded transition-colors"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Clear Active Filters</span>
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Top bar with mobile toggles and Sort selector */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between border-b border-[#c8a96e]/10 pb-4">
        {/* Mobile Filter Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex lg:hidden items-center justify-center space-x-2 font-mono text-xs font-bold uppercase tracking-wider border border-[#e8e8e0]/10 hover:border-[#c8a96e]/30 bg-white/[0.01] px-4 py-2.5 rounded text-[#e8e8e0]/80"
        >
          <SlidersHorizontal className="h-4 w-4 text-[#c8a96e]" />
          <span>Filters</span>
        </button>

        {/* Desktop Title */}
        <div className="hidden lg:flex items-center space-x-2 font-mono text-sm tracking-wider text-[#e8e8e0]/60">
          <SlidersHorizontal className="h-4 w-4 text-[#c8a96e]" />
          <span className="uppercase font-bold">Search Filter Parameters</span>
        </div>

        {/* Sort Selector */}
        <div className="flex items-center space-x-3 self-end sm:self-auto w-full sm:w-auto">
          <ArrowUpDown className="h-4 w-4 text-[#c8a96e] hidden sm:block" />
          <div className="relative w-full sm:w-48">
            <select
              value={activeSort}
              onChange={(e) => updateParam('orderBy', e.target.value)}
              className="w-full font-mono text-xs bg-black/60 border border-[#e8e8e0]/10 hover:border-[#c8a96e]/30 rounded px-3 py-2.5 text-[#e8e8e0]/80 focus:border-[#c8a96e] focus:outline-none appearance-none cursor-pointer"
            >
              <option value="newest">{t('sort_newest')}</option>
              <option value="oldest">{t('sort_oldest')}</option>
              <option value="views">{t('sort_views')}</option>
            </select>
            <ChevronDown className="absolute right-3 top-3 h-3.5 w-3.5 text-[#e8e8e0]/40 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Collapsible list) */}
      {mobileOpen && (
        <div className="lg:hidden border border-[#c8a96e]/10 p-5 rounded bg-[#07070a] shadow-inner space-y-6">
          <FilterSections />
        </div>
      )}

      {/* Desktop Sidebar filter layout is handled in page grid. This is just for Sidebar content when embedded */}
      <div className="hidden lg:block border border-[#c8a96e]/10 p-6 rounded bg-[#050508]/60 backdrop-blur-sm shadow-xl sticky top-24">
        <FilterSections />
      </div>
    </div>
  );
}
