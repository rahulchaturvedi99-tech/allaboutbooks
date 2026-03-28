import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useBooks } from '@/hooks/useBooks';
import { BookCard } from '@/components/books/BookCard';
import { Search, TrendingUp, BookOpen, Sparkles, ArrowRight, Globe, Languages } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const { books, authors, trendingBooks, isLoading, error, getAuthor, allGenres, searchBooks } = useBooks();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLang, setFilterLang] = useState('all');
  const [selectedGenre, setSelectedGenre] = useState('All');

  const filteredBooks = useMemo(() => {
    return searchBooks(searchQuery, filterLang, selectedGenre);
  }, [searchQuery, filterLang, selectedGenre, books]);

  const recentBooks = useMemo(() => filteredBooks.slice(0, 12), [filteredBooks]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center animate-float">
            <BookOpen className="w-6 h-6 text-orange-500" />
          </div>
          <p className="text-gray-500 font-medium">Loading your bookshelf...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-red-500 font-semibold mb-2">Something went wrong</p>
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-gray-100" style={{ background: 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 50%, #EFF6FF 100%)' }}>
        <div className="container-page relative py-16 sm:py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-100 rounded-full text-orange-700 text-xs font-bold mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Book Summaries
            </div>
            
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight leading-[1.1]">
              Discover your next
              <span className="text-orange-500"> great read</span>
            </h1>
            
            <p className="text-gray-500 text-lg sm:text-xl mt-5 leading-relaxed max-w-lg">
              Explore curated books with AI-generated summaries in 
              <span className="font-semibold text-gray-700"> English</span> and 
              <span className="font-semibold text-gray-700"> Hindi</span>. 
              Quick insights for busy readers.
            </p>

            {/* Search */}
            <div className="mt-8 flex items-center gap-3 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title, author, or genre..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-white rounded-xl border border-gray-200 
                           focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all
                           text-sm placeholder:text-gray-300"
                  style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                />
              </div>
              <Link to="/books" className="btn-primary py-3.5 whitespace-nowrap">
                Browse All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Stats */}
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
                <Languages className="w-4 h-4 text-violet-500" />
                <span>English & Hindi</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Section */}
      {trendingBooks.length > 0 && (
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
            <Link to="/books" className="text-sm font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-1 transition-colors">
              See all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {trendingBooks.slice(0, 6).map((book, i) => (
              <BookCard key={book.id} book={book} author={getAuthor(book.author_id)} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Divider */}
      <div className="container-page"><div className="border-t border-gray-100" /></div>

      {/* All Books Section */}
      <section className="container-page py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display text-2xl font-bold text-gray-900">All Books</h2>
            <p className="text-sm text-gray-400 mt-0.5">{filteredBooks.length} books found</p>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {['all', 'english', 'hindi'].map(lang => (
              <button
                key={lang}
                onClick={() => setFilterLang(lang)}
                className={cn(
                  'px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200',
                  filterLang === lang
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                )}
              >
                {lang === 'all' ? 'All' : lang === 'english' ? 'English' : 'हिंदी'}
              </button>
            ))}
            
            <select
              value={selectedGenre}
              onChange={e => setSelectedGenre(e.target.value)}
              className="px-3 py-2 rounded-lg text-xs font-bold bg-gray-100 border-none text-gray-600 
                       focus:ring-2 focus:ring-orange-200 outline-none cursor-pointer"
            >
              <option value="All">All Genres</option>
              {allGenres.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        {/* Book Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {recentBooks.map((book, i) => (
            <BookCard key={book.id} book={book} author={getAuthor(book.author_id)} index={i} />
          ))}
        </div>

        {filteredBooks.length > 12 && (
          <div className="text-center mt-12">
            <Link to="/books" className="btn-outline">
              View all {filteredBooks.length} books
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {filteredBooks.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No books found</p>
            <p className="text-gray-400 text-sm mt-1">Try a different search or filter</p>
          </div>
        )}
      </section>
    </div>
  );
}
