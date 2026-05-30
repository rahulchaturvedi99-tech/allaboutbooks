'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';

export default function EditBookPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [coverBusy, setCoverBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [pasteUrl, setPasteUrl] = useState('');

  const [form, setForm] = useState({
    title: '',
    title_hindi: '',
    language: 'english',
    description: '',
    cover_url: '',
    published_year: '',
    isbn: '',
    pages: '',
    genre: '',
    slug: '',
    short_summary: '',
    long_summary: '',
    verdict: '',
    amazon_link: '',
    trending: false,
  });

  const [genBusy, setGenBusy] = useState(false);

  // Load the book from the database when the page opens.
  useEffect(() => {
    async function load() {
      const sb = getSupabaseClient();
      const { data, error } = await sb.from('books').select('*').eq('id', id).single();
      if (error || !data) {
        setMsg('Could not load this book.');
        setLoading(false);
        return;
      }
      setForm({
        title: data.title || '',
        title_hindi: data.title_hindi || '',
        language: data.language || 'english',
        description: data.description || '',
        cover_url: data.cover_url || '',
        published_year: data.published_year ? String(data.published_year) : '',
        isbn: data.isbn || '',
        pages: data.pages ? String(data.pages) : '',
        genre: Array.isArray(data.genre) ? data.genre.join(', ') : '',
        slug: data.slug || '',
        amazon_link: data.amazon_link || '',
        trending: !!data.trending,
        short_summary: data.short_summary || '',
        long_summary: data.long_summary || '',
        verdict: data.verdict || '',
      });
      setLoading(false);
    }
    load();
  }, [id]);

  function update(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // Whether the current cover is an outside link (not yet in your Storage).
  const isExternal =
    form.cover_url &&
    !form.cover_url.includes('supabase.co/storage');

  // Pull a pasted URL (or the existing external cover) into Storage.
  async function saveUrlToStorage(url: string) {
    if (!url) return;
    setCoverBusy(true);
    setMsg('Saving cover into your Storage...');
    const res = await fetch('/api/admin/cover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, name: form.slug || form.title }),
    });
    const data = await res.json().catch(() => ({}));
    setCoverBusy(false);
    if (res.ok && data.publicUrl) {
      update('cover_url', data.publicUrl);
      setPasteUrl('');
      setMsg('✅ Cover saved to your Storage. Remember to click Save Changes.');
    } else {
      setMsg(`Cover save failed: ${data.error || 'unknown error'}`);
    }
  }

  // Upload a file from the computer into Storage.
  async function uploadFile(file: File) {
    setCoverBusy(true);
    setMsg('Uploading cover...');
    const fd = new FormData();
    fd.append('file', file);
    fd.append('name', form.slug || form.title);
    const res = await fetch('/api/admin/cover', { method: 'POST', body: fd });
    const data = await res.json().catch(() => ({}));
    setCoverBusy(false);
    if (res.ok && data.publicUrl) {
      update('cover_url', data.publicUrl);
      setMsg('✅ Cover uploaded to your Storage. Remember to click Save Changes.');
    } else {
      setMsg(`Upload failed: ${data.error || 'unknown error'}`);
    }
  }

async function generateSummaries() {
    if (!form.title.trim()) {
      setMsg('Need a title before generating.');
      return;
    }
    setGenBusy(true);
    setMsg('🤖 Asking Gemini... this takes 5-15 seconds.');

    const res = await fetch('/api/admin/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        author: form.description.startsWith('By ') ? form.description.split('\n')[0].slice(3) : '',
        language: form.language,
        description: form.description,
      }),
    });

    const data = await res.json().catch(() => ({}));
    setGenBusy(false);

    if (res.ok) {
      setForm((prev) => ({
        ...prev,
        short_summary: data.short_summary || prev.short_summary,
        long_summary: data.long_summary || prev.long_summary,
        verdict: data.verdict || prev.verdict,
      }));
      setMsg(data.warning || '✅ Summaries generated. Review them, then Save Changes.');
    } else {
      setMsg(`Generation failed: ${data.error || 'unknown error'}`);
    }
  }

  async function save() {
    if (!form.title.trim()) {
      setMsg('Title is required.');
      return;
    }
    setSaving(true);
    setMsg('');

    const payload = {
      id,
      title: form.title,
      title_hindi: form.title_hindi || null,
      language: form.language,
      description: form.description,
      cover_url: form.cover_url,
      published_year: form.published_year ? Number(form.published_year) : null,
      isbn: form.isbn || null,
      pages: form.pages ? Number(form.pages) : null,
      genre: form.genre ? form.genre.split(',').map((g) => g.trim()).filter(Boolean) : [],
      slug: form.slug,
      amazon_link: form.amazon_link || null,
      short_summary: form.short_summary || null,
      long_summary: form.long_summary || null,
      verdict: form.verdict || null,
      trending: form.trending,
    };

    const res = await fetch('/api/admin/books', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setSaving(false);

    const raw = await res.text();
    let data: any = {};
    try { data = raw ? JSON.parse(raw) : {}; } catch { data = { error: raw }; }

    if (res.ok) {
      router.push('/admin');
    } else {
      setMsg(`Save failed: ${data.error || `error ${res.status}`}`);
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 p-6"><p className="text-gray-500">Loading...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Edit Book</h1>
          <button
            onClick={() => router.push('/admin')}
            className="text-sm border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-100"
          >
            ← Back
          </button>
        </div>

        <div className="bg-white rounded-xl shadow p-4 space-y-4">
          {msg && <p className="text-sm text-blue-700 bg-blue-50 rounded-lg px-3 py-2">{msg}</p>}

          {/* COVER SECTION */}
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-800 mb-3">Cover Image</p>
            <div className="flex gap-4">
              {form.cover_url ? (
                <img src={form.cover_url} alt="cover" className="w-24 h-32 object-cover rounded border flex-shrink-0" />
              ) : (
                <div className="w-24 h-32 rounded border bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                  No cover
                </div>
              )}

              <div className="flex-1 space-y-3">
                {/* Warning if cover is still an external link */}
                {isExternal && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-xs text-amber-800">
                    This cover is an external link (can break later).
                    <button
                      onClick={() => saveUrlToStorage(form.cover_url)}
                      disabled={coverBusy}
                      className="ml-2 underline font-medium disabled:opacity-50"
                    >
                      Fix it into my Storage
                    </button>
                  </div>
                )}
                {!isExternal && form.cover_url && (
                  <p className="text-xs text-green-700">✅ Stored safely in your Supabase Storage.</p>
                )}

                {/* Paste a URL */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Paste an image URL"
                    value={pasteUrl}
                    onChange={(e) => setPasteUrl(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                  <button
                    onClick={() => saveUrlToStorage(pasteUrl)}
                    disabled={coverBusy || !pasteUrl}
                    className="bg-blue-600 text-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {coverBusy ? 'Working...' : 'Save URL'}
                  </button>
                </div>

                {/* Upload a file */}
                <div>
                  <label className="text-xs text-gray-500 block mb-1">…or upload from your computer:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* TEXT FIELDS */}
          {/* AI SUMMARIES */}
          <div className="border border-purple-200 bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-purple-900">AI Summaries (Gemini)</p>
              <button
                onClick={generateSummaries}
                disabled={genBusy}
                className="bg-purple-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
              >
                {genBusy ? 'Generating...' : '✨ Generate with AI'}
              </button>
            </div>

            <Field label="Short summary">
              <textarea
                className={inputCls + ' h-20'}
                value={form.short_summary}
                onChange={(e) => update('short_summary', e.target.value)}
              />
            </Field>
            <div className="h-3" />
            <Field label="Long summary">
              <textarea
                className={inputCls + ' h-48'}
                value={form.long_summary}
                onChange={(e) => update('long_summary', e.target.value)}
              />
            </Field>
            <div className="h-3" />
            <Field label="Verdict">
              <textarea
                className={inputCls + ' h-16'}
                value={form.verdict}
                onChange={(e) => update('verdict', e.target.value)}
              />
            </Field>
          </div>
          <Field label="Title *">
            <input className={inputCls} value={form.title} onChange={(e) => update('title', e.target.value)} />
          </Field>
          <Field label="Title (Hindi)">
            <input className={inputCls} value={form.title_hindi} onChange={(e) => update('title_hindi', e.target.value)} />
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
          <Field label="URL slug">
            <input className={inputCls} value={form.slug} onChange={(e) => update('slug', e.target.value)} />
          </Field>
          <Field label="Amazon affiliate link">
            <input className={inputCls} value={form.amazon_link} onChange={(e) => update('amazon_link', e.target.value)} />
          </Field>
          <Field label="Description">
            <textarea className={inputCls + ' h-32'} value={form.description} onChange={(e) => update('description', e.target.value)} />
          </Field>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.trending} onChange={(e) => update('trending', e.target.checked)} />
            Mark as trending
          </label>

          <button
            onClick={save}
            disabled={saving}
            className="w-full bg-green-600 text-white rounded-lg py-3 font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
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