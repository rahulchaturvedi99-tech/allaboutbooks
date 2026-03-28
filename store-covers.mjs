// ============================================
// Download all covers → Supabase Storage
// Run: node store-covers.mjs
// ============================================

import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  'https://cncabgzbyegfvbvazbgs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuY2FiZ3pieWVnZnZidmF6YmdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NDk5MDcsImV4cCI6MjA4MTEyNTkwN30.FFeLZcWHIVp_bscVINfjM75xwkJj-HH3rTJ3KZ2UH94'
);

const SUPABASE_URL = 'https://cncabgzbyegfvbvazbgs.supabase.co';
const BUCKET = 'book-covers';

async function downloadImage(url) {
  const res = await fetch(url, { headers: { 'Referer': '' } });
  if (!res.ok) throw new Error('Download failed: ' + res.status);
  const contentType = res.headers.get('content-type') || 'image/jpeg';
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length < 500) throw new Error('Image too small (probably placeholder)');
  return { buffer, contentType };
}

async function uploadToStorage(fileName, buffer, contentType) {
  const { data, error } = await sb.storage
    .from(BUCKET)
    .upload(fileName, buffer, {
      contentType,
      upsert: true,
    });
  if (error) throw new Error('Upload failed: ' + error.message);
  
  // Get public URL
  const { data: urlData } = sb.storage.from(BUCKET).getPublicUrl(fileName);
  return urlData.publicUrl;
}

async function processAllBooks() {
  console.log('📚 Downloading covers and uploading to Supabase Storage...\n');

  const { data: books, error } = await sb.from('books').select('id, title, isbn, cover_url');
  if (error) { console.error('Failed to fetch books:', error.message); return; }

  console.log(`Found ${books.length} books to process\n`);

  let uploaded = 0, skipped = 0, failed = 0;

  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    const label = `[${i + 1}/${books.length}]`;

    // Skip if already stored in Supabase Storage
    if (book.cover_url && book.cover_url.includes('supabase.co/storage')) {
      process.stdout.write(`${label} ${book.title}... ALREADY STORED\n`);
      skipped++;
      continue;
    }

    // Skip if no cover URL
    if (!book.cover_url || book.cover_url.includes('placehold')) {
      process.stdout.write(`${label} ${book.title}... NO COVER URL\n`);
      failed++;
      continue;
    }

    process.stdout.write(`${label} ${book.title}... `);

    try {
      // Download the image
      const { buffer, contentType } = await downloadImage(book.cover_url);

      // Create filename from ISBN or book ID
      const ext = contentType.includes('png') ? 'png' : 'jpg';
      const fileName = `${book.isbn || book.id}.${ext}`;

      // Upload to Supabase Storage
      const publicUrl = await uploadToStorage(fileName, buffer, contentType);

      // Update the book's cover_url in database
      const { error: updateError } = await sb
        .from('books')
        .update({ cover_url: publicUrl })
        .eq('id', book.id);

      if (updateError) {
        console.log('DB UPDATE FAIL: ' + updateError.message);
        failed++;
      } else {
        console.log('✅ STORED');
        uploaded++;
      }
    } catch (err) {
      console.log('FAIL: ' + err.message);
      failed++;
    }

    // Rate limit - small delay between requests
    await new Promise(r => setTimeout(r, 200));
  }

  console.log('\n=============================');
  console.log(`✅ Uploaded & stored: ${uploaded}`);
  console.log(`⏭️  Already stored: ${skipped}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📦 Total in storage: ${uploaded + skipped}`);
  console.log('=============================');
  console.log('\nCovers are now permanently stored in Supabase Storage!');
  console.log('They will never disappear even if Google Books changes their URLs.');
}

processAllBooks().then(() => process.exit(0));
