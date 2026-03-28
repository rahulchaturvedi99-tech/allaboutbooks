import { useParams, Link } from 'react-router-dom';
import { useBooks } from '@/hooks/useBooks';
import { BookCard } from '@/components/books/BookCard';
import { cn, getGenreClass, generateAmazonLink } from '@/lib/utils';
import { useState } from 'react';
import {
  ArrowLeft, Calendar, BookOpen, User, Hash, Globe,
  ShoppingCart, TrendingUp, Star, Sparkles, Lock, ChevronRight
} from 'lucide-react';

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getBook, getAuthor, getBooksByAuthor, isLoading } = useBooks();
  const [imgError, setImgError] = useState(false);
  const [summaryTab, setSummaryTab] = useState<'short' | 'long'>('short');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center animate-float">
          <BookOpen className="w-5 h-5 text-brand-500" />
        </div>
      </div>
    );
  }

  const book = id ? getBook(id) : null;
  if (!book) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <BookOpen className="w-16 h-16 text-ink-200" />
        <h1 className="font-display text-2xl font-bold text-ink-800">Book not found</h1>
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
    <div className="min-h-screen bg-gradient-to-b from-brand-50/50 to-white">
      <div className="container-page py-6">
        {/* Breadcrumb */}
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-ink-400 hover:text-brand-500 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* Main Layout */}
        <div className="grid lg:grid-cols-[320px_1fr] gap-10">
          {/* Left: Cover + Buy */}
          <div className="space-y-5">
            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-book bg-ink-100">
              <img
                src={coverSrc}
                alt={book.title}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
                referrerPolicy="no-referrer"
              />
              {book.language && (
                <div className={cn(
                  'absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-bold',
                  book.language === 'hindi' ? 'bg-brand-500 text-white' : 'bg-sky-500 text-white'
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

            {/* Buy Button */}
            <a
              href={amazonLink}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 
                       text-white font-bold rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all 
                       shadow-lg hover:shadow-xl active:scale-[0.98]"
            >
              <ShoppingCart className="w-5 h-5" />
              Buy on Amazon
            </a>
            <p className="text-[10px] text-ink-400 text-center">
              As an Amazon Associate, we earn from qualifying purchases
            </p>
          </div>

          {/* Right: Details */}
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink-900 leading-tight">
              {book.title_hindi || book.title}
            </h1>
            {book.title_hindi && (
              <p className="text-lg text-ink-500 mt-1">{book.title}</p>
            )}

            {author && (
              <div className="flex items-center gap-2 mt-4">
                <div className="w-8 h-8 rounded-full bg-sage-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-sage-600" />
                </div>
                <span className="font-semibold text-ink-700">{author.name_hindi || author.name}</span>
              </div>
            )}

            {/* Rating placeholder */}
            <div className="flex items-center gap-2 mt-4">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4].map(i => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
                <Star className="w-4 h-4 text-ink-200" />
              </div>
              <span className="text-sm text-ink-400">4.0 • Community rating</span>
            </div>

            {/* Meta info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 p-4 bg-white rounded-2xl border border-ink-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-ink-400" />
                <div>
                  <p className="text-[10px] text-ink-400 uppercase tracking-wide">Published</p>
                  <p className="text-sm font-semibold text-ink-700">{book.published_year}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-ink-400" />
                <div>
                  <p className="text-[10px] text-ink-400 uppercase tracking-wide">Pages</p>
                  <p className="text-sm font-semibold text-ink-700">{book.pages || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-ink-400" />
                <div>
                  <p className="text-[10px] text-ink-400 uppercase tracking-wide">Language</p>
                  <p className="text-sm font-semibold text-ink-700 capitalize">{book.language}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-ink-400" />
                <div>
                  <p className="text-[10px] text-ink-400 uppercase tracking-wide">ISBN</p>
                  <p className="text-sm font-semibold text-ink-700 font-mono">{book.isbn || '—'}</p>
                </div>
              </div>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mt-4">
              {book.genre?.map(g => (
                <span key={g} className={cn('genre-pill', getGenreClass(g))}>{g}</span>
              ))}
            </div>

            {/* Description */}
            {book.description && (
              <div className="mt-6">
                <h3 className="font-display text-lg font-semibold text-ink-800 mb-2">About this book</h3>
                <p className="text-ink-600 leading-relaxed text-sm">{book.description}</p>
              </div>
            )}

            {/* AI Summary Section */}
            <div className="mt-8 bg-white rounded-2xl border border-ink-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-plum-100 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-plum-600" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-ink-800">AI Summary</h3>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSummaryTab('short')}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                      summaryTab === 'short' ? 'bg-plum-500 text-white' : 'bg-ink-50 text-ink-500'
                    )}
                  >
                    Quick
                  </button>
                  <button
                    onClick={() => setSummaryTab('long')}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1',
                      summaryTab === 'long' ? 'bg-plum-500 text-white' : 'bg-ink-50 text-ink-500'
                    )}
                  >
                    <Lock className="w-3 h-3" /> Deep Dive
                  </button>
                </div>
              </div>

              {summaryTab === 'short' ? (
                book.short_summary ? (
                  <div className="prose prose-sm max-w-none text-ink-600">
                    <p>{book.short_summary}</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Sparkles className="w-8 h-8 text-ink-200 mx-auto mb-3" />
                    <p className="text-ink-500 text-sm font-medium">AI summary coming soon</p>
                    <p className="text-ink-400 text-xs mt-1">We're generating summaries for all books</p>
                  </div>
                )
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-ink-200 rounded-xl bg-ink-50/50">
                  <Lock className="w-10 h-10 text-ink-300 mx-auto mb-3" />
                  <p className="font-semibold text-ink-700">Deep Dive — Premium Feature</p>
                  <p className="text-ink-400 text-sm mt-1 max-w-xs mx-auto">
                    Detailed 5-7 minute analysis with key quotes and actionable insights
                  </p>
                  <button className="btn-primary mt-4 text-sm">
                    <Sparkles className="w-4 h-4" /> Coming Soon
                  </button>
                </div>
              )}

              <p className="text-[10px] text-ink-400 mt-4 pt-3 border-t border-ink-100">
                AI-generated summary • Not a substitute for reading the book
              </p>
            </div>

            {/* More by Author */}
            {authorBooks.length > 0 && (
              <div className="mt-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-lg font-semibold text-ink-800">
                    More by {author?.name}
                  </h3>
                  <ChevronRight className="w-5 h-5 text-ink-400" />
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
