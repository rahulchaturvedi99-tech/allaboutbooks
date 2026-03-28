import { Link } from 'react-router-dom';
import { BookOpen, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center px-4">
      <BookOpen className="w-20 h-20 text-ink-200" strokeWidth={1} />
      <div>
        <h1 className="font-display text-4xl font-bold text-ink-900">404</h1>
        <p className="text-ink-500 mt-2">This page has wandered off the bookshelf</p>
      </div>
      <Link to="/" className="btn-primary">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>
    </div>
  );
}
