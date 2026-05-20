'use client';

import dynamic from 'next/dynamic';
import { UapDocument } from '@/types/database';
import { ShieldAlert } from 'lucide-react';

const IncidentMap = dynamic(() => import('@/components/map/IncidentMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[calc(100vh-4rem-64px)] flex flex-col items-center justify-center bg-[#07070a] text-[#e8e8e0]/60 font-mono text-sm border-t border-[#c8a96e]/10">
      <ShieldAlert className="h-8 w-8 text-[#c8a96e] animate-pulse mb-3" />
      LOADING STRATEGIC MAP GRAPHICS...
    </div>
  ),
});

export default function MapWrapper({
  documents,
  locale
}: {
  documents: UapDocument[];
  locale: 'pt' | 'en';
}) {
  return <IncidentMap documents={documents} locale={locale} />;
}
