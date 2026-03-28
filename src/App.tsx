import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import HomePage from '@/pages/HomePage';
import BooksPage from '@/pages/BooksPage';
import BookDetailPage from '@/pages/BookDetailPage';
import AuthorsPage from '@/pages/AuthorsPage';
import NotFoundPage from '@/pages/NotFoundPage';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/books" element={<BooksPage />} />
              <Route path="/books/:id" element={<BookDetailPage />} />
              <Route path="/authors" element={<AuthorsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
