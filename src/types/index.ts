export interface Author {
  id: string;
  name: string;
  name_hindi?: string;
  bio: string;
  image_url: string;
  nationality: string;
}

export interface Book {
  id: string;
  title: string;
  title_hindi?: string;
  author_id: string;
  language: 'english' | 'hindi';
  description: string;
  cover_url: string;
  published_year: number;
  genre: string[];
  pages: number;
  isbn: string;
  trending: boolean;
  short_summary?: string;
  long_summary?: string;
  amazon_link?: string;
  created_at?: string;
  // Joined data
  author?: Author;
}

export interface GenreInfo {
  name: string;
  slug: string;
  color: string;
  icon: string;
}
