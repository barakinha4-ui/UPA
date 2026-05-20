import MapWrapper from '@/components/map/MapWrapper';
import { getGeoDocuments } from '@/lib/supabase/queries';

export default async function MapPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;

  // Fetch all documents with geolocations (lat/lng not null) server-side
  const geoDocs = await getGeoDocuments();

  return (
    <MapWrapper
      documents={geoDocs}
      locale={locale as 'pt' | 'en'}
    />
  );
}
