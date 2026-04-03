'use client';

import Link from 'next/link';
import Image from 'next/image';
import { cn, getGenreClass } from '@/lib/utils';
import { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import type { Book, Author } from '@/lib/data';

interface BookCardProps {
  book: Book;
  author?: Author;
  index?: number;
}

export function BookCard({ book, author, index = 0 }: BookCardProps) {
  const [imgError, setImgError] = useState(false);
  const bookUrl = `/books/${book.slug || book.id}`;

  return (
    <Link href={bookUrl} className="group flex flex-col animate-slide-up" style={{ animationDelay: `${index * 0.04}s` }}>
      <div className="relative aspect-[2/3] book-cover bg-gray-100">
        {imgError || !book.cover_url ? (
          <div className="w-full h-full rounded-xl flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-gray-700 to-gray-900 text-white">
            <span className="font-display font-bold text-sm leading-tight line-clamp-4">{book.title}</span>
            {author && <span className="text-xs opacity-70 mt-2 line-clamp-1">{author.name}</span>}
          </div>
        ) : (
          <Image
            src={book.cover_url}
            alt={`${book.title} book cover`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
            className="object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        )}

        <div className={cn(
          'absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold backdrop-blur-sm',
          book.language === 'hindi' ? 'bg-orange-500/90 text-white' : 'bg-blue-500/90 text-white'
        )}>
          {book.language === 'hindi' ? 'हिंदी' : 'EN'}
        </div>

        {book.trending && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400/90 text-amber-900 text-[10px] font-bold backdrop-blur-sm">
            <TrendingUp className="w-3 h-3" /> HOT
          </div>
        )}
      </div>

      <div className="flex-1 pt-3 pb-1">
        <h3 className="font-display font-semibold text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-orange-600 transition-colors">
          {book.title_hindi || book.title}
        </h3>
        {author && <p className="text-xs text-gray-400 mt-1 line-clamp-1">{author.name_hindi || author.name}</p>}
        <div className="flex items-center gap-2 mt-2">
          {book.genre?.slice(0, 1).map(g => (
            <span key={g} className={cn('genre-pill', getGenreClass(g))}>{g}</span>
          ))}
          <span className="text-[10px] text-gray-400">{book.published_year}</span>
        </div>
      </div>
    </Link>
  );
}
