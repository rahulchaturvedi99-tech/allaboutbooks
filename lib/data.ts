import { getSupabaseServer } from './supabase';

export interface Book {
  id: string;
  title: string;
  title_hindi?: string;
  author_id: string;
  language: 'english' | 'hindi';
  description: string;
  cover_url: string;
  published_year: number;
  genre: string[];
  pages: number;
  isbn: string;
  trending: boolean;
  short_summary?: string;
  long_summary?: string;
  amazon_link?: string;
  slug?: string;
  created_at?: string;
}

export interface Author {
  id: string;
  name: string;
  name_hindi?: string;
  bio: string;
  image_url: string;
  nationality: string;
}

export async function getAllBooks(): Promise<Book[]> {
  const sb = getSupabaseServer();
  const { data, error } = await sb.from('books').select('*').order('created_at', { ascending: false });
  if (error) { console.error('Error fetching books:', error); return []; }
  return data || [];
}

export async function getBookBySlug(slug: string): Promise<Book | null> {
  const sb = getSupabaseServer();
  // Try slug first, then ID
  let { data } = await sb.from('books').select('*').eq('slug', slug).single();
  if (!data) {
    const res = await sb.from('books').select('*').eq('id', slug).single();
    data = res.data;
  }
  return data || null;
}

export async function getAllAuthors(): Promise<Author[]> {
  const sb = getSupabaseServer();
  const { data, error } = await sb.from('authors').select('*').order('name');
  if (error) { console.error('Error fetching authors:', error); return []; }
  return data || [];
}

export async function getAuthorById(id: string): Promise<Author | null> {
  const sb = getSupabaseServer();
  const { data } = await sb.from('authors').select('*').eq('id', id).single();
  return data || null;
}

export async function getBooksByAuthor(authorId: string): Promise<Book[]> {
  const sb = getSupabaseServer();
  const { data } = await sb.from('books').select('*').eq('author_id', authorId);
  return data || [];
}

export async function getTrendingBooks(): Promise<Book[]> {
  const sb = getSupabaseServer();
  const { data } = await sb.from('books').select('*').eq('trending', true).limit(6);
  return data || [];
}

export async function getAllGenres(): Promise<string[]> {
  const books = await getAllBooks();
  const genres = new Set<string>();
  books.forEach(b => b.genre?.forEach(g => genres.add(g)));
  return Array.from(genres).sort();
}
