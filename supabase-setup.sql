-- ============================================
-- AllAboutBooks V2 - Database Setup
-- Run this in Supabase SQL Editor
-- ============================================

-- Authors table
CREATE TABLE IF NOT EXISTS authors_v2 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_hindi TEXT,
  bio TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  nationality TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Books table
CREATE TABLE IF NOT EXISTS books_v2 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  title_hindi TEXT,
  author_id UUID REFERENCES authors_v2(id),
  language TEXT NOT NULL DEFAULT 'english',
  description TEXT DEFAULT '',
  cover_url TEXT DEFAULT '',
  published_year INT DEFAULT 2024,
  genre TEXT[] DEFAULT '{}',
  pages INT DEFAULT 0,
  isbn TEXT DEFAULT '',
  trending BOOLEAN DEFAULT false,
  short_summary TEXT,
  long_summary TEXT,
  amazon_link TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_books_v2_author ON books_v2(author_id);
CREATE INDEX IF NOT EXISTS idx_books_v2_language ON books_v2(language);
CREATE INDEX IF NOT EXISTS idx_books_v2_trending ON books_v2(trending);
CREATE INDEX IF NOT EXISTS idx_books_v2_isbn ON books_v2(isbn);

-- Enable RLS
ALTER TABLE authors_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE books_v2 ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public read authors_v2" ON authors_v2 FOR SELECT USING (true);
CREATE POLICY "Public read books_v2" ON books_v2 FOR SELECT USING (true);

-- Allow insert/update for authenticated or anon (for admin scripts)
CREATE POLICY "Allow insert authors_v2" ON authors_v2 FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update authors_v2" ON authors_v2 FOR UPDATE USING (true);
CREATE POLICY "Allow insert books_v2" ON books_v2 FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update books_v2" ON books_v2 FOR UPDATE USING (true);
