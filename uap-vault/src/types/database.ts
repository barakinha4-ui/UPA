export type UapAgency = 'DOW' | 'FBI' | 'NASA' | 'STATE' | 'CIA' | 'ODNI' | 'DOE' | 'OTHER';

export type UapMediaType = 'video' | 'pdf' | 'image' | 'document' | 'mixed';

export type UapClassification = 'unresolved' | 'resolved_natural' | 'resolved_manmade' | 'unknown';

export interface UapDocument {
  id: string;
  slug: string;
  official_id: string | null;
  title_en: string;
  title_pt: string;
  summary_en: string | null;
  summary_pt: string | null;
  analysis_en: string | null;
  analysis_pt: string | null;
  agency: UapAgency;
  media_type: UapMediaType;
  classification: UapClassification;
  incident_date: string | null;
  incident_year: number | null;
  release_date: string | null;
  location_name: string | null;
  location_region: string | null;
  lat: number | null;
  lng: number | null;
  original_url: string | null;
  thumbnail_url: string | null;
  pdf_url: string | null;
  video_url: string | null;
  tags: string[];
  meta_description_pt: string | null;
  meta_description_en: string | null;
  is_published: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface UapRelease {
  id: string;
  release_num: number;
  title: string;
  released_at: string;
  source_url: string | null;
  doc_count: number;
  created_at: string;
}

export interface DocumentRelease {
  document_id: string;
  release_id: string;
}

export interface VaultStats {
  total: number;
  agencies: number;
  min_year: number | null;
  max_year: number | null;
}
