import { getBookBySlug, getAuthorById, getBooksByAuthor, getAllBooks } from '@/lib/data';
import { BookCard } from '@/components/books/BookCard';
import { AISummary } from '@/components/summary/AISummary';
import { cn, getGenreClass, generateAmazonLink } from '@/lib/utils';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import {
  ArrowLeft, Calendar, BookOpen, User, Hash, Globe,
  ShoppingCart, TrendingUp, Star, ChevronRight
} from 'lucide-react';

export const revalidate = 3600;

// Generate static params for all books (SSG)
export async function generateStaticParams() {
  const books = await getAllBooks();
  return books.filter(b => b.slug).map(b => ({ slug: b.slug! }));
}

// Dynamic metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const book = await getBookBySlug(params.slug);
  if (!book) return { title: 'Book Not Found' };

  const author = book.author_id ? await getAuthorById(book.author_id) : null;

  return {
    title: `${book.title} by ${author?.name || 'Unknown'} — Summary & Key Insights`,
    description: book.short_summary || book.description || `Read the AI-generated summary of ${book.title}`,
    openGraph: {
      title: `${book.title} — Summary`,
      description: book.short_summary || book.description || '',
      images: book.cover_url ? [{ url: book.cover_url, width: 400, height: 600 }] : [],
      type: 'book',
    },
  };
}

export default async function BookDetailPage({ params }: { params: { slug: string } }) {
  const book = await getBookBySlug(params.slug);
  if (!book) notFound();

  const author = book.author_id ? await getAuthorById(book.author_id) : null;
  const authorBooks = book.author_id ? (await getBooksByAuthor(book.author_id)).filter(b => b.id !== book.id) : [];
  const amazonLink = book.amazon_link || generateAmazonLink(book.isbn, book.title);

  // JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.title,
    author: { '@type': 'Person', name: author?.name || 'Unknown' },
    isbn: book.isbn || undefined,
    numberOfPages: book.pages || undefined,
    inLanguage: book.language === 'hindi' ? 'hi' : 'en',
    datePublished: String(book.published_year),
    description: book.short_summary || book.description,
    image: book.cover_url,
    url: `https://allaboutbooks.co/books/${book.slug || book.id}`,
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.0', bestRating: '5', ratingCount: '1' },
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      url: amazonLink,
      priceCurrency: 'INR',
      seller: { '@type': 'Organization', name: 'Amazon.in' },
    },
  };

  const faqLd = book.short_summary ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: `What is ${book.title} about?`, acceptedAnswer: { '@type': 'Answer', text: book.short_summary } },
      { '@type': 'Question', name: `Who wrote ${book.title}?`, acceptedAnswer: { '@type': 'Answer', text: `${book.title} was written by ${author?.name || 'the author'} and published in ${book.published_year}.` } },
    ],
  } : null;

  return (
    <div className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}

      <div className="container-page py-6">
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-orange-500 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/books" className="hover:text-orange-500 transition-colors">Books</Link>
          <span>/</span>
          <span className="text-gray-600 line-clamp-1">{book.title}</span>
        </nav>

        <div className="grid lg:grid-cols-[320px_1fr] gap-10">
          {/* Cover + Buy */}
          <div className="space-y-5">
            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-gray-100" style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
              {book.cover_url ? (
                <Image src={book.cover_url} alt={`${book.title} book cover`} fill className="object-cover" sizes="320px" priority />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 font-display text-xl font-bold p-6 text-center">{book.title}</div>
              )}
              {book.language && (
                <div className={cn('absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-bold', book.language === 'hindi' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white')}>
                  {book.language === 'hindi' ? 'हिंदी' : 'English'}
                </div>
              )}
              {book.trending && (
                <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400 text-amber-900 text-xs font-bold">
                  <TrendingUp className="w-3 h-3" /> Trending
                </div>
              )}
            </div>

            <a href={amazonLink} target="_blank" rel="noopener noreferrer nofollow"
              className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all active:scale-[0.98]"
              style={{ boxShadow: '0 4px 12px rgba(245,158,11,0.3)' }}>
              <ShoppingCart className="w-5 h-5" /> Buy on Amazon
            </a>
            <p className="text-[10px] text-gray-400 text-center">As an Amazon Associate, we earn from qualifying purchases</p>
          </div>

          {/* Details */}
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
              {book.title_hindi || book.title}
            </h1>
            {book.title_hindi && <p className="text-lg text-gray-500 mt-1">{book.title}</p>}

            {author && (
              <div className="flex items-center gap-2 mt-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="font-semibold text-gray-700">{author.name}</span>
              </div>
            )}

            <div className="flex items-center gap-2 mt-4">
              <div className="flex items-center gap-0.5">
                {[1,2,3,4].map(i => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                <Star className="w-4 h-4 text-gray-200" />
              </div>
              <span className="text-sm text-gray-400">4.0</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 p-4 bg-gray-50 rounded-2xl">
              {[
                { icon: Calendar, label: 'Published', value: String(book.published_year) },
                { icon: BookOpen, label: 'Pages', value: String(book.pages || '—') },
                { icon: Globe, label: 'Language', value: book.language === 'hindi' ? 'Hindi' : 'English' },
                { icon: Hash, label: 'ISBN', value: book.isbn || '—' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</p>
                    <p className="text-sm font-semibold text-gray-700">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {book.genre?.map(g => <span key={g} className={cn('genre-pill', getGenreClass(g))}>{g}</span>)}
            </div>

            {book.description && (
              <div className="mt-6">
                <h2 className="font-display text-lg font-bold text-gray-800 mb-2">About this book</h2>
                <p className="text-gray-600 leading-relaxed text-sm">{book.description}</p>
              </div>
            )}

            <div className="mt-8">
              <AISummary book={book} />
            </div>

            {authorBooks.length > 0 && (
              <div className="mt-10">
                <h2 className="font-display text-lg font-bold text-gray-800 mb-4">More by {author?.name}</h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {authorBooks.slice(0, 5).map((b, i) => <BookCard key={b.id} book={b} index={i} />)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
