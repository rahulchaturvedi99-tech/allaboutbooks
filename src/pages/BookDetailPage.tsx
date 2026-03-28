import { useParams, Link } from 'react-router-dom';
import { useBooks } from '@/hooks/useBooks';
import { BookCard } from '@/components/books/BookCard';
import { AISummary } from '@/components/summary/AISummary';
import { SEOHead } from '@/components/layout/SEOHead';
import { BookStructuredData, BookFAQData } from '@/components/layout/StructuredData';
import { cn, getGenreClass, generateAmazonLink } from '@/lib/utils';
import { useState } from 'react';
import {
  ArrowLeft, Calendar, BookOpen, User, Hash, Globe,
  ShoppingCart, TrendingUp, Star, ChevronRight
} from 'lucide-react';

export default function BookDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { getBookBySlug, getAuthor, getBooksByAuthor, isLoading } = useBooks();
  const [imgError, setImgError] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center animate-float">
          <BookOpen className="w-5 h-5 text-orange-500" />
        </div>
      </div>
    );
  }

  const book = slug ? getBookBySlug(slug) : null;
  if (!book) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
        <BookOpen className="w-16 h-16 text-gray-200" />
        <h1 className="font-display text-2xl font-bold text-gray-800">Book not found</h1>
        <Link to="/" className="btn-primary">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    );
  }

  const author = getAuthor(book.author_id);
  const authorBooks = getBooksByAuthor(book.author_id).filter(b => b.id !== book.id);
  const amazonLink = book.amazon_link || generateAmazonLink(book.isbn, book.title);

  const coverSrc = imgError || !book.cover_url
    ? `https://placehold.co/400x600/F97316/white?text=${encodeURIComponent(book.title.slice(0, 20))}`
    : book.cover_url;

  return (
    <div className="min-h-screen bg-white">
      {/* SEO */}
      <SEOHead
        title={`${book.title} by ${author?.name || 'Unknown'} — Summary & Key Insights`}
        description={book.short_summary || book.description || `Read the AI-generated summary of ${book.title}`}
        image={book.cover_url}
        url={`/books/${book.slug || book.id}`}
        type="book"
        author={author?.name}
        isbn={book.isbn}
        publishedYear={book.published_year}
      />
      <BookStructuredData book={book} author={author} />
      <BookFAQData book={book} author={author} />

      <div className="container-page py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link to="/" className="hover:text-orange-500 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/books" className="hover:text-orange-500 transition-colors">Books</Link>
          <span>/</span>
          <span className="text-gray-600 line-clamp-1">{book.title}</span>
        </nav>

        {/* Main Layout */}
        <div className="grid lg:grid-cols-[320px_1fr] gap-10">
          {/* Left: Cover + Buy */}
          <div className="space-y-5">
            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-gray-100"
                 style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
              <img
                src={coverSrc}
                alt={`${book.title} book cover`}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
                referrerPolicy="no-referrer"
              />
              {book.language && (
                <div className={cn(
                  'absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-bold',
                  book.language === 'hindi' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'
                )}>
                  {book.language === 'hindi' ? 'हिंदी' : 'English'}
                </div>
              )}
              {book.trending && (
                <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400 text-amber-900 text-xs font-bold">
                  <TrendingUp className="w-3 h-3" /> Trending
                </div>
              )}
            </div>

            <a
              href={amazonLink}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600
                       text-white font-bold rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all
                       active:scale-[0.98]"
              style={{ boxShadow: '0 4px 12px rgba(245,158,11,0.3)' }}
            >
              <ShoppingCart className="w-5 h-5" />
              Buy on Amazon
            </a>
            <p className="text-[10px] text-gray-400 text-center">
              As an Amazon Associate, we earn from qualifying purchases
            </p>
          </div>

          {/* Right: Details */}
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
              {book.title_hindi || book.title}
            </h1>
            {book.title_hindi && (
              <p className="text-lg text-gray-500 mt-1">{book.title}</p>
            )}

            {author && (
              <div className="flex items-center gap-2 mt-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="font-semibold text-gray-700">{author.name_hindi || author.name}</span>
              </div>
            )}

            <div className="flex items-center gap-2 mt-4">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4].map(i => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
                <Star className="w-4 h-4 text-gray-200" />
              </div>
              <span className="text-sm text-gray-400">4.0 • Community rating</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Published</p>
                  <p className="text-sm font-semibold text-gray-700">{book.published_year}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Pages</p>
                  <p className="text-sm font-semibold text-gray-700">{book.pages || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Language</p>
                  <p className="text-sm font-semibold text-gray-700 capitalize">{book.language}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">ISBN</p>
                  <p className="text-sm font-semibold text-gray-700 font-mono">{book.isbn || '—'}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {book.genre?.map(g => (
                <span key={g} className={cn('genre-pill', getGenreClass(g))}>{g}</span>
              ))}
            </div>

            {book.description && (
              <div className="mt-6">
                <h2 className="font-display text-lg font-bold text-gray-800 mb-2">About this book</h2>
                <p className="text-gray-600 leading-relaxed text-sm">{book.description}</p>
              </div>
            )}

            <div className="mt-8">
              <AISummary book={book} authorName={author?.name} />
            </div>

            {authorBooks.length > 0 && (
              <div className="mt-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg font-bold text-gray-800">
                    More by {author?.name}
                  </h2>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {authorBooks.slice(0, 5).map((b, i) => (
                    <BookCard key={b.id} book={b} index={i} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
