import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getGenreClass(genre: string): string {
  const map: Record<string, string> = {
    'Fiction': 'genre-fiction',
    'Non-Fiction': 'genre-nonfiction',
    'Thriller': 'genre-thriller',
    'Romance': 'genre-romance',
    'Science Fiction': 'genre-scifi',
    'Self-Help': 'genre-selfhelp',
    'Classic': 'genre-classic',
    'Hindi Literature': 'genre-hindi',
    'Philosophy': 'genre-philosophy',
    'History': 'genre-history',
    'Biography': 'genre-biography',
    'Fantasy': 'genre-fiction',
    'Mystery': 'genre-thriller',
    'Young Adult': 'genre-romance',
    'Business': 'genre-selfhelp',
    'Psychology': 'genre-nonfiction',
  };
  return map[genre] || 'genre-fiction';
}

export function generateAmazonLink(isbn: string, title: string): string {
  const tag = 'allaboutbooks-21';
  const query = encodeURIComponent(`${title} ISBN ${isbn}`);
  return `https://www.amazon.in/s?k=${query}&tag=${tag}`;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length).trim() + '...';
}
