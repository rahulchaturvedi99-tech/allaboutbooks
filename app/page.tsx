import { getAllBooks, getAllAuthors, getTrendingBooks } from '@/lib/data';
import { BookCard } from '@/components/books/BookCard';
import { HomeClient } from './HomeClient';
import Link from 'next/link';
import { TrendingUp, Sparkles, BookOpen, Globe, Languages, ArrowRight } from 'lucide-react';

export const revalidate = 3600; // Revalidate every hour

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
      <section className="relative overflow-hidden border-b border-gray-100" style={{ background: 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 50%, #EFF6FF 100%)' }}>
        <div className="container-page relative py-16 sm:py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-100 rounded-full text-orange-700 text-xs font-bold mb-6">
              <Sparkles className="w-3.5 h-3.5" /> AI-Powered Book Summaries
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight leading-[1.1]">
              Discover your next<span className="text-orange-500"> great read</span>
            </h1>
            <p className="text-gray-500 text-lg sm:text-xl mt-5 leading-relaxed max-w-lg">
              Explore curated books with AI-generated summaries in
              <span className="font-semibold text-gray-700"> English</span> and
              <span className="font-semibold text-gray-700"> Hindi</span>. Quick insights for busy readers.
            </p>
            <div className="mt-8">
              <Link href="/books" className="btn-primary py-3.5">
                Browse All Books <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex items-center gap-6 mt-8 text-sm">
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
        </div>
      </section>

      {/* Trending */}
      {trending.length > 0 && (
        <section className="container-page py-12">
          <div className="flex items-center justify-between mb-8">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {trending.map((book, i) => (
              <BookCard key={book.id} book={book} author={getAuthor(book.author_id)} index={i} />
            ))}
          </div>
        </section>
      )}

      <div className="container-page"><div className="border-t border-gray-100" /></div>

      {/* All Books with client-side filtering */}
      <HomeClient books={books} authors={authors} />

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'AllAboutBooks',
        url: 'https://allaboutbooks.co',
        description: 'Discover books with AI-powered summaries in English and Hindi.',
        potentialAction: { '@type': 'SearchAction', target: 'https://allaboutbooks.co/books?q={search_term_string}', 'query-input': 'required name=search_term_string' },
      })}} />
    </div>
  );
}
