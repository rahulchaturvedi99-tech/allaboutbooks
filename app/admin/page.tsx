'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';

interface BookRow {
  id: string;
  title: string;
  language: string;
  cover_url: string;
  slug?: string;
  trending: boolean;
  short_summary?: string;
  long_summary?: string;
  published_year?: number;
  isbn?: string;
}

// Turns "The Alchemist!" and "the  alchemist" into the same key: "thealchemist".
// This is what lets us catch look-alikes that differ only by caps/spaces/punctuation.
function normalizeTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\u0900-\u097F]/g, ''); // keep letters, numbers, and Hindi characters
}

export default function AdminHome() {
  const router = useRouter();
  const [books, setBooks] = useState<BookRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dupeMode, setDupeMode] = useState(false);

  useEffect(() => {
    loadBooks();
  }, []);

  async function loadBooks() {
    setLoading(true);
    const sb = getSupabaseClient();
    const { data, error } = await sb
      .from('books')
      .select('id, title, language, cover_url, slug, trending, short_summary, long_summary, published_year, isbn')
      .order('title');
    if (!error && data) setBooks(data as BookRow[]);
    setLoading(false);
  }

  async function deleteBook(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;

    const res = await fetch('/api/admin/books', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      setBooks((prev) => prev.filter((b) => b.id !== id));
    } else {
      alert('Delete failed. Try again.');
    }
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  // Build groups of books that share a normalized title, keeping only
  // groups with 2 or more books (those are the potential duplicates).
  function getDuplicateGroups() {
    const map = new Map<string, BookRow[]>();
    for (const book of books) {
      const key = normalizeTitle(book.title);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(book);
    }
    return Array.from(map.values())
      .filter((group) => group.length > 1)
      .sort((a, b) => a[0].title.localeCompare(b[0].title));
  }

  const filtered = books.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase())
  );

  const dupeGroups = getDuplicateGroups();
  const totalDupeBooks = dupeGroups.reduce((sum, g) => sum + g.length, 0);

  // A small reusable row so normal mode and duplicate mode look the same.
  function BookItem({ book }: { book: BookRow }) {
    return (
      <div className="flex items-center gap-4 p-3">
        <img
          src={book.cover_url}
          alt={book.title}
          className="w-12 h-16 object-cover rounded bg-gray-100 flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{book.title}</p>
          <div className="flex flex-wrap gap-2 mt-1">
            <span className="text-xs bg-gray-100 text-gray-600 rounded px-2 py-0.5">
              {book.language}
            </span>
            {book.published_year ? (
              <span className="text-xs bg-gray-100 text-gray-600 rounded px-2 py-0.5">
                {book.published_year}
              </span>
            ) : null}
            {book.isbn ? (
              <span className="text-xs bg-gray-100 text-gray-500 rounded px-2 py-0.5">
                ISBN {book.isbn}
              </span>
            ) : null}
            {book.trending && (
              <span className="text-xs bg-orange-100 text-orange-700 rounded px-2 py-0.5">
                trending
              </span>
            )}
            {!book.short_summary && !book.long_summary && (
              <span className="text-xs bg-yellow-100 text-yellow-700 rounded px-2 py-0.5">
                no summary
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => router.push(`/admin/edit/${book.id}`)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-100"
        >
          Edit
        </button>
        <button
          onClick={() => deleteBook(book.id, book.title)}
          className="text-sm border border-red-300 text-red-600 rounded-lg px-3 py-1.5 hover:bg-red-50"
        >
          Delete
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">{books.length} books in your database</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/admin/add')}
              className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700"
            >
              + Add Book
            </button>
            <button
              onClick={logout}
              className="text-sm border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-100"
            >
              Log out
            </button>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setDupeMode(false)}
            className={`text-sm rounded-lg px-4 py-2 font-medium border ${
              !dupeMode
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Books
          </button>
          <button
            onClick={() => setDupeMode(true)}
            className={`text-sm rounded-lg px-4 py-2 font-medium border ${
              dupeMode
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            Find Duplicates {dupeGroups.length > 0 && `(${dupeGroups.length})`}
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading books...</p>
        ) : dupeMode ? (
          /* ---------- DUPLICATE MODE ---------- */
          <div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-sm text-amber-800">
              Found <strong>{dupeGroups.length}</strong> title{dupeGroups.length === 1 ? '' : 's'} with possible
              duplicates ({totalDupeBooks} books total). Compare the <strong>language</strong>,{' '}
              <strong>year</strong>, and <strong>ISBN</strong> below. Delete only the true copies —
              keep different editions, translations, or languages.
            </div>

            {dupeGroups.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-6 text-gray-500">
                🎉 No duplicate titles found. Your database is clean.
              </div>
            ) : (
              <div className="space-y-4">
                {dupeGroups.map((group, i) => (
                  <div key={i} className="bg-white rounded-xl shadow overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
                      {group.length} matches for &ldquo;{group[0].title}&rdquo;
                    </div>
                    <div className="divide-y">
                      {group.map((book) => (
                        <BookItem key={book.id} book={book} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ---------- NORMAL MODE ---------- */
          <div>
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="bg-white rounded-xl shadow divide-y">
              {filtered.map((book) => (
                <BookItem key={book.id} book={book} />
              ))}
              {filtered.length === 0 && (
                <p className="text-gray-500 p-4">No books match your search.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}