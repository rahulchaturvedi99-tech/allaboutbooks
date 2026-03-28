// ============================================
// Migrate everything to NEW Supabase project
// Run: node migrate.mjs
// ============================================

import { createClient } from '@supabase/supabase-js';

// OLD project (read data from here)
const OLD = createClient(
  'https://cncabgzbyegfvbvazbgs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuY2FiZ3pieWVnZnZidmF6YmdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NDk5MDcsImV4cCI6MjA4MTEyNTkwN30.FFeLZcWHIVp_bscVINfjM75xwkJj-HH3rTJ3KZ2UH94'
);

// NEW project (write data + storage here) — using service_role to bypass RLS
const NEW = createClient(
  'https://hshbqndvfeawxiyiwhxu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzaGJxbmR2ZmVhd3hpeWl3aHh1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDM0MTczMCwiZXhwIjoyMDg5OTE3NzMwfQ.-iCK4jyrclaUp8OpYKoRcyz8-izma8F-aZ-o7vhpUpc'
);

const NEW_URL = 'https://hshbqndvfeawxiyiwhxu.supabase.co';
const BUCKET = 'book-covers';

// Download image from URL
async function downloadImage(url) {
  const res = await fetch(url, { headers: { 'Referer': '' } });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length < 500) throw new Error('Too small');
  const ct = res.headers.get('content-type') || 'image/jpeg';
  return { buffer, ct };
}

// Upload to new project storage
async function uploadCover(fileName, buffer, ct) {
  const { error } = await NEW.storage.from(BUCKET).upload(fileName, buffer, { contentType: ct, upsert: true });
  if (error) throw new Error(error.message);
  const { data } = NEW.storage.from(BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}

async function migrate() {
  console.log('🚀 MIGRATION: Old project → New project\n');

  // ===== STEP 1: Copy Authors =====
  console.log('📋 Step 1: Copying authors...');
  const { data: oldAuthors, error: ae } = await OLD.from('authors').select('*');
  if (ae) { console.error('Failed to read old authors:', ae.message); return; }
  console.log(`   Found ${oldAuthors.length} authors in old project`);

  let authorMap = {}; // old_id → new_id
  let authorsAdded = 0;

  for (const a of oldAuthors) {
    // Check if already exists in new project
    const { data: existing } = await NEW.from('authors').select('id').ilike('name', a.name).single();
    if (existing) {
      authorMap[a.id] = existing.id;
      continue;
    }

    const { data: created, error } = await NEW.from('authors').insert({
      name: a.name,
      name_hindi: a.name_hindi || null,
      bio: a.bio || 'Author of acclaimed books',
      image_url: a.image_url || '',
      nationality: a.nationality || '',
    }).select('id').single();

    if (error) {
      console.log(`   ❌ Author "${a.name}": ${error.message}`);
      continue;
    }
    authorMap[a.id] = created.id;
    authorsAdded++;
  }
  console.log(`   ✅ ${authorsAdded} authors added, ${oldAuthors.length - authorsAdded} already existed\n`);

  // ===== STEP 2: Copy Books + Download Covers =====
  console.log('📋 Step 2: Copying books + downloading covers...');
  const { data: oldBooks, error: be } = await OLD.from('books').select('*');
  if (be) { console.error('Failed to read old books:', be.message); return; }
  console.log(`   Found ${oldBooks.length} books in old project\n`);

  let booksAdded = 0, coversSaved = 0, booksFailed = 0;

  for (let i = 0; i < oldBooks.length; i++) {
    const b = oldBooks[i];
    const label = `[${i + 1}/${oldBooks.length}]`;
    process.stdout.write(`${label} ${b.title}... `);

    // Skip if already in new project
    if (b.isbn) {
      const { data: dup } = await NEW.from('books').select('id').eq('isbn', b.isbn).single();
      if (dup) { console.log('DUPLICATE'); continue; }
    }

    // Map author ID
    const newAuthorId = authorMap[b.author_id];
    if (!newAuthorId) { console.log('NO AUTHOR'); booksFailed++; continue; }

    // Try to download and store cover
    let finalCoverUrl = b.cover_url || '';
    if (b.cover_url && !b.cover_url.includes('placehold') && !b.cover_url.includes('unsplash')) {
      try {
        const { buffer, ct } = await downloadImage(b.cover_url);
        const ext = ct.includes('png') ? 'png' : 'jpg';
        const fileName = `${b.isbn || b.id}.${ext}`;
        finalCoverUrl = await uploadCover(fileName, buffer, ct);
        coversSaved++;
        process.stdout.write('📸 ');
      } catch (err) {
        // Keep original URL if download fails
        process.stdout.write('⚠️ ');
      }
    }

    // Insert book into new project
    const { error } = await NEW.from('books').insert({
      title: b.title,
      title_hindi: b.title_hindi || null,
      author_id: newAuthorId,
      language: b.language || 'english',
      description: b.description || '',
      cover_url: finalCoverUrl,
      published_year: b.published_year || 2024,
      genre: b.genre || [],
      pages: b.pages || 0,
      isbn: b.isbn || '',
      trending: b.trending || false,
      short_summary: b.short_summary || null,
      long_summary: b.long_summary || null,
      amazon_link: b.amazon_link || null,
    });

    if (error) {
      console.log('DB ERROR: ' + error.message);
      booksFailed++;
    } else {
      console.log('✅');
      booksAdded++;
    }

    await new Promise(r => setTimeout(r, 250));
  }

  console.log('\n=============================');
  console.log(`📚 Books added: ${booksAdded}`);
  console.log(`📸 Covers stored: ${coversSaved}`);
  console.log(`❌ Failed: ${booksFailed}`);
  console.log('=============================');
  console.log('\n✅ Migration complete!');
  console.log('\nNow update your .env file:');
  console.log('VITE_SUPABASE_URL=https://hshbqndvfeawxiyiwhxu.supabase.co');
  console.log('VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzaGJxbmR2ZmVhd3hpeWl3aHh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNDE3MzAsImV4cCI6MjA4OTkxNzczMH0.4HzN11HyAhXnlMjt0pn1RCnfUZi38M123LChPEDpAMs');
}

migrate().then(() => process.exit(0));
