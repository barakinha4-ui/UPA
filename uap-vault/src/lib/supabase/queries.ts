import { createStaticClient } from './static';
import { UapDocument, UapRelease, VaultStats, COUNTRIES } from '@/types/database';

import pursueData from '../pursue-data.json';

// Will be populated once global-uap-data.json is generated
let globalData: UapDocument[] = [];
try {
  // Dynamic import workaround for JSON
  globalData = require('../global-uap-data.json') as UapDocument[];
} catch {
  // File doesn't exist yet — that's fine during dev
  globalData = [];
}

// Normalize pursue data: add country='US' and source_program='PURSUE' if missing
const normalizedPursueData = (pursueData as UapDocument[]).map(d => ({
  ...d,
  country: d.country || 'US',
  source_program: d.source_program || 'PURSUE',
}));

// Merge all data sources
function getAllLocalDocs(): UapDocument[] {
  return [...normalizedPursueData, ...globalData];
}

export async function getDocuments(filters: {
  agency?: string[];
  mediaType?: string[];
  classification?: string[];
  country?: string[];
  program?: string[];
  year?: number;
  page?: number;
  orderBy?: 'newest' | 'oldest' | 'views';
} = {}) {
  const supabase = createStaticClient();
  const limit = 20;
  const page = filters.page || 1;
  const from = (page - 1) * limit;
  const to = from + limit;

  // Fetch all published from Supabase
  const { data: dbData, error } = await supabase
    .from('documents')
    .select('*')
    .eq('is_published', true);

  if (error) {
    console.error('Error fetching documents:', error);
  }

  // Merge with local data
  let allDocs = [...(dbData || []).map((d: any) => ({ ...d, country: d.country || 'US', source_program: d.source_program || 'PURSUE' })), ...getAllLocalDocs()];

  // Deduplicate by slug
  const seen = new Set<string>();
  allDocs = allDocs.filter(d => {
    if (seen.has(d.slug)) return false;
    seen.add(d.slug);
    return true;
  });

  // Apply filters
  if (filters.agency && filters.agency.length > 0) {
    allDocs = allDocs.filter(d => filters.agency!.includes(d.agency));
  }
  if (filters.mediaType && filters.mediaType.length > 0) {
    allDocs = allDocs.filter(d => filters.mediaType!.includes(d.media_type));
  }
  if (filters.classification && filters.classification.length > 0) {
    allDocs = allDocs.filter(d => filters.classification!.includes(d.classification));
  }
  if (filters.country && filters.country.length > 0) {
    allDocs = allDocs.filter(d => filters.country!.includes(d.country || 'US'));
  }
  if (filters.program && filters.program.length > 0) {
    allDocs = allDocs.filter(d => filters.program!.includes(d.source_program || 'PURSUE'));
  }
  if (filters.year) {
    allDocs = allDocs.filter(d => d.incident_year === filters.year);
  }

  // Ordering
  if (filters.orderBy === 'oldest') {
    allDocs.sort((a, b) => {
      if (a.incident_year !== b.incident_year) return (a.incident_year || 0) - (b.incident_year || 0);
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  } else if (filters.orderBy === 'views') {
    allDocs.sort((a, b) => {
      if (a.view_count !== b.view_count) return (b.view_count || 0) - (a.view_count || 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  } else {
    // Default newest
    allDocs.sort((a, b) => {
      if (a.incident_year !== b.incident_year) return (b.incident_year || 0) - (a.incident_year || 0);
      const dateA = a.release_date ? new Date(a.release_date).getTime() : 0;
      const dateB = b.release_date ? new Date(b.release_date).getTime() : 0;
      if (dateA !== dateB) return dateB - dateA;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }

  const count = allDocs.length;
  const paginatedData = allDocs.slice(from, to);

  return { data: paginatedData, count };
}

export async function getDocumentBySlug(slug: string) {
  const supabase = createStaticClient();
  
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  const localDoc = getAllLocalDocs().find(d => d.slug === slug);
  const foundDoc = localDoc || data;

  if (!foundDoc) {
    return null;
  }

  // Increment view count (only if from DB)
  if (!localDoc) {
    try {
      await supabase.rpc('increment_view', { doc_slug: slug });
    } catch (err) {
      console.error('Failed to increment view count:', err);
    }
  }

  return { ...foundDoc, country: foundDoc.country || 'US', source_program: foundDoc.source_program || 'PURSUE' } as UapDocument;
}

export async function searchDocuments(queryStr: string, lang: 'pt' | 'en', page = 1) {
  const supabase = createStaticClient();
  const limit = 20;
  const offset = (page - 1) * limit;

  const { data, error } = await supabase.rpc('search_documents', {
    query: queryStr,
    lang,
    limit_n: limit,
    offset_n: offset
  });

  const localFiltered = getAllLocalDocs().filter(d => {
    const q = queryStr.toLowerCase();
    if (lang === 'pt') {
      return (d.title_pt?.toLowerCase().includes(q) || d.summary_pt?.toLowerCase().includes(q) || d.location_name?.toLowerCase().includes(q));
    }
    return (d.title_en?.toLowerCase().includes(q) || d.summary_en?.toLowerCase().includes(q) || d.location_name?.toLowerCase().includes(q));
  });

  const allResults = [...(data || []), ...localFiltered];
  // Deduplicate
  const seen = new Set<string>();
  const unique = allResults.filter(d => {
    if (seen.has(d.slug)) return false;
    seen.add(d.slug);
    return true;
  });
  return unique.slice(offset, offset + limit) as UapDocument[];
}

export async function getGeoDocuments() {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .not('lat', 'is', null)
    .not('lng', 'is', null)
    .eq('is_published', true);

  const localGeo = getAllLocalDocs().filter(d => d.lat !== null && d.lng !== null && d.lat !== 0 && d.lng !== 0);

  const all = [...(data || []), ...localGeo];
  const seen = new Set<string>();
  return all.filter(d => {
    if (seen.has(d.slug)) return false;
    seen.add(d.slug);
    return true;
  }) as UapDocument[];
}

export async function getRelatedDocuments(slug: string, agency: string, year: number) {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('is_published', true)
    .neq('slug', slug)
    .or(`agency.eq.${agency},incident_year.eq.${year}`)
    .limit(4);

  const localRelated = getAllLocalDocs().filter(d => d.slug !== slug && (d.agency === agency || d.incident_year === year)).slice(0, 4);
  const allRelated = [...(data || []), ...localRelated];
  const seen = new Set<string>();
  return allRelated.filter(d => {
    if (seen.has(d.slug)) return false;
    seen.add(d.slug);
    return true;
  }).slice(0, 4) as UapDocument[];
}

export async function getStats(): Promise<VaultStats> {
  const supabase = createStaticClient();
  const { data, error } = await supabase.rpc('get_vault_stats');

  const allDocs = getAllLocalDocs();
  
  let total = data?.total || 0;
  const agenciesSet = new Set<string>();
  const countriesSet = new Set<string>();
  let min_year = data?.min_year || 9999;
  let max_year = data?.max_year || 0;

  total += allDocs.length;
  allDocs.forEach(d => {
    agenciesSet.add(d.agency);
    countriesSet.add(d.country || 'US');
    if (d.incident_year) {
      min_year = Math.min(min_year, d.incident_year);
      max_year = Math.max(max_year, d.incident_year);
    }
  });

  return { 
    total, 
    agencies: agenciesSet.size > (data?.agencies || 0) ? agenciesSet.size : Math.max(agenciesSet.size, data?.agencies || 0), 
    countries: countriesSet.size,
    min_year: min_year === 9999 ? null : min_year, 
    max_year: max_year === 0 ? null : max_year 
  } as VaultStats;
}

// New: Get stats breakdown per country (for Sources page)
export async function getGlobalStats() {
  const allDocs = getAllLocalDocs();
  
  const byCountry: Record<string, number> = {};
  allDocs.forEach(d => {
    const c = d.country || 'US';
    byCountry[c] = (byCountry[c] || 0) + 1;
  });

  return { byCountry, total: allDocs.length };
}

// New: Get all documents (for Timeline page)
export async function getAllDocuments(): Promise<UapDocument[]> {
  return getAllLocalDocs();
}

export async function getReleases() {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from('releases')
    .select('*')
    .order('release_num', { ascending: false });

  const releases = data || [];
  // Add PURSUE Release 01 dynamically if not present
  if (!releases.find(r => r.release_num === 1)) {
    releases.push({
      id: 'pursue-release-1',
      release_num: 1,
      title: 'PURSUE Release 01 — Historic UAP Declassification',
      released_at: '2026-05-08T00:00:00Z',
      source_url: 'https://www.war.gov/News/Releases/Release/Article/4480582/',
      doc_count: 162,
      created_at: '2026-05-08T00:00:00Z'
    });
  } else {
    const r1 = releases.find(r => r.release_num === 1);
    if (r1) r1.doc_count += 162;
  }

  // Add Tranche 02 Pending
  releases.unshift({
      id: 'pursue-release-2',
      release_num: 2,
      title: 'PURSUE Release 02 — Tranche Pending',
      released_at: new Date().toISOString(),
      source_url: null,
      doc_count: 0,
      created_at: new Date().toISOString()
  });

  releases.sort((a, b) => b.release_num - a.release_num);

  return releases as UapRelease[];
}
