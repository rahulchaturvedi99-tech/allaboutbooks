'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Turns "The Alchemist: A Fable" into "the-alchemist-a-fable" for the URL.
function makeSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

interface GoogleResult {
  id: string;
  volumeInfo: {
    title?: string;
    authors?: string[];
    description?: string;
    publishedDate?: string;
    pageCount?: number;
    categories?: string[];
    imageLinks?: { thumbnail?: string; smallThumbnail?: string };
    industryIdentifiers?: { type: string; identifier: string }[];
  };
}

export default function AddBookPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GoogleResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // The form fields. Start empty; auto-fill on result click.
  const [form, setForm] = useState({
    title: '',
    author: '',
    language: 'english',
    description: '',
    cover_url: '',
    published_year: '',
    isbn: '',
    pages: '',
    genre: '',
    slug: '',
    trending: false,
  });

  function update(field: string, value: string | boolean) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // Auto-rebuild the slug whenever the title changes.
      if (field === 'title') next.slug = makeSlug(value as string);
      return next;
    });
  }

  async function searchGoogle() {
    if (!query.trim()) return;
    setSearching(true);
    setResults([]);
    setMsg('');
    try {
      const res = await fetch(
        `/api/admin/google-books?q=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setResults(data.items || []);
      if (data.items?.length) {
        setMsg(
          data.source === 'openlibrary'
            ? 'Showing results from Open Library (Google was busy).'
            : ''
        );
      } else {
        setMsg('No results found. Try a different title.');
      }
    } catch {
      setMsg('Search failed. Check your internet and try again.');
    }
    setSearching(false);
  }

  function pickResult(r: GoogleResult) {
    const v = r.volumeInfo;
    const isbn =
      v.industryIdentifiers?.find((i) => i.type === 'ISBN_13' || i.type === 'ISBN_10')
        ?.identifier || '';
    // Google's thumbnail; we upgrade quality and drop the page-curl effect.
    const cover = (v.imageLinks?.thumbnail || v.imageLinks?.smallThumbnail || '')
      .replace('&edge=curl', '')
      .replace('http://', 'https://');
    const year = v.publishedDate ? parseInt(v.publishedDate.slice(0, 4)) : '';
    const title = v.title || '';

    setForm({
      title,
      author: v.authors?.join(', ') || '',
      language: 'english',
      description: v.description || '',
      cover_url: cover,
      published_year: year ? String(year) : '',
      isbn,
      pages: v.pageCount ? String(v.pageCount) : '',
      genre: v.categories?.join(', ') || '',
      slug: makeSlug(title),
      trending: false,
    });
    setResults([]); // collapse the results once one is chosen
    setMsg('Details filled in below. Review, then Save.');
  }

  async function save() {
    if (!form.title.trim()) {
      setMsg('Title is required.');
      return;
    }
    setSaving(true);
    setMsg('');

    const payload = {
      title: form.title,
      language: form.language,
      // Author name kept inside description for now.
      description: form.author
        ? `By ${form.author}\n\n${form.description}`
        : form.description,
      cover_url: form.cover_url,
      published_year: form.published_year ? Number(form.published_year) : null,
      isbn: form.isbn || null,
      pages: form.pages ? Number(form.pages) : null,
      genre: form.genre
        ? form.genre.split(',').map((g) => g.trim()).filter(Boolean)
        : [],
      slug: form.slug,
      trending: form.trending,
    };

    const res = await fetch('/api/admin/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    // Read the body as text first, then try to make sense of it.
    // This way an empty/broken response can never crash the page.
    const raw = await res.text();
    let data: any = {};
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      data = { error: raw || 'Empty response from server' };
    }

    if (res.ok) {
      router.push('/admin'); // back to the dashboard
    } else {
      setMsg(`Save failed: ${data.error || `error ${res.status}`}`);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Add a Book</h1>
          <button
            onClick={() => router.push('/admin')}
            className="text-sm border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-100"
          >
            ← Back
          </button>
        </div>

        {/* Search Google Books */}
        <div className="bg-white rounded-xl shadow p-4 mb-4">
          <label className="text-sm font-medium text-gray-700">Search for a book</label>
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              placeholder="e.g. Atomic Habits"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchGoogle()}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={searchGoogle}
              disabled={searching}
              className="bg-blue-600 text-white rounded-lg px-5 py-2 font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Results grid */}
          {results.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
              {results.map((r) => (
                <button
                  key={r.id}
                  onClick={() => pickResult(r)}
                  className="text-left border border-gray-200 rounded-lg p-2 hover:border-blue-500 hover:bg-blue-50"
                >
                  <img
                    src={
                      (r.volumeInfo.imageLinks?.thumbnail || '').replace('http://', 'https://') ||
                      'https://via.placeholder.com/80x120?text=No+Cover'
                    }
                    alt=""
                    className="w-full h-32 object-contain mb-2"
                  />
                  <p className="text-xs font-medium text-gray-800 line-clamp-2">
                    {r.volumeInfo.title}
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-1">
                    {r.volumeInfo.authors?.join(', ')}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* The editable form */}
        <div className="bg-white rounded-xl shadow p-4 space-y-4">
          {msg && <p className="text-sm text-blue-700 bg-blue-50 rounded-lg px-3 py-2">{msg}</p>}

          <Field label="Title *">
            <input className={inputCls} value={form.title} onChange={(e) => update('title', e.target.value)} />
          </Field>

          <Field label="Author">
            <input className={inputCls} value={form.author} onChange={(e) => update('author', e.target.value)} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Language">
              <select className={inputCls} value={form.language} onChange={(e) => update('language', e.target.value)}>
                <option value="english">English</option>
                <option value="hindi">Hindi</option>
              </select>
            </Field>
            <Field label="Published Year">
              <input className={inputCls} value={form.published_year} onChange={(e) => update('published_year', e.target.value)} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="ISBN">
              <input className={inputCls} value={form.isbn} onChange={(e) => update('isbn', e.target.value)} />
            </Field>
            <Field label="Pages">
              <input className={inputCls} value={form.pages} onChange={(e) => update('pages', e.target.value)} />
            </Field>
          </div>

          <Field label="Genre (comma separated)">
            <input className={inputCls} value={form.genre} onChange={(e) => update('genre', e.target.value)} />
          </Field>

          <Field label="Cover Image URL">
            <input className={inputCls} value={form.cover_url} onChange={(e) => update('cover_url', e.target.value)} />
          </Field>
          {form.cover_url && (
            <img src={form.cover_url} alt="cover preview" className="w-24 h-32 object-cover rounded border" />
          )}

          <Field label="URL slug">
            <input className={inputCls} value={form.slug} onChange={(e) => update('slug', e.target.value)} />
          </Field>

          <Field label="Description">
            <textarea
              className={inputCls + ' h-32'}
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
            />
          </Field>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.trending}
              onChange={(e) => update('trending', e.target.checked)}
            />
            Mark as trending
          </label>

          <button
            onClick={save}
            disabled={saving}
            className="w-full bg-green-600 text-white rounded-lg py-3 font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Book'}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  'w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 block mb-1">{label}</label>
      {children}
    </div>
  );
}