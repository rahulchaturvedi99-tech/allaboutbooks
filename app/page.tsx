import type { Metadata } from 'next';
import { getAllBooks, getAllAuthors, getTrendingBooks } from '@/lib/data';
import { BookCard } from '@/components/books/BookCard';
import { HomeClient } from './HomeClient';
import Link from 'next/link';
import { TrendingUp, Sparkles, BookOpen, Globe, Languages, ArrowRight } from 'lucide-react';

export const revalidate = 3600; // Revalidate every hour

// Homepage-specific SEO: tells Google this page's "official" address.
export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default async function HomePage() {
  const [books, authors, trending] = await Promise.all([
    getAllBooks(),
    getAllAuthors(),
    getTrendingBooks(),
  ]);

  const getAuthor = (id: string) => authors.find(a => a.id === id);

  // 6 covers to fill the hero's right side. Use trending if we have enough,
  // otherwise fall back to the general book list.
  const heroCovers = (trending.length >= 6 ? trending : books).slice(0, 6);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-gray-100" style={{ background: 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 50%, #EFF6FF 100%)' }}>
        <div className="container-page relative py-10 sm:py-14">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Left: text */}
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-100 rounded-full text-orange-700 text-xs font-bold mb-5">
                <Sparkles className="w-3.5 h-3.5" /> AI-Powered Book Summaries
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-[1.1]">
                Discover your next<span className="text-orange-500"> great read</span>
              </h1>
              <p className="text-gray-500 text-base sm:text-lg mt-4 leading-relaxed max-w-lg">
                Explore curated books with AI-generated summaries in
                <span className="font-semibold text-gray-700"> English</span> and
                <span className="font-semibold text-gray-700"> Hindi</span>. Quick insights for busy readers.
              </p>
              <div className="mt-6">
                <Link href="/books" className="btn-primary py-3">
                  Browse All Books <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-6 text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <BookOpen className="w-4 h-4 text-orange-500" />
                  <span className="font-bold text-gray-800">{books.length}</span> Books
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span className="font-bold text-gray-800">{authors.length}</span> Authors
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Languages className="w-4 h-4 text-violet-500" /> English & Hindi
                </div>
              </div>
            </div>

            {/* Right: floating book covers (hidden on small screens) */}
            <div className="hidden lg:grid grid-cols-3 gap-4">
              {heroCovers.map((book, i) => (
                <Link
                  key={book.id}
                  href={`/books/${book.slug || book.id}`}
                  className={`block ${i % 2 === 1 ? 'mt-8' : ''}`}
                >
                  <img
                    src={book.cover_url}
                    alt={book.title}
                    className="w-full aspect-[2/3] object-cover rounded-xl shadow-lg hover:-translate-y-1 transition-transform duration-200"
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trending */}
      {trending.length > 0 && (
        <section className="container-page py-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-gray-900">Trending Now</h2>
                <p className="text-sm text-gray-400 mt-0.5">Most popular picks this week</p>
              </div>
            </div>
            <Link href="/books" className="text-sm font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-1">
              See all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
            {trending.map((book, i) => (
              <BookCard key={book.id} book={book} author={getAuthor(book.author_id)} index={i} />
            ))}
          </div>
        </section>
      )}

      <div className="container-page"><div className="border-t border-gray-100" /></div>

      {/* All Books with client-side filtering */}
      <HomeClient books={books} authors={authors} />

      {/* JSON-LD: site search */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'AllAboutBooks',
        url: 'https://allaboutbooks.co',
        description: 'Discover books with AI-powered summaries in English and Hindi.',
        potentialAction: { '@type': 'SearchAction', target: 'https://allaboutbooks.co/books?q={search_term_string}', 'query-input': 'required name=search_term_string' },
      })}} />

      {/* JSON-LD: book collection (helps Google understand your catalog) */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'AllAboutBooks — Book Summaries in English & Hindi',
        description: `Browse ${books.length} books with AI-generated summaries in English and Hindi.`,
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: books.length,
          itemListElement: (trending.length ? trending : books).slice(0, 10).map((b, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `https://allaboutbooks.co/books/${b.slug || b.id}`,
            name: b.title,
          })),
        },
      })}} />
    </div>
  );
}