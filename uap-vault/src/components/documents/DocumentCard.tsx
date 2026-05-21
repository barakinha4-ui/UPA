'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';
import { UapDocument, COUNTRIES } from '@/types/database';
import { motion } from 'framer-motion';
import { FileText, Video, Image as ImageIcon, File, FolderOpen, MapPin, Calendar, Eye } from 'lucide-react';

interface DocumentCardProps {
  doc: UapDocument;
  locale: 'pt' | 'en';
}

export const AGENCY_COLORS: Record<string, { text: string; border: string; bg: string }> = {
  DOW: { text: 'text-blue-400', border: 'border-blue-400/30', bg: 'bg-blue-950/20' },
  FBI: { text: 'text-amber-400', border: 'border-amber-400/30', bg: 'bg-amber-950/20' },
  NASA: { text: 'text-cyan-400', border: 'border-cyan-400/30', bg: 'bg-cyan-950/20' },
  CIA: { text: 'text-rose-500', border: 'border-rose-500/30', bg: 'bg-rose-950/20' },
  ODNI: { text: 'text-purple-400', border: 'border-purple-400/30', bg: 'bg-purple-950/20' },
  STATE: { text: 'text-emerald-400', border: 'border-emerald-400/30', bg: 'bg-emerald-950/20' },
  DOE: { text: 'text-orange-400', border: 'border-orange-400/30', bg: 'bg-orange-950/20' },
  USAF: { text: 'text-sky-400', border: 'border-sky-400/30', bg: 'bg-sky-950/20' },
  USN: { text: 'text-indigo-400', border: 'border-indigo-400/30', bg: 'bg-indigo-950/20' },
  OTHER: { text: 'text-gray-400', border: 'border-gray-400/30', bg: 'bg-gray-950/20' },
};

export const CLASSIFICATION_COLORS = {
  unresolved: 'border-[#cc3333] text-[#cc3333] bg-[#cc3333]/5',
  resolved_natural: 'border-emerald-500 text-emerald-400 bg-emerald-500/5',
  resolved_manmade: 'border-blue-500 text-blue-400 bg-blue-500/5',
  unknown: 'border-gray-500 text-gray-400 bg-gray-500/5',
};

export const MEDIA_ICONS = {
  video: Video,
  pdf: FileText,
  image: ImageIcon,
  document: File,
  mixed: FolderOpen,
};

export default function DocumentCard({ doc, locale }: DocumentCardProps) {
  const t = useTranslations('document');
  const [imgError, setImgError] = useState(false);
  
  const title = locale === 'pt' ? doc.title_pt : doc.title_en;
  const agencyStyle = AGENCY_COLORS[doc.agency] || AGENCY_COLORS.OTHER;
  const classStyle = CLASSIFICATION_COLORS[doc.classification] || CLASSIFICATION_COLORS.unknown;
  const MediaIcon = MEDIA_ICONS[doc.media_type] || File;

  // Use proxy for war.gov to bypass hotlink protection
  const proxiedThumbnail = doc.thumbnail_url?.startsWith('https://www.war.gov/')
    ? doc.thumbnail_url.replace('https://www.war.gov/', '/api/proxy-war/')
    : doc.thumbnail_url;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-full bg-white/[0.02] border border-[#c8a96e]/10 hover:border-[#c8a96e]/30 rounded overflow-hidden shadow-lg group relative"
    >
      {/* Visual glowing border effect on hover */}
      <div className="absolute inset-0 border border-transparent group-hover:border-[#c8a96e]/20 pointer-events-none transition-colors duration-300" />
      
      {/* Card Header / Thumbnail */}
      <Link href={`/documentos/${doc.slug}`} className="relative block aspect-video overflow-hidden bg-[#0a0a0c] border-b border-[#c8a96e]/10">
        {!imgError && proxiedThumbnail ? (
          <img
            src={proxiedThumbnail}
            alt={title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
            loading="lazy"
          />
        ) : (
          /* Missing Thumbnail Fallback */
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-[#e8e8e0]/40 select-none bg-gradient-to-b from-black/60 to-[#c8a96e]/5 relative overflow-hidden">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#e8e8e0] to-transparent" />
            <div className="relative z-10 flex flex-col items-center">
              <MediaIcon className="h-8 w-8 text-[#c8a96e]/30 mb-2 group-hover:text-[#c8a96e]/50 transition-colors duration-300" />
              <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#c8a96e]/40">
                {doc.agency} // RECORD
              </span>
            </div>
          </div>
        )}
        
        {/* Floating Agency stamp on top-left of image */}
        <span className={`absolute top-3 left-3 flex items-center space-x-1 font-mono text-[10px] font-bold tracking-widest uppercase border px-2 py-0.5 rounded shadow-md z-10 ${agencyStyle.text} ${agencyStyle.border} ${agencyStyle.bg}`}>
          {(() => {
            const countryInfo = COUNTRIES.find(c => c.code === doc.country);
            return countryInfo?.flag ? <span className="mr-1">{countryInfo.flag}</span> : null;
          })()}
          <span>{doc.agency}</span>
        </span>

        {/* Media type float indicator */}
        <div className="absolute bottom-3 right-3 bg-black/75 border border-[#e8e8e0]/10 p-1.5 rounded z-10 text-[#e8e8e0]/60 group-hover:text-[#c8a96e] transition-colors">
          <MediaIcon className="h-4 w-4" />
        </div>
      </Link>

      {/* Card Body */}
      <div className="flex flex-col flex-grow p-5">
        {/* Classification and Views */}
        <div className="flex items-center justify-between mb-3 text-[10px] font-mono">
          <span className={`border px-2 py-0.5 rounded font-bold uppercase tracking-wider ${classStyle}`}>
            {t(doc.classification)}
          </span>
          <span className="flex items-center space-x-1 text-[#e8e8e0]/40">
            {doc.view_count > 0 ? (
              <>
                <Eye className="h-3.5 w-3.5" />
                <span>{doc.view_count}</span>
              </>
            ) : (
              <span className="text-[9px] text-[#c8a96e] border border-[#c8a96e]/30 bg-[#c8a96e]/10 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">
                {locale === 'pt' ? 'NOVO' : 'NEW'}
              </span>
            )}
          </span>
        </div>

        {/* Title */}
        <Link href={`/documentos/${doc.slug}`} className="block group-hover:text-[#c8a96e] transition-colors mb-4 flex-grow">
          <h3 className="font-serif text-base font-bold text-[#e8e8e0] group-hover:text-[#c8a96e] line-clamp-2 leading-snug">
            {title}
          </h3>
        </Link>

        {/* Metas: Location & Date */}
        <div className="border-t border-[#c8a96e]/5 pt-4 mt-auto space-y-2 text-xs font-mono text-[#e8e8e0]/50">
          <div className="flex items-center space-x-2">
            <MapPin className="h-3.5 w-3.5 text-[#c8a96e]/70 flex-shrink-0" />
            <span className="truncate" title={doc.location_name || t('unknown')}>
              {doc.location_name || t('unknown')}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-3.5 w-3.5 text-[#c8a96e]/70 flex-shrink-0" />
            <span>
              {doc.incident_date || doc.incident_year || t('unknown')}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
