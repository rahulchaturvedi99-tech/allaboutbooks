import { useState, useMemo } from 'react';
import { useBooks } from '@/hooks/useBooks';
import { BookCard } from '@/components/books/BookCard';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, BookOpen, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn, getGenreClass } from '@/lib/utils';

const BOOKS_PER_PAGE = 24;

export default function BooksPage() {
  const { books, authors, isLoading, getAuthor, allGenres, searchBooks } = useBooks();
  const [searchParams] = useSearchParams();

  const [query, setQuery] = useState('');
  const [lang, setLang] = useState(searchParams.get('lang') || 'all');
  const [genre, setGenre] = useState('All');
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'year'>('recent');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const results = searchBooks(query, lang, genre);
    if (sortBy === 'title') return [...results].sort((a, b) => a.title.localeCompare(b.title));
    if (sortBy === 'year') return [...results].sort((a, b) => b.published_year - a.published_year);
    return results;
  }, [query, lang, genre, sortBy, books]);

  const totalPages = Math.ceil(filtered.length / BOOKS_PER_PAGE);
  const paginatedBooks = filtered.slice((page - 1) * BOOKS_PER_PAGE, page * BOOKS_PER_PAGE);

  // Reset page when filters change
  const updateFilter = (setter: Function, value: any) => {
    setter(value);
    setPage(1);
  };

  const hasActiveFilters = query || lang !== 'all' || genre !== 'All';

  const clearFilters = () => {
    setQuery('');
    setLang('all');
    setGenre('All');
    setSortBy('recent');
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center animate-float">
          <BookOpen className="w-5 h-5 text-orange-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container-page py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="section-title">Browse Books</h1>
          <p className="section-subtitle">Explore our collection of {books.length} curated books</p>
        </div>

        {/* Search + Filters Bar */}
        <div className="bg-gray-50 rounded-2xl p-5 mb-8">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={e => updateFilter(setQuery, e.target.value)}
              placeholder="Search by title, author, or keyword..."
              className="w-full pl-12 pr-4 py-3.5 bg-white rounded-xl border border-gray-200 text-sm
                       focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
            />
            {query && (
              <button onClick={() => updateFilter(setQuery, '')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          {/* Filter row */}
          <div className="flex items-center gap-3 mt-4 flex-wrap">
            <SlidersHorizontal className="w-4 h-4 text-gray-400 flex-shrink-0" />

            {/* Language pills */}
            <div className="flex items-center gap-1.5">
              {[
                { value: 'all', label: 'All Languages' },
                { value: 'english', label: 'English' },
                { value: 'hindi', label: 'हिंदी Hindi' },
              ].map(l => (
                <button
                  key={l.value}
                  onClick={() => updateFilter(setLang, l.value)}
                  className={cn(
                    'px-3.5 py-2 rounded-lg text-xs font-bold transition-all',
                    lang === l.value
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
                  )}
                >
                  {l.label}
                </button>
              ))}
            </div>

            <div className="w-px h-6 bg-gray-200 hidden sm:block" />

            {/* Genre */}
            <select
              value={genre}
              onChange={e => updateFilter(setGenre, e.target.value)}
              className="px-3 py-2 rounded-lg text-xs font-bold bg-white border border-gray-200 text-gray-600 
                       focus:ring-2 focus:ring-orange-100 outline-none cursor-pointer"
            >
              <option value="All">All Genres</option>
              {allGenres.map(g => <option key={g} value={g}>{g}</option>)}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-lg text-xs font-bold bg-white border border-gray-200 text-gray-600 
                       focus:ring-2 focus:ring-orange-100 outline-none cursor-pointer"
            >
              <option value="recent">Recently Added</option>
              <option value="title">Title A → Z</option>
              <option value="year">Newest First</option>
            </select>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 rounded-lg text-xs font-bold text-orange-600 hover:bg-orange-50 transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear filters
              </button>
            )}

            {/* Result count */}
            <span className="text-xs text-gray-400 ml-auto">{filtered.length} results</span>
          </div>

          {/* Active filter pills */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {query && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                  Search: "{query}"
                  <button onClick={() => updateFilter(setQuery, '')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {lang !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                  {lang === 'english' ? 'English' : 'Hindi'}
                  <button onClick={() => updateFilter(setLang, 'all')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {genre !== 'All' && (
                <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold', getGenreClass(genre))}>
                  {genre}
                  <button onClick={() => updateFilter(setGenre, 'All')}><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Genre quick links */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {['All', ...allGenres.slice(0, 12)].map(g => (
            <button
              key={g}
              onClick={() => updateFilter(setGenre, g)}
              className={cn(
                'px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all',
                genre === g
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              )}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Book Grid */}
        {paginatedBooks.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {paginatedBooks.map((book, i) => (
                <BookCard key={book.id} book={book} author={getAuthor(book.author_id)} index={i} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .map((p, idx, arr) => {
                    const prev = arr[idx - 1];
                    const showDots = prev && p - prev > 1;
                    return (
                      <span key={p} className="flex items-center gap-1">
                        {showDots && <span className="px-2 text-gray-300">...</span>}
                        <button
                          onClick={() => setPage(p)}
                          className={cn(
                            'w-10 h-10 rounded-lg text-sm font-bold transition-all',
                            page === p
                              ? 'bg-orange-500 text-white'
                              : 'border border-gray-200 text-gray-500 hover:bg-gray-50'
                          )}
                        >
                          {p}
                        </button>
                      </span>
                    );
                  })}

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-semibold text-lg">No books match your search</p>
            <p className="text-gray-400 text-sm mt-1">Try different keywords or filters</p>
            <button onClick={clearFilters} className="btn-primary mt-6 text-sm">
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
