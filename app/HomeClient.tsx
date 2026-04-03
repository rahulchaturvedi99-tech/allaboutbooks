'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { BookCard } from '@/components/books/BookCard';
import { BookOpen, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Book, Author } from '@/lib/data';

export function HomeClient({ books, authors }: { books: Book[]; authors: Author[] }) {
  const [lang, setLang] = useState('all');
  const [genre, setGenre] = useState('All');

  const getAuthor = (id: string) => authors.find(a => a.id === id);

  const allGenres = useMemo(() => {
    const g = new Set<string>();
    books.forEach(b => b.genre?.forEach(x => g.add(x)));
    return Array.from(g).sort();
  }, [books]);

  const filtered = useMemo(() => {
    return books.filter(b => {
      const matchLang = lang === 'all' || b.language === lang;
      const matchGenre = genre === 'All' || b.genre?.includes(genre);
      return matchLang && matchGenre;
    });
  }, [books, lang, genre]);

  return (
    <section className="container-page py-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-900">All Books</h2>
          <p className="text-sm text-gray-400 mt-0.5">{filtered.length} books</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {['all', 'english', 'hindi'].map(l => (
            <button key={l} onClick={() => setLang(l)} className={cn(
              'px-4 py-2 rounded-lg text-xs font-bold transition-all',
              lang === l ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            )}>
              {l === 'all' ? 'All' : l === 'english' ? 'English' : 'हिंदी'}
            </button>
          ))}
          <select value={genre} onChange={e => setGenre(e.target.value)}
            className="px-3 py-2 rounded-lg text-xs font-bold bg-gray-100 border-none text-gray-600 outline-none cursor-pointer">
            <option value="All">All Genres</option>
            {allGenres.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {filtered.slice(0, 12).map((book, i) => (
          <BookCard key={book.id} book={book} author={getAuthor(book.author_id)} index={i} />
        ))}
      </div>

      {filtered.length > 12 && (
        <div className="text-center mt-12">
          <Link href="/books" className="btn-outline">View all {filtered.length} books <ArrowRight className="w-4 h-4" /></Link>
        </div>
      )}
    </section>
  );
}
