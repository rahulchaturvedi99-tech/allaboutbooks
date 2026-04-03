import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getGenreClass(genre: string): string {
  const map: Record<string, string> = {
    'Fiction': 'bg-violet-100 text-violet-700',
    'Non-Fiction': 'bg-emerald-100 text-emerald-700',
    'Thriller': 'bg-red-100 text-red-700',
    'Romance': 'bg-pink-100 text-pink-700',
    'Science Fiction': 'bg-cyan-100 text-cyan-700',
    'Self-Help': 'bg-orange-100 text-orange-700',
    'Classic': 'bg-stone-200 text-stone-700',
    'Hindi Literature': 'bg-amber-100 text-amber-700',
    'Philosophy': 'bg-indigo-100 text-indigo-700',
    'History': 'bg-yellow-100 text-yellow-800',
    'Biography': 'bg-teal-100 text-teal-700',
    'Fantasy': 'bg-violet-100 text-violet-700',
    'Mystery': 'bg-red-100 text-red-700',
    'Young Adult': 'bg-pink-100 text-pink-700',
    'Business': 'bg-orange-100 text-orange-700',
    'Psychology': 'bg-emerald-100 text-emerald-700',
    'Poetry': 'bg-rose-100 text-rose-700',
  };
  return map[genre] || 'bg-gray-100 text-gray-700';
}

export function generateAmazonLink(isbn: string, title: string): string {
  const tag = 'allaboutbo07b-21';
  const query = encodeURIComponent(`${title} ISBN ${isbn}`);
  return `https://www.amazon.in/s?k=${query}&tag=${tag}`;
}
