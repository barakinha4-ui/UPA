'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';
import { UapDocument, COUNTRIES } from '@/types/database';
import { motion } from 'framer-motion';
import { FileText, Video, Image as ImageIcon, File, FolderOpen, Play, FileSearch } from 'lucide-react';

interface DocumentCardProps {
  doc: UapDocument;
  locale: 'pt' | 'en';
}

export const AGENCY_COLORS: Record<string, { text: string; border: string; bg: string }> = {
  DOW: { text: 'text-blue-400', border: 'border-blue-400/30', bg: 'bg-blue-950/80' },
  FBI: { text: 'text-amber-400', border: 'border-amber-400/30', bg: 'bg-amber-950/80' },
  NASA: { text: 'text-cyan-400', border: 'border-cyan-400/30', bg: 'bg-cyan-950/80' },
  CIA: { text: 'text-rose-500', border: 'border-rose-500/30', bg: 'bg-rose-950/80' },
  ODNI: { text: 'text-purple-400', border: 'border-purple-400/30', bg: 'bg-purple-950/80' },
  STATE: { text: 'text-emerald-400', border: 'border-emerald-400/30', bg: 'bg-emerald-950/80' },
  DOE: { text: 'text-orange-400', border: 'border-orange-400/30', bg: 'bg-orange-950/80' },
  USAF: { text: 'text-sky-400', border: 'border-sky-400/30', bg: 'bg-sky-950/80' },
  USN: { text: 'text-indigo-400', border: 'border-indigo-400/30', bg: 'bg-indigo-950/80' },
  OTHER: { text: 'text-gray-400', border: 'border-gray-400/30', bg: 'bg-gray-950/80' },
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
  const MediaIcon = MEDIA_ICONS[doc.media_type] || File;
  const isVideo = doc.media_type === 'video';

  // Use proxy for war.gov to bypass hotlink protection
  const proxiedThumbnail = doc.thumbnail_url?.startsWith('https://www.war.gov/')
    ? doc.thumbnail_url.replace('https://www.war.gov/', '/api/proxy-war/')
    : doc.thumbnail_url;

  const hasThumbnail = !imgError && !!proxiedThumbnail;

  const countryInfo = COUNTRIES.find(c => c.code === doc.country);

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="relative group rounded overflow-hidden bg-[#07070a] shadow-2xl cursor-pointer"
    >
      <Link href={`/documentos/${doc.slug}`} className="block aspect-video relative overflow-hidden">

        {/* Thumbnail / Fallback */}
        {hasThumbnail ? (
          <img
            src={proxiedThumbnail!}
            alt={title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 brightness-75 group-hover:brightness-90"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0d0d12] via-[#111118] to-[#0a0a0f]">
            <MediaIcon className="h-10 w-10 text-[#c8a96e]/20 mb-2" />
            <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#c8a96e]/30">
              {doc.agency} // RECORD
            </span>
          </div>
        )}

        {/* Dark gradient overlay at bottom for title */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />

        {/* Top-left: Agency badge */}
        <div className={`absolute top-2 left-2 flex items-center space-x-1 font-mono text-[9px] font-bold tracking-widest uppercase border px-2 py-0.5 rounded-sm shadow-md z-10 backdrop-blur-sm ${agencyStyle.text} ${agencyStyle.border} ${agencyStyle.bg}`}>
          {countryInfo?.flag && <span>{countryInfo.flag}</span>}
          <span>{doc.agency}</span>
        </div>

        {/* Top-right: Media type icon */}
        <div className="absolute top-2 right-2 z-10 bg-black/70 backdrop-blur-sm border border-white/10 rounded-sm p-1">
          <MediaIcon className="h-3 w-3 text-white/60" />
        </div>

        {/* Center: Play/View button on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-3 shadow-2xl">
            {isVideo
              ? <Play className="h-6 w-6 text-white fill-white" />
              : <FileSearch className="h-6 w-6 text-white" />
            }
          </div>
        </div>

        {/* Bottom: Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-3 pb-3 pt-6">
          {doc.incident_year && (
            <span className="font-mono text-[9px] text-[#c8a96e]/70 tracking-widest uppercase block mb-1">
              {doc.incident_year} · {doc.location_name || 'UNKNOWN LOCATION'}
            </span>
          )}
          <h3 className="font-serif text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-[#c8a96e] transition-colors duration-200">
            {title}
          </h3>
        </div>

      </Link>
    </motion.div>
  );
}
