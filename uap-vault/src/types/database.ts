export type UapAgency = 
  | 'DOW' | 'FBI' | 'NASA' | 'STATE' | 'CIA' | 'ODNI' | 'DOE' | 'USAF' | 'USN'
  // Brazil
  | 'FAB' | 'SNI' | 'COMDABRA'
  // France
  | 'GEIPAN'
  // UK
  | 'MOD'
  // Chile
  | 'CEFAA'
  // Canada
  | 'DND'
  // Catch-all
  | 'OTHER';

export type CountryCode = 'US' | 'BR' | 'FR' | 'GB' | 'CL' | 'CA' | 'OTHER';

export type SourceProgram = 
  | 'PURSUE'
  // Brazil
  | 'OPERACAO_PRATO' | 'OPERACAO_SAUCER' | 'SIOANI' | 'CIOANI'
  // France
  | 'GEIPAN_ARCHIVE' | 'COMETA'
  // UK
  | 'MOD_FOI' | 'PROJECT_CONDIGN'
  // Chile
  | 'CEFAA_ARCHIVE'
  // Canada
  | 'DND_ARCHIVE' | 'PROJECT_MAGNET' | 'PROJECT_SECOND_STOREY'
  // US Legacy
  | 'PROJECT_BLUE_BOOK' | 'PROJECT_GRUDGE' | 'PROJECT_SIGN' | 'AATIP'
  | 'OTHER';

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
  agency: UapAgency | string;
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
  // Global expansion fields
  country?: CountryCode | string;
  source_program?: SourceProgram | string;
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
  countries: number;
  min_year: number | null;
  max_year: number | null;
}

// Country metadata for UI
export interface CountryInfo {
  code: CountryCode;
  flag: string;
  name_en: string;
  name_pt: string;
  agencies: string[];
  programs: string[];
  docCount?: number;
}

export const COUNTRIES: CountryInfo[] = [
  {
    code: 'US', flag: '🇺🇸',
    name_en: 'United States', name_pt: 'Estados Unidos',
    agencies: ['DOW', 'FBI', 'NASA', 'STATE', 'CIA', 'ODNI', 'DOE', 'USAF', 'USN'],
    programs: ['PURSUE', 'PROJECT_BLUE_BOOK', 'PROJECT_GRUDGE', 'PROJECT_SIGN', 'AATIP'],
  },
  {
    code: 'BR', flag: '🇧🇷',
    name_en: 'Brazil', name_pt: 'Brasil',
    agencies: ['FAB', 'SNI', 'COMDABRA'],
    programs: ['OPERACAO_PRATO', 'OPERACAO_SAUCER', 'SIOANI', 'CIOANI'],
  },
  {
    code: 'FR', flag: '🇫🇷',
    name_en: 'France', name_pt: 'França',
    agencies: ['GEIPAN'],
    programs: ['GEIPAN_ARCHIVE', 'COMETA'],
  },
  {
    code: 'GB', flag: '🇬🇧',
    name_en: 'United Kingdom', name_pt: 'Reino Unido',
    agencies: ['MOD'],
    programs: ['MOD_FOI', 'PROJECT_CONDIGN'],
  },
  {
    code: 'CL', flag: '🇨🇱',
    name_en: 'Chile', name_pt: 'Chile',
    agencies: ['CEFAA'],
    programs: ['CEFAA_ARCHIVE'],
  },
  {
    code: 'CA', flag: '🇨🇦',
    name_en: 'Canada', name_pt: 'Canadá',
    agencies: ['DND'],
    programs: ['DND_ARCHIVE', 'PROJECT_MAGNET', 'PROJECT_SECOND_STOREY'],
  },
];
