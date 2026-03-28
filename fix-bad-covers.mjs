// ============================================
// Fix bad covers (re-download real images)
// Run: node fix-bad-covers.mjs
// ============================================

import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  'https://hshbqndvfeawxiyiwhxu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzaGJxbmR2ZmVhd3hpeWl3aHh1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDM0MTczMCwiZXhwIjoyMDg5OTE3NzMwfQ.-iCK4jyrclaUp8OpYKoRcyz8-izma8F-aZ-o7vhpUpc'
);

const BUCKET = 'book-covers';
const MIN_SIZE = 5000; // Real covers are > 5KB

async function searchGoogleBooks(query) {
  const r = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5`);
  const d = await r.json();
  return d.items || [];
}

async function findGoodCover(isbn, title) {
  // Strategy 1: Search by ISBN
  if (isbn) {
    const items = await searchGoogleBooks('isbn:' + isbn);
    for (const item of items) {
      const url = item.volumeInfo?.imageLinks?.thumbnail;
      if (url) {
        const cleanUrl = url.replace('http://', 'https://').replace('&edge=curl', '');
        const buf = await downloadIfGood(cleanUrl);
        if (buf) return { buf, url: cleanUrl };
      }
    }
  }

  // Strategy 2: Search by title
  const items = await searchGoogleBooks(title);
  for (const item of items) {
    const url = item.volumeInfo?.imageLinks?.thumbnail;
    if (url) {
      const cleanUrl = url.replace('http://', 'https://').replace('&edge=curl', '');
      const buf = await downloadIfGood(cleanUrl);
      if (buf) return { buf, url: cleanUrl };
    }
  }

  // Strategy 3: Open Library
  if (isbn) {
    const olUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
    const buf = await downloadIfGood(olUrl);
    if (buf) return { buf, url: olUrl };
  }

  return null;
}

async function downloadIfGood(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    // Only accept images larger than MIN_SIZE (filters out "image not available" placeholders)
    if (buf.byteLength > MIN_SIZE) return buf;
    return null;
  } catch {
    return null;
  }
}

async function main() {
  console.log('🔧 Finding and fixing bad covers (< 5KB)...\n');

  const { data: books } = await sb.from('books').select('id, title, isbn, cover_url');

  // Find all bad covers by checking file size
  const badBooks = [];
  console.log('Scanning all covers...');
  for (const b of books) {
    try {
      const res = await fetch(b.cover_url);
      const buf = await res.arrayBuffer();
      if (buf.byteLength < MIN_SIZE) badBooks.push(b);
    } catch {
      badBooks.push(b);
    }
  }

  console.log(`\nFound ${badBooks.length} bad covers to fix\n`);

  let fixed = 0, notFound = 0;

  for (let i = 0; i < badBooks.length; i++) {
    const book = badBooks[i];
    process.stdout.write(`[${i + 1}/${badBooks.length}] ${book.title}... `);

    const result = await findGoodCover(book.isbn, book.title);

    if (result) {
      // Delete old file from storage
      const oldFileName = book.cover_url.split('/').pop();
      if (oldFileName) {
        await sb.storage.from(BUCKET).remove([oldFileName]);
      }

      // Upload new file
      const fileName = `${book.isbn || book.id}.jpg`;
      const { error: upErr } = await sb.storage.from(BUCKET).upload(fileName, result.buf, {
        contentType: 'image/jpeg',
        upsert: true,
      });

      if (upErr) {
        console.log('UPLOAD FAIL: ' + upErr.message);
        notFound++;
        continue;
      }

      // Update DB
      const { data: urlData } = sb.storage.from(BUCKET).getPublicUrl(fileName);
      // Add cache buster to force browser to reload
      const newUrl = urlData.publicUrl + '?v=' + Date.now();
      await sb.from('books').update({ cover_url: newUrl }).eq('id', book.id);

      console.log(`✅ (${(result.buf.byteLength / 1024).toFixed(1)}KB)`);
      fixed++;
    } else {
      console.log('❌ NO GOOD COVER FOUND');
      notFound++;
    }

    await new Promise(r => setTimeout(r, 350));
  }

  console.log('\n=============================');
  console.log(`✅ Fixed: ${fixed}`);
  console.log(`❌ No cover found: ${notFound}`);
  console.log('=============================');
  
  if (notFound > 0) {
    console.log('\nBooks still without covers need manual fixing.');
    console.log('Find covers on Amazon.in and update manually.');
  }
}

main().then(() => process.exit(0));
