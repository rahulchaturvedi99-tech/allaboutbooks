import { Link } from 'react-router-dom';
import { useBooks } from '@/hooks/useBooks';
import { BookCard } from '@/components/books/BookCard';
import { BookOpen, User, Search, X, ChevronDown, ChevronUp, Globe } from 'lucide-react';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { SEOHead } from '@/components/layout/SEOHead';

export default function AuthorsPage() {
  const { authors, books, getBooksByAuthor, getAuthor, isLoading } = useBooks();
  const [search, setSearch] = useState('');
  const [expandedAuthor, setExpandedAuthor] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'books'>('books');

  const filtered = useMemo(() => {
    let result = authors.filter(a =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.name_hindi?.includes(search) ||
      a.nationality?.toLowerCase().includes(search.toLowerCase())
    );

    if (sortBy === 'books') {
      result = [...result].sort((a, b) => getBooksByAuthor(b.id).length - getBooksByAuthor(a.id).length);
    } else {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [authors, search, sortBy]);

  // Group authors by first letter
  const authorsByLetter = useMemo(() => {
    if (sortBy !== 'name') return null;
    const groups: Record<string, typeof filtered> = {};
    filtered.forEach(a => {
      const letter = a.name[0]?.toUpperCase() || '#';
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(a);
    });
    return groups;
  }, [filtered, sortBy]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <SEOHead title="Authors" description="Explore authors from India and around the world. Discover their books with AI summaries." url="/authors" />
        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center animate-float">
          <BookOpen className="w-5 h-5 text-orange-500" />
        </div>
      </div>
    );
  }

  const toggleAuthor = (id: string) => {
    setExpandedAuthor(expandedAuthor === id ? null : id);
  };

  const renderAuthorCard = (author: typeof authors[0], index: number) => {
    const authorBooks = getBooksByAuthor(author.id);
    const isExpanded = expandedAuthor === author.id;
    const initials = author.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    // Generate a consistent color based on author name
    const colors = [
      'from-orange-400 to-orange-600',
      'from-blue-400 to-blue-600',
      'from-emerald-400 to-emerald-600',
      'from-violet-400 to-violet-600',
      'from-rose-400 to-rose-600',
      'from-amber-400 to-amber-600',
      'from-cyan-400 to-cyan-600',
      'from-indigo-400 to-indigo-600',
    ];
    let hash = 0;
    for (let i = 0; i < author.name.length; i++) hash = author.name.charCodeAt(i) + ((hash << 5) - hash);
    const colorClass = colors[Math.abs(hash) % colors.length];

    return (
      <div
        key={author.id}
        className="animate-slide-up"
        style={{ animationDelay: `${index * 0.03}s` }}
      >
        <div
          className={cn(
            'bg-white rounded-2xl border transition-all duration-300 cursor-pointer',
            isExpanded ? 'border-orange-200 shadow-lg' : 'border-gray-100 hover:border-gray-200 hover:shadow-md'
          )}
        >
          {/* Author info */}
          <div className="p-5 flex items-center gap-4" onClick={() => toggleAuthor(author.id)}>
            {/* Avatar */}
            <div className={cn(
              'w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center flex-shrink-0 text-white font-bold text-lg',
              colorClass
            )}>
              {author.image_url && !author.image_url.includes('ui-avatars') && !author.image_url.includes('unsplash') && !author.image_url.includes('placeholder') ? (
                <img src={author.image_url} alt={author.name} className="w-full h-full rounded-2xl object-cover" referrerPolicy="no-referrer" />
              ) : (
                initials
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-bold text-gray-900 text-base leading-tight">
                {author.name}
              </h3>
              {author.name_hindi && (
                <p className="text-xs text-gray-400 mt-0.5">{author.name_hindi}</p>
              )}
              <div className="flex items-center gap-3 mt-1.5">
                {author.nationality && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Globe className="w-3 h-3" />
                    {author.nationality}
                  </span>
                )}
                <span className="text-xs font-bold text-orange-500">
                  {authorBooks.length} {authorBooks.length === 1 ? 'book' : 'books'}
                </span>
              </div>
            </div>

            {/* Expand toggle */}
            <div className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
              isExpanded ? 'bg-orange-100' : 'bg-gray-50'
            )}>
              {isExpanded
                ? <ChevronUp className="w-4 h-4 text-orange-600" />
                : <ChevronDown className="w-4 h-4 text-gray-400" />
              }
            </div>
          </div>

          {/* Expanded: Author bio + books */}
          {isExpanded && (
            <div className="px-5 pb-5 border-t border-gray-100 pt-4 animate-fade-in">
              {author.bio && author.bio !== 'Author of acclaimed books' && (
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{author.bio}</p>
              )}

              {authorBooks.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Books by {author.name.split(' ')[0]}
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {authorBooks.map((book, i) => (
                      <BookCard key={book.id} book={book} index={i} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container-page py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="section-title">Authors</h1>
          <p className="section-subtitle">{authors.length} authors in our collection</p>
        </div>

        {/* Search + Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or nationality..."
              className="w-full pl-11 pr-10 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50
                       focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-lg">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSortBy('books')}
              className={cn(
                'px-4 py-3 rounded-xl text-xs font-bold transition-all',
                sortBy === 'books' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'
              )}
            >
              Most Books
            </button>
            <button
              onClick={() => setSortBy('name')}
              className={cn(
                'px-4 py-3 rounded-xl text-xs font-bold transition-all',
                sortBy === 'name' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'
              )}
            >
              A → Z
            </button>
          </div>
        </div>

        {/* Results count */}
        <p className="text-xs text-gray-400 mb-4">{filtered.length} authors found</p>

        {/* Author list */}
        {sortBy === 'name' && authorsByLetter ? (
          // Grouped by letter
          Object.entries(authorsByLetter).map(([letter, letterAuthors]) => (
            <div key={letter} className="mb-6">
              <div className="sticky top-16 z-10 bg-white py-2 mb-3">
                <span className="font-display text-2xl font-bold text-orange-500">{letter}</span>
                <span className="text-xs text-gray-400 ml-2">{letterAuthors.length} authors</span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {letterAuthors.map((author, i) => renderAuthorCard(author, i))}
              </div>
            </div>
          ))
        ) : (
          // Flat list sorted by book count
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {filtered.map((author, i) => renderAuthorCard(author, i))}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <User className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-semibold text-lg">No authors found</p>
            <p className="text-gray-400 text-sm mt-1">Try a different search</p>
            <button onClick={() => setSearch('')} className="btn-primary mt-6 text-sm">
              Clear search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
