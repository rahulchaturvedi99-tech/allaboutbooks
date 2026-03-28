// ============================================
// Generate sitemap.xml for Google indexing
// Run: node generate-sitemap.mjs
// ============================================

import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';

const sb = createClient(
  'https://hshbqndvfeawxiyiwhxu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzaGJxbmR2ZmVhd3hpeWl3aHh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNDE3MzAsImV4cCI6MjA4OTkxNzczMH0.4HzN11HyAhXnlMjt0pn1RCnfUZi38M123LChPEDpAMs'
);

const SITE_URL = 'https://allaboutbooks.co';

async function generateSitemap() {
  console.log('🗺️ Generating sitemap.xml...\n');

  const { data: books } = await sb.from('books').select('id, title, created_at');
  const today = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <lastmod>${today}</lastmod>
  </url>
  <url>
    <loc>${SITE_URL}/books</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
    <lastmod>${today}</lastmod>
  </url>
  <url>
    <loc>${SITE_URL}/authors</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <lastmod>${today}</lastmod>
  </url>
`;

  for (const book of books || []) {
    const lastmod = book.created_at ? book.created_at.split('T')[0] : today;
    xml += `  <url>
    <loc>${SITE_URL}/books/${book.id}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <lastmod>${lastmod}</lastmod>
  </url>
`;
  }

  xml += `</urlset>`;

  writeFileSync('public/sitemap.xml', xml);
  console.log(`✅ Generated sitemap.xml with ${(books?.length || 0) + 3} URLs`);
  console.log('📁 Saved to public/sitemap.xml');
  console.log(`\nSubmit to Google: https://search.google.com/search-console`);
  console.log(`Add your sitemap URL: ${SITE_URL}/sitemap.xml`);
}

generateSitemap().then(() => process.exit(0));
