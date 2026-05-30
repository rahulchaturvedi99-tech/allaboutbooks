import { NextRequest, NextResponse } from 'next/server';

// Shape the Add page expects (same as Google's), so we map both sources into it.
interface BookResult {
  id: string;
  volumeInfo: {
    title?: string;
    authors?: string[];
    description?: string;
    publishedDate?: string;
    pageCount?: number;
    categories?: string[];
    imageLinks?: { thumbnail?: string };
    industryIdentifiers?: { type: string; identifier: string }[];
  };
}

// ---------- Source 1: Google Books ----------
async function tryGoogle(query: string): Promise<BookResult[] | null> {
  const key = process.env.GOOGLE_BOOKS_API_KEY;
  const url =
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}` +
    `&maxResults=12&country=IN` + (key ? `&key=${key}` : '');

  const res = await fetch(url);
  if (!res.ok) return null; // 429 or any error -> signal "use fallback"
  const data = await res.json();
  return (data.items || []) as BookResult[];
}

// ---------- Source 2: Open Library (no key, generous limits) ----------
async function tryOpenLibrary(query: string): Promise<BookResult[]> {
  const url =
    `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}` +
    `&limit=12&fields=key,title,author_name,first_publish_year,isbn,cover_i,number_of_pages_median,subject`;

  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();

  // Map Open Library's format into the Google-style shape the page reads.
  return (data.docs || []).map((d: any) => ({
    id: d.key || Math.random().toString(),
    volumeInfo: {
      title: d.title,
      authors: d.author_name || [],
      description: '', // Open Library search doesn't return descriptions
      publishedDate: d.first_publish_year ? String(d.first_publish_year) : undefined,
      pageCount: d.number_of_pages_median || undefined,
      categories: (d.subject || []).slice(0, 3),
      imageLinks: d.cover_i
        ? { thumbnail: `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg` }
        : undefined,
      industryIdentifiers: d.isbn?.[0]
        ? [{ type: 'ISBN_13', identifier: d.isbn[0] }]
        : [],
    },
  })) as BookResult[];
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');
  if (!query) return NextResponse.json({ items: [], source: 'none' });

  // 1) Try Google.
  const google = await tryGoogle(query);
  if (google && google.length > 0) {
    return NextResponse.json({ items: google, source: 'google' });
  }

  // 2) Google failed/empty -> fall back to Open Library.
  const openLib = await tryOpenLibrary(query);
  return NextResponse.json({ items: openLib, source: 'openlibrary' });
}