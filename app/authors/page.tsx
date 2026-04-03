import { getAllAuthors, getAllBooks } from '@/lib/data';
import { AuthorsClient } from './AuthorsClient';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Authors',
  description: 'Explore authors from India and around the world. Discover their books with AI summaries.',
};

export default async function AuthorsPage() {
  const [authors, books] = await Promise.all([getAllAuthors(), getAllBooks()]);
  return <AuthorsClient authors={authors} books={books} />;
}
