import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';

// Deletes one book by its id.
export async function DELETE(request: NextRequest) {
  const { id } = await request.json();

  if (!id) {
    return NextResponse.json({ error: 'Missing book id' }, { status: 400 });
  }

  const sb = getSupabaseServer();
  const { error } = await sb.from('books').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const allowed = [
      'title', 'title_hindi', 'author_id', 'language', 'description',
      'cover_url', 'published_year', 'genre', 'pages', 'isbn',
      'trending', 'short_summary', 'long_summary', 'amazon_link', 'slug',
    ];
    const clean: Record<string, unknown> = {};
    for (const key of allowed) {
      if (body[key] !== undefined && body[key] !== null) clean[key] = body[key];
    }

    if (!clean.title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const sb = getSupabaseServer();
    const { data, error } = await sb.from('books').insert([clean]).select().single();

    if (error) {
      // Send the database's real complaint back to the screen.
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, book: data });
  } catch (err: any) {
    // Catch any unexpected crash and report it instead of dying silently.
    return NextResponse.json(
      { error: err?.message || 'Server crashed during save' },
      { status: 500 }
    );
  }
}
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...rest } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing book id' }, { status: 400 });
    }

    const allowed = [
      'title', 'title_hindi', 'author_id', 'language', 'description',
      'cover_url', 'published_year', 'genre', 'pages', 'isbn',
      'trending', 'short_summary', 'long_summary', 'amazon_link', 'slug',
    ];
    const clean: Record<string, unknown> = {};
    for (const key of allowed) {
      if (rest[key] !== undefined) clean[key] = rest[key];
    }

    const sb = getSupabaseServer();
    const { data, error } = await sb.from('books').update(clean).eq('id', id).select().single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, book: data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server crashed' }, { status: 500 });
  }
}