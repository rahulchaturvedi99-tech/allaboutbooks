'use client';

import { useState, useMemo } from 'react';
import { BookCard } from '@/components/books/BookCard';
import { Search, BookOpen, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Book, Author } from '@/lib/data';

const PER_PAGE = 24;

export function BooksClient({ books, authors }: { books: Book[]; authors: Author[] }) {
  const [query, setQuery] = useState('');
  const [lang, setLang] = useState('all');
  const [genre, setGenre] = useState('All');
  const [sortBy, setSortBy] = useState('recent');
  const [page, setPage] = useState(1);

  const getAuthor = (id: string) => authors.find(a => a.id === id);

  const allGenres = useMemo(() => {
    const g = new Set<string>();
    books.forEach(b => b.genre?.forEach(x => g.add(x)));
    return Array.from(g).sort();
  }, [books]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    let results = books.filter(b => {
      const matchQ = !query || b.title.toLowerCase().includes(q) || b.description?.toLowerCase().includes(q) || getAuthor(b.author_id)?.name.toLowerCase().includes(q);
      const matchL = lang === 'all' || b.language === lang;
      const matchG = genre === 'All' || b.genre?.includes(genre);
      return matchQ && matchL && matchG;
    });
    if (sortBy === 'title') results = [...results].sort((a, b) => a.title.localeCompare(b.title));
    if (sortBy === 'year') results = [...results].sort((a, b) => b.published_year - a.published_year);
    return results;
  }, [query, lang, genre, sortBy, books]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const hasFilters = query || lang !== 'all' || genre !== 'All';

  const updateFilter = (fn: Function, val: any) => { fn(val); setPage(1); };
  const clearAll = () => { setQuery(''); setLang('all'); setGenre('All'); setSortBy('recent'); setPage(1); };

  return (
    <div className="min-h-screen bg-white">
      <div className="container-page py-8">
        <div className="mb-8">
          <h1 className="section-title">Browse Books</h1>
          <p className="section-subtitle">Explore our collection of {books.length} curated books</p>
        </div>

        <div className="bg-gray-50 rounded-2xl p-5 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" value={query} onChange={e => updateFilter(setQuery, e.target.value)}
              placeholder="Search by title, author, or keyword..."
              className="w-full pl-12 pr-10 py-3.5 bg-white rounded-xl border border-gray-200 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all" />
            {query && <button onClick={() => updateFilter(setQuery, '')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-400" /></button>}
          </div>

          <div className="flex items-center gap-3 mt-4 flex-wrap">
            <SlidersHorizontal className="w-4 h-4 text-gray-400" />
            {[{ v: 'all', l: 'All Languages' }, { v: 'english', l: 'English' }, { v: 'hindi', l: 'हिंदी Hindi' }].map(x => (
              <button key={x.v} onClick={() => updateFilter(setLang, x.v)}
                className={cn('px-3.5 py-2 rounded-lg text-xs font-bold transition-all', lang === x.v ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200')}>
                {x.l}
              </button>
            ))}
            <div className="w-px h-6 bg-gray-200 hidden sm:block" />
            <select value={genre} onChange={e => updateFilter(setGenre, e.target.value)}
              className="px-3 py-2 rounded-lg text-xs font-bold bg-white border border-gray-200 text-gray-600 outline-none cursor-pointer">
              <option value="All">All Genres</option>
              {allGenres.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-lg text-xs font-bold bg-white border border-gray-200 text-gray-600 outline-none cursor-pointer">
              <option value="recent">Recently Added</option>
              <option value="title">Title A → Z</option>
              <option value="year">Newest First</option>
            </select>
            {hasFilters && <button onClick={clearAll} className="px-3 py-2 rounded-lg text-xs font-bold text-orange-600 hover:bg-orange-50 flex items-center gap-1"><X className="w-3 h-3" /> Clear</button>}
            <span className="text-xs text-gray-400 ml-auto">{filtered.length} results</span>
          </div>
        </div>

        {paginated.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {paginated.map((book, i) => <BookCard key={book.id} book={book} author={getAuthor(book.author_id)} index={i} />)}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-all">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1).map((p, idx, arr) => {
                  const prev = arr[idx - 1];
                  return (
                    <span key={p} className="flex items-center gap-1">
                      {prev && p - prev > 1 && <span className="px-2 text-gray-300">...</span>}
                      <button onClick={() => setPage(p)}
                        className={cn('w-10 h-10 rounded-lg text-sm font-bold transition-all', page === p ? 'bg-orange-500 text-white' : 'border border-gray-200 text-gray-500 hover:bg-gray-50')}>
                        {p}
                      </button>
                    </span>
                  );
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-all">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-semibold text-lg">No books match your search</p>
            <button onClick={clearAll} className="btn-primary mt-6 text-sm">Clear all filters</button>
          </div>
        )}
      </div>
    </div>
  );
}
