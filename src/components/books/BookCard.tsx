import { Link } from 'react-router-dom';
import { Book, Author } from '@/types';
import { cn, getGenreClass } from '@/lib/utils';
import { useState, useCallback } from 'react';
import { TrendingUp } from 'lucide-react';

interface BookCardProps {
  book: Book;
  author?: Author;
  index?: number;
}

const COVER_COLORS = [
  { bg: '#1e3a5f', text: '#ffffff' },
  { bg: '#2d4a22', text: '#ffffff' },
  { bg: '#5c2d82', text: '#ffffff' },
  { bg: '#8b2500', text: '#ffffff' },
  { bg: '#1a4d4d', text: '#ffffff' },
  { bg: '#4a3728', text: '#ffffff' },
  { bg: '#2b3a67', text: '#ffffff' },
  { bg: '#6b2737', text: '#ffffff' },
];

function getColorForTitle(title: string) {
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash);
  return COVER_COLORS[Math.abs(hash) % COVER_COLORS.length];
}

export function BookCard({ book, author, index = 0 }: BookCardProps) {
  const [imgState, setImgState] = useState<'loading' | 'loaded' | 'placeholder'>('loading');

  const handleError = useCallback(() => {
    setImgState('placeholder');
  }, []);

  const bookUrl = `/books/${book.slug || book.id}`;
  const color = getColorForTitle(book.title);

  return (
    <Link
      to={bookUrl}
      className="group flex flex-col animate-slide-up"
      style={{ animationDelay: `${index * 0.04}s` }}
    >
      <div className="relative aspect-[2/3] book-cover bg-gray-100">
        {imgState === 'loading' && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-xl" />
        )}

        {imgState === 'placeholder' ? (
          <div
            className="w-full h-full rounded-xl flex flex-col items-center justify-center p-4 text-center"
            style={{ background: color.bg, color: color.text }}
          >
            <span className="font-display font-bold text-sm leading-tight line-clamp-4">{book.title}</span>
            {author && <span className="text-xs opacity-70 mt-2 line-clamp-1">{author.name}</span>}
          </div>
        ) : (
          <img
            src={book.cover_url || ''}
            alt={book.title}
            className={cn(
              'w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 rounded-xl',
              imgState === 'loaded' ? 'opacity-100' : 'opacity-0'
            )}
            onError={handleError}
            onLoad={() => setImgState('loaded')}
            loading="lazy"
            referrerPolicy="no-referrer"
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
        {author && (
          <p className="text-xs text-gray-400 mt-1 line-clamp-1">{author.name_hindi || author.name}</p>
        )}
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
