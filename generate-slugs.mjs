// ============================================
// Generate SEO-friendly slugs for all books
// Run: node generate-slugs.mjs
// ============================================

import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  'https://hshbqndvfeawxiyiwhxu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzaGJxbmR2ZmVhd3hpeWl3aHh1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDM0MTczMCwiZXhwIjoyMDg5OTE3NzMwfQ.-iCK4jyrclaUp8OpYKoRcyz8-izma8F-aZ-o7vhpUpc'
);

function createSlug(title, authorName) {
  const text = `${title} ${authorName || ''}`
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')     // remove special chars
    .replace(/\s+/g, '-')         // spaces to hyphens
    .replace(/-+/g, '-')          // collapse multiple hyphens
    .replace(/^-|-$/g, '')        // trim hyphens
    .substring(0, 80);            // max length
  return text;
}

async function main() {
  console.log('🔗 Generating SEO slugs for all books...\n');

  const { data: books, error: bErr } = await sb.from('books').select('id, title, slug, author_id');
if (bErr) { console.error('Error:', bErr.message); return; }
if (!books || books.length === 0) { console.log('No books found'); return; }
  const { data: authors } = await sb.from('authors').select('id, name') || { data: [] };

  const getAuthorName = (id) => authors?.find(a => a.id === id)?.name || '';

  // Track used slugs to avoid duplicates
  const usedSlugs = new Set();
  let updated = 0, skipped = 0;

  for (const book of books) {
    if (book.slug) {
      usedSlugs.add(book.slug);
      skipped++;
      continue;
    }

    let slug = createSlug(book.title, getAuthorName(book.author_id));

    // Handle duplicates by adding a number
    let finalSlug = slug;
    let counter = 2;
    while (usedSlugs.has(finalSlug)) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }
    usedSlugs.add(finalSlug);

    const { error } = await sb.from('books').update({ slug: finalSlug }).eq('id', book.id);

    if (error) {
      console.log(`❌ ${book.title}: ${error.message}`);
    } else {
      console.log(`✅ ${book.title} → /${finalSlug}`);
      updated++;
    }
  }

  console.log(`\n=============================`);
  console.log(`✅ Updated: ${updated}`);
  console.log(`⏭️  Already had slugs: ${skipped}`);
  console.log(`=============================`);
}

main().then(() => process.exit(0));
