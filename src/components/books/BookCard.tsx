import { Link } from 'react-router-dom';
import { Book, Author } from '@/types';
import { cn, getGenreClass } from '@/lib/utils';
import { useState } from 'react';
import { TrendingUp } from 'lucide-react';

interface BookCardProps {
  book: Book;
  author?: Author;
  index?: number;
}

export function BookCard({ book, author, index = 0 }: BookCardProps) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const coverSrc = imgError || !book.cover_url
    ? `https://placehold.co/400x600/F97316/white?text=${encodeURIComponent(book.title.slice(0, 20))}`
    : book.cover_url;

  return (
    <Link
      to={`/books/${book.id}`}
      className="group flex flex-col animate-slide-up"
      style={{ animationDelay: `${index * 0.04}s` }}
    >
      {/* Cover */}
      <div className="relative aspect-[2/3] book-cover bg-gray-100">
        {!imgLoaded && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-xl" />
        )}
        <img
          src={coverSrc}
          alt={book.title}
          className={cn(
            'w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 rounded-xl',
            imgLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onError={() => setImgError(true)}
          onLoad={() => setImgLoaded(true)}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        
        {/* Language badge */}
        <div className={cn(
          'absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold backdrop-blur-sm',
          book.language === 'hindi'
            ? 'bg-orange-500/90 text-white'
            : 'bg-blue-500/90 text-white'
        )}>
          {book.language === 'hindi' ? 'हिंदी' : 'EN'}
        </div>

        {/* Trending badge */}
        {book.trending && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400/90 text-amber-900 text-[10px] font-bold backdrop-blur-sm">
            <TrendingUp className="w-3 h-3" />
            HOT
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 pt-3 pb-1">
        <h3 className="font-display font-semibold text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-orange-600 transition-colors">
          {book.title_hindi || book.title}
        </h3>
        {author && (
          <p className="text-xs text-gray-400 mt-1 line-clamp-1">
            {author.name_hindi || author.name}
          </p>
        )}
        <div className="flex items-center gap-2 mt-2">
          {book.genre?.slice(0, 1).map(g => (
            <span key={g} className={cn('genre-pill', getGenreClass(g))}>
              {g}
            </span>
          ))}
          <span className="text-[10px] text-gray-400">{book.published_year}</span>
        </div>
      </div>
    </Link>
  );
}
