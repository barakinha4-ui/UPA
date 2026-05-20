import { MetadataRoute } from 'next';
import { createStaticClient } from '@/lib/supabase/static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://uapvault.com';
  
  // Minimal fallback in case static client fails or db is unavailable during build
  let docs: { slug: string; updated_at: string }[] = [];
  try {
    const supabase = createStaticClient();
    const { data } = await supabase
      .from('documents')
      .select('slug, updated_at')
      .eq('is_published', true);
    
    if (data) {
      docs = data;
    }
  } catch (error) {
    console.error('Sitemap DB query bypassed or failed:', error);
  }

  const staticRoutes = [
    '',
    '/documentos',
    '/mapa',
    '/busca',
  ];

  const routes: MetadataRoute.Sitemap = [];

  // Generate paths for both locales (pt and en)
  ['pt', 'en'].forEach((locale) => {
    // Static Routes
    staticRoutes.forEach((route) => {
      routes.push({
        url: `${siteUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: route === '' ? 1.0 : 0.8,
      });
    });

    // Dynamic Document Slugs
    docs.forEach((doc) => {
      routes.push({
        url: `${siteUrl}/${locale}/documentos/${doc.slug}`,
        lastModified: new Date(doc.updated_at),
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    });
  });

  return routes;
}
export const revalidate = 3600; // Cache sitemap for 1 hour (ISR)
