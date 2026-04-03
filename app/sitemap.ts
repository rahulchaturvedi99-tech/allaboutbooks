import { getAllBooks } from '@/lib/data';

const SITE_URL = 'https://allaboutbooks.co';

export default async function sitemap() {
  const books = await getAllBooks();

  const bookUrls = books.map(book => ({
    url: `${SITE_URL}/books/${book.slug || book.id}`,
    lastModified: book.created_at || new Date().toISOString(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [
    { url: SITE_URL, lastModified: new Date().toISOString(), changeFrequency: 'daily' as const, priority: 1.0 },
    { url: `${SITE_URL}/books`, lastModified: new Date().toISOString(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${SITE_URL}/authors`, lastModified: new Date().toISOString(), changeFrequency: 'weekly' as const, priority: 0.8 },
    ...bookUrls,
  ];
}
