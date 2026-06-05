import type { Metadata } from 'next';
import { getAllBooks, getAllAuthors, getTrendingBooks } from '@/lib/data';
import { BookCard } from '@/components/books/BookCard';
import { HomeClient } from './HomeClient';
import Link from 'next/link';
import { TrendingUp, Sparkles, BookOpen, Globe, Languages, ArrowRight } from 'lucide-react';
import { HeroSearch } from './HeroSearch';

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

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
       <section
        className="relative border-b border-amber-100"
        style={{ background: 'radial-gradient(ellipse 80% 90% at 50% 0%, #FBF1DE 0%, #FDF8F0 45%, #FFFFFF 100%)' }}
      >
        <div className="container-page py-7 sm:py-9">
          <div className="max-w-2xl mx-auto text-center">
            <p className="font-display italic text-amber-700/80 text-base mb-2">
              For the curious reader
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-[1.1]">
              What would you like to read today?
            </h1>
            <p className="text-gray-500 text-base mt-3 mb-5 max-w-lg mx-auto leading-relaxed">
              Hundreds of books with AI-written summaries in English &amp; Hindi — find your next great read in seconds.
            </p>

            {/* The search bar — the star of the show */}
            <div className="max-w-xl mx-auto">
              <HeroSearch />
            </div>

            {/* Quick-search chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-sm">
              <span className="text-gray-400">Popular:</span>
              {['Fiction', 'Self-Help', 'Biography', 'History', 'Business'].map((term) => (
                <Link
                  key={term}
                  href={`/books?q=${encodeURIComponent(term)}`}
                  className="px-3 py-1 rounded-full bg-white ring-1 ring-amber-200/70 text-amber-800 hover:bg-amber-50 transition"
                >
                  {term}
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