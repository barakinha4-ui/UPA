'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';
import { UapDocument } from '@/types/database';
import { AGENCY_COLORS, CLASSIFICATION_COLORS, MEDIA_ICONS } from './DocumentCard';
import DocumentCard from './DocumentCard';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Eye, ShieldAlert, FileText, Globe, ExternalLink, Tag } from 'lucide-react';

const MiniMap = dynamic(() => import('@/components/map/MiniMap'), { ssr: false });

interface DocumentDetailProps {
  doc: UapDocument;
  relatedDocs: UapDocument[];
  locale: 'pt' | 'en';
}

export default function DocumentDetail({ doc, relatedDocs, locale }: DocumentDetailProps) {
  const t = useTranslations('document');
  const [contentLang, setContentLang] = useState<'pt' | 'en'>(locale);

  const title = contentLang === 'pt' ? doc.title_pt : doc.title_en;
  const summary = contentLang === 'pt' ? doc.summary_pt : doc.summary_en;
  const analysis = contentLang === 'pt' ? doc.analysis_pt : doc.analysis_en;

  const agencyStyle = AGENCY_COLORS[doc.agency] || AGENCY_COLORS.OTHER;
  const classStyle = CLASSIFICATION_COLORS[doc.classification] || CLASSIFICATION_COLORS.unknown;
  const MediaIcon = MEDIA_ICONS[doc.media_type] || FileText;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* ── Breadcrumb ── */}
      <div className="text-[10px] font-mono text-[#e8e8e0]/40 flex items-center space-x-1.5 uppercase mb-6">
        <Link href="/" className="hover:text-[#c8a96e] transition-colors">Home</Link>
        <span>&gt;</span>
        <Link href="/documentos" className="hover:text-[#c8a96e] transition-colors">Documentos</Link>
        <span>&gt;</span>
        <span className="text-[#c8a96e] font-bold truncate max-w-[200px] sm:max-w-xs">{title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left/Middle Column (Media, Analysis, Metadata) ── */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Media Container (Video Player or Thumbnail) */}
          <div className="border border-[#c8a96e]/10 rounded overflow-hidden bg-black/40 aspect-video relative">
            {doc.media_type === 'video' || doc.video_url?.endsWith('.mp4') ? (
              <video
                src={doc.video_url || (doc.thumbnail_url ? doc.thumbnail_url.replace(/\.(jpg|jpeg|png)$/i, '.mp4') : undefined)}
                className="w-full h-full object-contain bg-black"
                controls
                autoPlay
                muted
                loop
                poster={doc.thumbnail_url || undefined}
              />
            ) : doc.video_url ? (
              <iframe
                src={doc.video_url}
                className="w-full h-full"
                allowFullScreen
                title={title}
              />
            ) : doc.thumbnail_url ? (
              <img
                src={doc.thumbnail_url}
                alt={title}
                className="w-full h-full object-cover opacity-80"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-[#e8e8e0]/20 select-none">
                <ShieldAlert className="h-12 w-12 text-[#cc3333]/40 mb-3" />
                <span className="font-mono text-xs tracking-widest uppercase text-[#cc3333]/50">
                  CLASSIFIED // RECORD VISUALS SECURED
                </span>
              </div>
            )}

            {/* Float Badge */}
            <span className="absolute bottom-4 left-4 font-mono text-[9px] text-[#cc3333] border border-[#cc3333]/30 px-2 py-0.5 rounded bg-black/80 select-none">
              {doc.official_id || 'UAP-RECORD-FILE'}
            </span>
          </div>

          {/* Core Content Card */}
          <div className="border border-[#c8a96e]/10 rounded p-6 sm:p-8 bg-[#050508]/60 backdrop-blur-sm shadow-xl">
            
            {/* Title & Language Toggle Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#c8a96e]/10 pb-6 mb-6">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#e8e8e0] leading-snug">
                {title}
              </h1>
              
              {/* Slick content translation toggle */}
              <div className="flex items-center space-x-1 border border-[#e8e8e0]/10 p-0.5 rounded bg-black/40 font-mono text-[10px] self-end sm:self-auto shrink-0">
                <button
                  onClick={() => setContentLang('pt')}
                  className={`px-2.5 py-1 rounded font-bold uppercase transition-colors ${
                    contentLang === 'pt' ? 'bg-[#c8a96e] text-[#0a0a0f]' : 'text-[#e8e8e0]/40 hover:text-[#e8e8e0]'
                  }`}
                >
                  PT
                </button>
                <button
                  onClick={() => setContentLang('en')}
                  className={`px-2.5 py-1 rounded font-bold uppercase transition-colors ${
                    contentLang === 'en' ? 'bg-[#c8a96e] text-[#0a0a0f]' : 'text-[#e8e8e0]/40 hover:text-[#e8e8e0]'
                  }`}
                >
                  EN
                </button>
              </div>
            </div>

            {/* Badges Bar */}
            <div className="flex flex-wrap gap-2.5 mb-8">
              <span className={`font-mono text-[10px] font-bold tracking-widest uppercase border px-2.5 py-1 rounded ${agencyStyle.text} ${agencyStyle.border} ${agencyStyle.bg}`}>
                {doc.agency}
              </span>
              <span className={`font-mono text-[10px] font-bold tracking-widest uppercase border px-2.5 py-1 rounded ${classStyle}`}>
                {t(doc.classification)}
              </span>
              <span className="flex items-center space-x-1.5 font-mono text-[10px] border border-[#e8e8e0]/10 px-2.5 py-1 rounded bg-white/[0.01] text-[#e8e8e0]/60 capitalize">
                <MediaIcon className="h-3 w-3 text-[#c8a96e]" />
                <span>{t(doc.media_type)}</span>
              </span>
            </div>

            {/* Summary Block */}
            {summary && (
              <div className="space-y-3 mb-8">
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#c8a96e]">
                  {t('summary')}
                </h3>
                <p className="font-sans text-sm sm:text-base text-[#e8e8e0]/80 leading-relaxed text-justify">
                  {summary}
                </p>
              </div>
            )}

            {/* AI Analysis Featured Card */}
            {analysis && (
              <div className="border border-[#c8a96e]/20 p-5 sm:p-6 rounded bg-[#c8a96e]/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 font-mono text-[8px] tracking-widest text-[#c8a96e]/30 select-none uppercase px-3 py-1 font-bold border-l border-b border-[#c8a96e]/15">
                  AI INTEL ANALYSIS
                </div>
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#c8a96e] mb-3">
                  {t('analysis')}
                </h3>
                <p className="font-mono text-xs sm:text-sm text-[#e8e8e0]/90 leading-relaxed whitespace-pre-line text-justify">
                  {analysis}
                </p>
              </div>
            )}

            {/* Tags Pills */}
            {doc.tags && doc.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8 border-t border-[#c8a96e]/5 pt-6">
                {doc.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center space-x-1 font-mono text-[9px] uppercase tracking-wider bg-white/[0.02] border border-[#e8e8e0]/10 px-2 py-0.5 rounded text-[#e8e8e0]/60"
                  >
                    <Tag className="h-2.5 w-2.5 text-[#c8a96e]/70" />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
            )}

          </div>
        </div>

        {/* ── Right Column (Metadata, Mini Map, Actions) ── */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Metadata Card */}
          <div className="border border-[#c8a96e]/10 rounded p-5 bg-[#050508]/60 backdrop-blur-sm shadow-xl font-mono text-xs space-y-4">
            <div className="text-[10px] text-[#c8a96e] tracking-widest font-bold uppercase border-b border-[#c8a96e]/10 pb-2">
              RECORD METADATA
            </div>

            {/* Location */}
            <div className="space-y-1">
              <span className="text-[#e8e8e0]/30 uppercase block text-[10px]">Location</span>
              <div className="flex items-start space-x-2 text-[#e8e8e0]/80">
                <MapPin className="h-4 w-4 text-[#c8a96e]/80 shrink-0 mt-0.5" />
                <span>{doc.location_name || t('unknown')}</span>
              </div>
              {doc.location_region && (
                <span className="text-[#e8e8e0]/40 pl-6 block text-[11px] italic">{doc.location_region}</span>
              )}
            </div>

            {/* Incident Date */}
            <div className="space-y-1">
              <span className="text-[#e8e8e0]/30 uppercase block text-[10px]">{t('incident_date')}</span>
              <div className="flex items-center space-x-2 text-[#e8e8e0]/80">
                <Calendar className="h-4 w-4 text-[#c8a96e]/80 shrink-0" />
                <span>{doc.incident_date || doc.incident_year || t('unknown')}</span>
              </div>
            </div>

            {/* Declassification Date */}
            {doc.release_date && (
              <div className="space-y-1">
                <span className="text-[#e8e8e0]/30 uppercase block text-[10px]">Declassification Date</span>
                <div className="flex items-center space-x-2 text-[#e8e8e0]/80">
                  <FileText className="h-4 w-4 text-[#c8a96e]/80 shrink-0" />
                  <span>{new Date(doc.release_date).toLocaleDateString()}</span>
                </div>
              </div>
            )}

            {/* Views counter */}
            <div className="space-y-1">
              <span className="text-[#e8e8e0]/30 uppercase block text-[10px]">Document Views</span>
              <div className="flex items-center space-x-2 text-[#e8e8e0]/80">
                <Eye className="h-4 w-4 text-[#c8a96e]/80 shrink-0" />
                <span>{doc.view_count || 0} hits</span>
              </div>
            </div>

            {/* Link to war.gov original */}
            {doc.original_url && (
              <a
                href={doc.original_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center space-x-1.5 font-mono text-[10px] uppercase font-bold text-center border border-[#cc3333]/20 hover:border-[#cc3333]/40 bg-[#cc3333]/5 py-2.5 rounded transition-all text-[#e8e8e0]"
              >
                <ExternalLink className="h-3 w-3 text-[#cc3333]" />
                <span>{t('view_original')}</span>
              </a>
            )}
          </div>

          {/* Mini Leaflet Map */}
          {doc.lat !== null && doc.lng !== null && (
            <div className="space-y-2">
              <span className="font-mono text-[10px] text-[#e8e8e0]/40 uppercase tracking-wider block">
                // GEOLOCATION PING
              </span>
              <MiniMap
                lat={doc.lat}
                lng={doc.lng}
                locationName={doc.location_name || 'UAP Incident'}
                agency={doc.agency}
              />
            </div>
          )}

        </div>
      </div>

      {/* ── Related Documents Section ── */}
      {relatedDocs && relatedDocs.length > 0 && (
        <section className="mt-16 pt-12 border-t border-[#c8a96e]/10">
          <div className="mb-8">
            <span className="font-mono text-[9px] font-bold tracking-[0.2em] text-[#c8a96e] uppercase">
              // DISCLOSURE CORRELATION
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#e8e8e0] mt-1">
              {t('related')}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedDocs.map((rDoc) => (
              <DocumentCard key={rDoc.id} doc={rDoc} locale={locale} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
