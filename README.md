# AllAboutBooks V2

AI-powered book summaries in English & Hindi.

## Quick Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Set up database
- Go to your Supabase project → SQL Editor
- Copy and run the contents of `supabase-setup.sql`

### 3. Seed 50 books (with verified covers)
```bash
node seed-books.mjs
```

### 4. Start development server
```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## Tech Stack
- React + TypeScript + Vite
- Tailwind CSS
- Supabase (database)
- Lucide Icons
- Google Books API (for covers)
