import { createStaticClient } from './static';
import { UapDocument, UapRelease, VaultStats } from '@/types/database';

export async function getDocuments(filters: {
  agency?: string[];
  mediaType?: string[];
  classification?: string[];
  year?: number;
  page?: number;
  orderBy?: 'newest' | 'oldest' | 'views';
} = {}) {
  const supabase = createStaticClient();
  const limit = 20;
  const page = filters.page || 1;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('documents')
    .select('*', { count: 'exact' })
    .eq('is_published', true);

  if (filters.agency && filters.agency.length > 0) {
    query = query.in('agency', filters.agency);
  }
  if (filters.mediaType && filters.mediaType.length > 0) {
    query = query.in('media_type', filters.mediaType);
  }
  if (filters.classification && filters.classification.length > 0) {
    query = query.in('classification', filters.classification);
  }
  if (filters.year) {
    query = query.eq('incident_year', filters.year);
  }

  // Ordering
  if (filters.orderBy === 'oldest') {
    query = query.order('incident_year', { ascending: true }).order('created_at', { ascending: true });
  } else if (filters.orderBy === 'views') {
    query = query.order('view_count', { ascending: false }).order('created_at', { ascending: false });
  } else {
    // Default newest (by year, release_date, then created_at)
    query = query
      .order('incident_year', { ascending: false })
      .order('release_date', { ascending: false })
      .order('created_at', { ascending: false });
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error('Error fetching documents:', error);
    return { data: [], count: 0 };
  }

  return { data: data as UapDocument[], count: count || 0 };
}

export async function getDocumentBySlug(slug: string) {
  const supabase = createStaticClient();
  
  // Fetch document
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error || !data) {
    console.error(`Error fetching document with slug ${slug}:`, error);
    return null;
  }

  // Increment view count atomic using the RPC we created
  try {
    await supabase.rpc('increment_view', { doc_slug: slug });
  } catch (err) {
    console.error('Failed to increment view count:', err);
  }

  return data as UapDocument;
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

  if (error) {
    console.error('Error in search:', error);
    return [];
  }

  return data as UapDocument[];
}

export async function getGeoDocuments() {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .not('lat', 'is', null)
    .not('lng', 'is', null)
    .eq('is_published', true);

  if (error) {
    console.error('Error fetching geo documents:', error);
    return [];
  }

  return data as UapDocument[];
}

export async function getRelatedDocuments(slug: string, agency: string, year: number) {
  const supabase = createStaticClient();
  // Fetch related docs (same agency or same year, excluding current)
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('is_published', true)
    .neq('slug', slug)
    .or(`agency.eq.${agency},incident_year.eq.${year}`)
    .limit(4);

  if (error) {
    console.error('Error fetching related documents:', error);
    return [];
  }

  return data as UapDocument[];
}

export async function getStats(): Promise<VaultStats> {
  const supabase = createStaticClient();
  const { data, error } = await supabase.rpc('get_vault_stats');

  if (error) {
    console.error('Error getting stats:', error);
    return { total: 0, agencies: 0, min_year: null, max_year: null };
  }

  return data as VaultStats;
}

export async function getReleases() {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from('releases')
    .select('*')
    .order('release_num', { ascending: false });

  if (error) {
    console.error('Error fetching releases:', error);
    return [];
  }

  return data as UapRelease[];
}
