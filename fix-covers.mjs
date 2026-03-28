// ============================================
// Fix all missing/broken covers in NEW project
// Run: node fix-covers.mjs
// ============================================

import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  'https://hshbqndvfeawxiyiwhxu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzaGJxbmR2ZmVhd3hpeWl3aHh1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDM0MTczMCwiZXhwIjoyMDg5OTE3NzMwfQ.-iCK4jyrclaUp8OpYKoRcyz8-izma8F-aZ-o7vhpUpc'
);

const BUCKET = 'book-covers';

function isBadCover(url) {
  if (!url || url.trim() === '') return true;
  const bad = ['placehold', 'unsplash', 'not+available', 'not%20available', 'No+Cover', 'placeholder', 'ui-avatars'];
  return bad.some(b => url.includes(b));
}

function isAlreadyStored(url) {
  return url && url.includes('supabase.co/storage');
}

async function fetchCoverFromGoogle(isbn, title) {
  try {
    if (isbn) {
      const r = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
      const d = await r.json();
      const c = d.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
      if (c) return c.replace('http://', 'https://').replace('&edge=curl', '');
    }
    const r2 = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(title)}&maxResults=3`);
    const d2 = await r2.json();
    for (const item of (d2.items || [])) {
      const c = item.volumeInfo?.imageLinks?.thumbnail;
      if (c) return c.replace('http://', 'https://').replace('&edge=curl', '');
    }
  } catch {}
  return null;
}

async function downloadImage(url) {
  const res = await fetch(url, { headers: { 'Referer': '' } });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length < 500) throw new Error('Too small');
  const ct = res.headers.get('content-type') || 'image/jpeg';
  return { buffer, ct };
}

async function uploadAndUpdate(book, imageBuffer, contentType) {
  const ext = contentType.includes('png') ? 'png' : 'jpg';
  const fileName = `${book.isbn || book.id}.${ext}`;

  const { error: upErr } = await sb.storage.from(BUCKET).upload(fileName, imageBuffer, {
    contentType, upsert: true,
  });
  if (upErr) throw new Error('Upload: ' + upErr.message);

  const { data } = sb.storage.from(BUCKET).getPublicUrl(fileName);
  const publicUrl = data.publicUrl;

  const { error: dbErr } = await sb.from('books').update({ cover_url: publicUrl }).eq('id', book.id);
  if (dbErr) throw new Error('DB update: ' + dbErr.message);

  return publicUrl;
}

async function fixCovers() {
  console.log('🔧 Finding and fixing broken covers...\n');

  const { data: books, error } = await sb.from('books').select('id, title, isbn, cover_url');
  if (error) { console.error('Failed:', error.message); return; }

  // Find books that need fixing
  const needsFix = books.filter(b => isBadCover(b.cover_url) || !isAlreadyStored(b.cover_url));
  const alreadyGood = books.filter(b => isAlreadyStored(b.cover_url));

  console.log(`Total books: ${books.length}`);
  console.log(`Already in Storage: ${alreadyGood.length}`);
  console.log(`Need fixing: ${needsFix.length}\n`);

  if (needsFix.length === 0) {
    console.log('🎉 All covers are already stored in Supabase Storage!');
    return;
  }

  let fixed = 0, failed = 0;

  for (let i = 0; i < needsFix.length; i++) {
    const book = needsFix[i];
    const label = `[${i + 1}/${needsFix.length}]`;
    process.stdout.write(`${label} ${book.title}... `);

    try {
      // Step 1: If current URL is a working Google Books URL, try downloading it directly
      let imageData = null;
      if (book.cover_url && !isBadCover(book.cover_url)) {
        try {
          imageData = await downloadImage(book.cover_url);
          process.stdout.write('downloaded... ');
        } catch {
          // Current URL doesn't work, will try Google Books API
        }
      }

      // Step 2: If direct download failed, search Google Books API
      if (!imageData) {
        const googleUrl = await fetchCoverFromGoogle(book.isbn, book.title);
        if (!googleUrl) {
          console.log('NO COVER FOUND');
          failed++;
          continue;
        }
        try {
          imageData = await downloadImage(googleUrl);
          process.stdout.write('from Google... ');
        } catch {
          console.log('DOWNLOAD FAIL');
          failed++;
          continue;
        }
      }

      // Step 3: Upload to Supabase Storage and update DB
      await uploadAndUpdate(book, imageData.buffer, imageData.ct);
      console.log('✅ STORED');
      fixed++;
    } catch (err) {
      console.log('FAIL: ' + err.message);
      failed++;
    }

    await new Promise(r => setTimeout(r, 300));
  }

  console.log('\n=============================');
  console.log(`✅ Fixed: ${fixed}`);
  console.log(`❌ Still missing: ${failed}`);
  console.log(`📦 Total in Storage: ${alreadyGood.length + fixed}`);
  console.log('=============================');
}

fixCovers().then(() => process.exit(0));
