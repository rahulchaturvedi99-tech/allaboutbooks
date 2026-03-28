import { useEffect } from 'react';
import { Book, Author } from '@/types';

interface StructuredDataProps {
  book: Book;
  author?: Author;
}

export function BookStructuredData({ book, author }: StructuredDataProps) {
  useEffect(() => {
    // Remove any existing structured data
    const existing = document.querySelector('script[data-structured="book"]');
    if (existing) existing.remove();

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Book',
      name: book.title,
      alternateName: book.title_hindi || undefined,
      author: {
        '@type': 'Person',
        name: author?.name || 'Unknown',
      },
      isbn: book.isbn || undefined,
      numberOfPages: book.pages || undefined,
      inLanguage: book.language === 'hindi' ? 'hi' : 'en',
      datePublished: book.published_year ? String(book.published_year) : undefined,
      genre: book.genre?.join(', ') || undefined,
      description: book.short_summary || book.description || undefined,
      image: book.cover_url || undefined,
      url: `https://allaboutbooks.co/books/${book.slug || book.id}`,
      publisher: {
        '@type': 'Organization',
        name: 'AllAboutBooks',
        url: 'https://allaboutbooks.co',
      },
      review: book.short_summary ? {
        '@type': 'Review',
        reviewBody: book.short_summary,
        author: {
          '@type': 'Organization',
          name: 'AllAboutBooks AI',
        },
      } : undefined,
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.0',
        bestRating: '5',
        ratingCount: '1',
      },
      offers: {
        '@type': 'Offer',
        availability: 'https://schema.org/InStock',
        url: `https://www.amazon.in/s?k=${encodeURIComponent(book.title)}&tag=allaboutbo07b-21`,
        priceCurrency: 'INR',
        seller: {
          '@type': 'Organization',
          name: 'Amazon.in',
        },
      },
    };

    // Clean undefined values
    const clean = JSON.parse(JSON.stringify(jsonLd));

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-structured', 'book');
    script.textContent = JSON.stringify(clean);
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [book, author]);

  return null;
}

// FAQ Structured Data for book pages
export function BookFAQData({ book, author }: StructuredDataProps) {
  useEffect(() => {
    const existing = document.querySelector('script[data-structured="faq"]');
    if (existing) existing.remove();

    if (!book.short_summary) return;

    const faqs = [
      {
        question: `What is ${book.title} about?`,
        answer: book.short_summary || book.description || '',
      },
      {
        question: `Who wrote ${book.title}?`,
        answer: `${book.title} was written by ${author?.name || 'the author'} and published in ${book.published_year}. It is a ${book.pages}-page ${book.genre?.[0] || ''} book available in ${book.language === 'hindi' ? 'Hindi' : 'English'}.`,
      },
      {
        question: `Is ${book.title} worth reading?`,
        answer: `${book.title} is a ${book.trending ? 'trending and ' : ''}highly regarded ${book.genre?.join(', ') || ''} book. ${book.long_summary ? book.long_summary.substring(0, 200) + '...' : 'It offers valuable insights for readers interested in this genre.'}`,
      },
    ];

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-structured', 'faq');
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    return () => { script.remove(); };
  }, [book, author]);

  return null;
}

// Website Structured Data for homepage
export function WebsiteStructuredData() {
  useEffect(() => {
    const existing = document.querySelector('script[data-structured="website"]');
    if (existing) existing.remove();

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'AllAboutBooks',
      url: 'https://allaboutbooks.co',
      description: 'Discover books with AI-powered summaries in English and Hindi. Quick insights for busy readers.',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://allaboutbooks.co/books?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-structured', 'website');
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    return () => { script.remove(); };
  }, []);

  return null;
}
