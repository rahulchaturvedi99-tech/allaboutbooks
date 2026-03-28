import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Book, Author } from '@/types';

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const [booksRes, authorsRes] = await Promise.all([
          supabase.from('books').select('*').order('created_at', { ascending: false }),
          supabase.from('authors').select('*').order('name'),
        ]);

        if (booksRes.error) throw booksRes.error;
        if (authorsRes.error) throw authorsRes.error;

        setBooks(booksRes.data || []);
        setAuthors(authorsRes.data || []);
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const getAuthor = (authorId: string) => authors.find(a => a.id === authorId);
  const getBook = (bookId: string) => books.find(b => b.id === bookId);
  const getBookBySlug = (slug: string) => books.find(b => b.slug === slug || b.id === slug);
  const getBooksByAuthor = (authorId: string) => books.filter(b => b.author_id === authorId);

  const trendingBooks = useMemo(() => books.filter(b => b.trending), [books]);
  const englishBooks = useMemo(() => books.filter(b => b.language === 'english'), [books]);
  const hindiBooks = useMemo(() => books.filter(b => b.language === 'hindi'), [books]);

  const allGenres = useMemo(() => {
    const genres = new Set<string>();
    books.forEach(b => b.genre?.forEach(g => genres.add(g)));
    return Array.from(genres).sort();
  }, [books]);

  const searchBooks = (query: string, language?: string, genre?: string) => {
    const q = query.toLowerCase();
    return books.filter(b => {
      const matchQuery = !query ||
        b.title.toLowerCase().includes(q) ||
        b.title_hindi?.includes(query) ||
        b.description.toLowerCase().includes(q) ||
        getAuthor(b.author_id)?.name.toLowerCase().includes(q);
      const matchLang = !language || language === 'all' || b.language === language;
      const matchGenre = !genre || genre === 'All' || b.genre?.includes(genre);
      return matchQuery && matchLang && matchGenre;
    });
  };

  return {
    books, authors, isLoading, error,
    getAuthor, getBook, getBookBySlug, getBooksByAuthor,
    trendingBooks, englishBooks, hindiBooks,
    allGenres, searchBooks,
  };
}
