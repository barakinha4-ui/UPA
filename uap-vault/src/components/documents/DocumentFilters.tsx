'use client';

import { useSearchParams } from 'next/navigation';
import { usePathname, useRouter } from '@/lib/navigation';
import { useTranslations } from 'next-intl';
import { SlidersHorizontal, ArrowUpDown, RefreshCw, ChevronDown, X } from 'lucide-react';
import { useState } from 'react';
import { COUNTRIES } from '@/types/database';
import { motion, AnimatePresence } from 'framer-motion';

const AGENCIES = Array.from(new Set([
  'DOW', 'FBI', 'NASA', 'STATE', 'ODNI', 'DOE', 'USAF', 'USN', 'CIA', 'OTHER',
  ...COUNTRIES.flatMap(c => c.agencies)
])).sort();

const PROGRAMS = Array.from(new Set(COUNTRIES.flatMap(c => c.programs))).sort();
const MEDIA_TYPES = ['video', 'pdf', 'image', 'document', 'mixed'];
const CLASSIFICATIONS = ['unresolved', 'resolved_natural', 'resolved_manmade', 'unknown'];

export default function DocumentFilters() {
  const t = useTranslations('filters');
  const tDoc = useTranslations('document');
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [open, setOpen] = useState(false);

  const activeAgencies = searchParams.get('agency') ? searchParams.get('agency')!.split(',') : [];
  const activeMediaTypes = searchParams.get('mediaType') ? searchParams.get('mediaType')!.split(',') : [];
  const activeClassifications = searchParams.get('classification') ? searchParams.get('classification')!.split(',') : [];
  const activeCountry = searchParams.get('country') ? searchParams.get('country')!.split(',') : [];
  const activeProgram = searchParams.get('program') ? searchParams.get('program')!.split(',') : [];
  const activeYear = searchParams.get('year') || '';
  const activeSort = searchParams.get('orderBy') || 'newest';

  const years = Array.from({ length: 2026 - 1947 + 1 }, (_, i) => 2026 - i);

  const totalActive =
    activeAgencies.length +
    activeMediaTypes.length +
    activeClassifications.length +
    activeCountry.length +
    activeProgram.length +
    (activeYear ? 1 : 0);

  const updateParam = (key: string, value: string | string[] | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
      params.delete(key);
    } else if (Array.isArray(value)) {
      params.set(key, value.join(','));
    } else {
      params.set(key, value);
    }
    params.delete('page');
    replace(`${pathname}?${params.toString()}`);
  };

  const handleMultiSelect = (key: string, currentList: string[], item: string) => {
    const newList = currentList.includes(item)
      ? currentList.filter((i) => i !== item)
      : [...currentList, item];
    updateParam(key, newList);
  };

  const clearAllFilters = () => replace(pathname);

  const FilterChip = ({
    label,
    active,
    onClick,
  }: {
    label: string;
    active: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`font-mono text-[10px] tracking-wider border rounded-sm px-2.5 py-1 transition-all duration-150 whitespace-nowrap ${
        active
          ? 'border-[#c8a96e] text-[#c8a96e] bg-[#c8a96e]/10 font-bold shadow-[0_0_8px_rgba(200,169,110,0.15)]'
          : 'border-[#e8e8e0]/10 text-[#e8e8e0]/50 hover:border-[#e8e8e0]/25 hover:text-[#e8e8e0]/80'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="mb-6 space-y-2">
      {/* Top bar: Filter toggle + Sort */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Filter toggle button */}
        <button
          onClick={() => setOpen(!open)}
          className={`flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider border px-4 py-2 rounded-sm transition-all duration-200 ${
            open || totalActive > 0
              ? 'border-[#c8a96e]/60 text-[#c8a96e] bg-[#c8a96e]/8'
              : 'border-[#e8e8e0]/10 text-[#e8e8e0]/60 hover:border-[#c8a96e]/30 hover:text-[#c8a96e]'
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Filters</span>
          {totalActive > 0 && (
            <span className="bg-[#c8a96e] text-black rounded-full h-4 w-4 flex items-center justify-center text-[9px] font-black">
              {totalActive}
            </span>
          )}
        </button>

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-3.5 w-3.5 text-[#c8a96e]/60" />
          <div className="relative">
            <select
              value={activeSort}
              onChange={(e) => updateParam('orderBy', e.target.value)}
              className="font-mono text-xs bg-black/60 border border-[#e8e8e0]/10 hover:border-[#c8a96e]/30 rounded-sm pl-3 pr-7 py-2 text-[#e8e8e0]/70 focus:border-[#c8a96e] focus:outline-none appearance-none cursor-pointer"
            >
              <option value="newest">{t('sort_newest')}</option>
              <option value="oldest">{t('sort_oldest')}</option>
              <option value="views">{t('sort_views')}</option>
            </select>
            <ChevronDown className="absolute right-2 top-2.5 h-3 w-3 text-[#e8e8e0]/40 pointer-events-none" />
          </div>
        </div>

        {/* Active filter pills */}
        {totalActive > 0 && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold text-[#cc3333] border border-[#cc3333]/20 hover:border-[#cc3333]/50 hover:bg-[#cc3333]/5 px-3 py-2 rounded-sm transition-colors"
          >
            <X className="h-3 w-3" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Collapsible filter panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="filters"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border border-[#c8a96e]/10 rounded-sm bg-[#06060a]/90 backdrop-blur-sm p-5 space-y-5">

              {/* Row 1: Country + Media type + Classification */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Country */}
                <div>
                  <h4 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#c8a96e]/70 mb-2.5">
                    {tDoc('country')}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {COUNTRIES.map((country) => (
                      <FilterChip
                        key={country.code}
                        label={`${country.flag} ${country.code}`}
                        active={activeCountry.includes(country.code)}
                        onClick={() => handleMultiSelect('country', activeCountry, country.code)}
                      />
                    ))}
                  </div>
                </div>

                {/* Media Type */}
                <div>
                  <h4 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#c8a96e]/70 mb-2.5">
                    {tDoc('media_type')}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {MEDIA_TYPES.map((type) => (
                      <FilterChip
                        key={type}
                        label={type}
                        active={activeMediaTypes.includes(type)}
                        onClick={() => handleMultiSelect('mediaType', activeMediaTypes, type)}
                      />
                    ))}
                  </div>
                </div>

                {/* Classification */}
                <div>
                  <h4 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#c8a96e]/70 mb-2.5">
                    {tDoc('classification')}
                  </h4>
                  <div className="flex flex-col gap-1.5">
                    {CLASSIFICATIONS.map((c) => (
                      <label key={c} className="flex items-center gap-2.5 cursor-pointer select-none group">
                        <input
                          type="checkbox"
                          checked={activeClassifications.includes(c)}
                          onChange={() => handleMultiSelect('classification', activeClassifications, c)}
                          className="rounded-sm border-[#e8e8e0]/20 text-[#c8a96e] focus:ring-[#c8a96e] bg-black/40 h-3.5 w-3.5"
                        />
                        <span className="font-mono text-[10px] text-[#e8e8e0]/60 group-hover:text-[#e8e8e0] tracking-wider uppercase transition-colors">
                          {tDoc(c)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 2: Agency + Year */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 border-t border-[#c8a96e]/5">
                {/* Agency (spans 2 cols) */}
                <div className="md:col-span-2">
                  <h4 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#c8a96e]/70 mb-2.5">
                    {tDoc('agency')}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {AGENCIES.map((agency) => (
                      <FilterChip
                        key={agency}
                        label={agency}
                        active={activeAgencies.includes(agency)}
                        onClick={() => handleMultiSelect('agency', activeAgencies, agency)}
                      />
                    ))}
                  </div>
                </div>

                {/* Year */}
                <div>
                  <h4 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#c8a96e]/70 mb-2.5">
                    Incident Year
                  </h4>
                  <div className="relative">
                    <select
                      value={activeYear}
                      onChange={(e) => updateParam('year', e.target.value)}
                      className="w-full font-mono text-xs bg-black/60 border border-[#e8e8e0]/10 hover:border-[#c8a96e]/30 rounded-sm px-3 py-2 text-[#e8e8e0]/80 focus:border-[#c8a96e] focus:outline-none appearance-none cursor-pointer"
                    >
                      <option value="">{t('all_years')}</option>
                      {years.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 h-3.5 w-3.5 text-[#e8e8e0]/40 pointer-events-none" />
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
