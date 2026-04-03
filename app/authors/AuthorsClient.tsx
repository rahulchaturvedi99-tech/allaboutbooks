'use client';

import { useState, useMemo } from 'react';
import { BookCard } from '@/components/books/BookCard';
import { BookOpen, User, Search, X, ChevronDown, ChevronUp, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Book, Author } from '@/lib/data';

const COLORS = ['from-orange-400 to-orange-600', 'from-blue-400 to-blue-600', 'from-emerald-400 to-emerald-600', 'from-violet-400 to-violet-600', 'from-rose-400 to-rose-600', 'from-amber-400 to-amber-600', 'from-cyan-400 to-cyan-600', 'from-indigo-400 to-indigo-600'];

function getColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}

export function AuthorsClient({ authors, books }: { authors: Author[]; books: Book[] }) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'books' | 'name'>('books');

  const getBooksByAuthor = (id: string) => books.filter(b => b.author_id === id);

  const filtered = useMemo(() => {
    let result = authors.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.nationality?.toLowerCase().includes(search.toLowerCase()));
    if (sortBy === 'books') result = [...result].sort((a, b) => getBooksByAuthor(b.id).length - getBooksByAuthor(a.id).length);
    else result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [authors, search, sortBy]);

  return (
    <div className="min-h-screen bg-white">
      <div className="container-page py-8">
        <div className="mb-8">
          <h1 className="section-title">Authors</h1>
          <p className="section-subtitle">{authors.length} authors in our collection</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or nationality..."
              className="w-full pl-11 pr-10 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all" />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-lg"><X className="w-4 h-4 text-gray-400" /></button>}
          </div>
          <div className="flex gap-2">
            {(['books', 'name'] as const).map(s => (
              <button key={s} onClick={() => setSortBy(s)} className={cn('px-4 py-3 rounded-xl text-xs font-bold transition-all', sortBy === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500')}>
                {s === 'books' ? 'Most Books' : 'A → Z'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filtered.map((author, i) => {
            const authorBooks = getBooksByAuthor(author.id);
            const isOpen = expanded === author.id;
            const initials = author.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

            return (
              <div key={author.id} className="animate-slide-up" style={{ animationDelay: `${i * 0.03}s` }}>
                <div className={cn('bg-white rounded-2xl border transition-all duration-300 cursor-pointer', isOpen ? 'border-orange-200 shadow-lg' : 'border-gray-100 hover:border-gray-200 hover:shadow-md')}>
                  <div className="p-5 flex items-center gap-4" onClick={() => setExpanded(isOpen ? null : author.id)}>
                    <div className={cn('w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center flex-shrink-0 text-white font-bold text-lg', getColor(author.name))}>
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-bold text-gray-900 text-base">{author.name}</h3>
                      <div className="flex items-center gap-3 mt-1.5">
                        {author.nationality && <span className="flex items-center gap-1 text-xs text-gray-400"><Globe className="w-3 h-3" />{author.nationality}</span>}
                        <span className="text-xs font-bold text-orange-500">{authorBooks.length} {authorBooks.length === 1 ? 'book' : 'books'}</span>
                      </div>
                    </div>
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', isOpen ? 'bg-orange-100' : 'bg-gray-50')}>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-orange-600" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>

                  {isOpen && authorBooks.length > 0 && (
                    <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Books</h4>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {authorBooks.map((book, j) => <BookCard key={book.id} book={book} index={j} />)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <User className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-semibold">No authors found</p>
            <button onClick={() => setSearch('')} className="btn-primary mt-6 text-sm">Clear search</button>
          </div>
        )}
      </div>
    </div>
  );
}
