import { getAllBooks, getAllAuthors } from '@/lib/data';
import { BooksClient } from './BooksClient';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Browse Books',
  description: 'Browse our collection of 200+ books with AI-generated summaries in English and Hindi.',
};

export default async function BooksPage() {
  const [books, authors] = await Promise.all([getAllBooks(), getAllAuthors()]);
  return <BooksClient books={books} authors={authors} />;
}
