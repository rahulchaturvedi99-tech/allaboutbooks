import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'book';
  author?: string;
  isbn?: string;
  publishedYear?: number;
}

const SITE_NAME = 'AllAboutBooks';
const DEFAULT_DESC = 'Discover books with AI-powered summaries in English and Hindi. Quick insights for busy readers.';
const DEFAULT_IMAGE = 'https://hshbqndvfeawxiyiwhxu.supabase.co/storage/v1/object/public/book-covers/og-default.jpg';
const SITE_URL = 'https://allaboutbooks.co';

export function SEOHead({
  title,
  description = DEFAULT_DESC,
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  author,
  isbn,
  publishedYear,
}: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — AI Book Summaries in English & Hindi`;
  const fullUrl = url ? `${SITE_URL}${url}` : SITE_URL;

  useEffect(() => {
    // Title
    document.title = fullTitle;

    // Meta tags
    setMeta('description', description);

    // Open Graph
    setMeta('og:title', fullTitle, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:image', image, 'property');
    setMeta('og:url', fullUrl, 'property');
    setMeta('og:type', type, 'property');
    setMeta('og:site_name', SITE_NAME, 'property');

    // Twitter
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', description);
    setMeta('twitter:image', image);

    // Book-specific meta
    if (type === 'book') {
      if (author) setMeta('book:author', author, 'property');
      if (isbn) setMeta('book:isbn', isbn, 'property');
      if (publishedYear) setMeta('book:release_date', String(publishedYear), 'property');
    }

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = fullUrl;

  }, [fullTitle, description, image, fullUrl, type, author, isbn, publishedYear]);

  return null;
}

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
}
