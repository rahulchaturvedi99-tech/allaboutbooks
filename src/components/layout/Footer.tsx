import { Link } from 'react-router-dom';
import { BookOpen, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-ink-900 text-ink-300 mt-auto">
      <div className="container-page py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="font-display text-lg font-bold text-white">AllAboutBooks</span>
            </Link>
            <p className="text-sm text-ink-400 leading-relaxed">
              Discover your next favorite book with AI-powered summaries in English and Hindi. 
              Quick insights for busy readers.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Explore</h4>
            <div className="flex flex-col gap-2">
              <Link to="/books" className="text-sm hover:text-brand-400 transition-colors">Browse Books</Link>
              <Link to="/authors" className="text-sm hover:text-brand-400 transition-colors">Authors</Link>
              <Link to="/books?lang=hindi" className="text-sm hover:text-brand-400 transition-colors">Hindi Books</Link>
              <Link to="/books?lang=english" className="text-sm hover:text-brand-400 transition-colors">English Books</Link>
            </div>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-semibold text-white mb-4">About</h4>
            <p className="text-sm text-ink-400 leading-relaxed">
              All book summaries are AI-generated. We encourage you to support authors by purchasing original books.
            </p>
            <p className="text-sm text-ink-500 mt-3">
              As an Amazon Associate, we earn from qualifying purchases.
            </p>
          </div>
        </div>

        <div className="border-t border-ink-700 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-ink-500">
            &copy; {new Date().getFullYear()} AllAboutBooks. All rights reserved.
          </p>
          <p className="text-xs text-ink-500 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-coral-400 fill-coral-400" /> for readers
          </p>
        </div>
      </div>
    </footer>
  );
}
