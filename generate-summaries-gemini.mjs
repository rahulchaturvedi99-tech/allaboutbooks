// ============================================
// Generate AI Summaries using Google Gemini (FREE)
// Run: node generate-summaries-gemini.mjs
// ============================================

import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  'https://hshbqndvfeawxiyiwhxu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzaGJxbmR2ZmVhd3hpeWl3aHh1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDM0MTczMCwiZXhwIjoyMDg5OTE3NzMwfQ.-iCK4jyrclaUp8OpYKoRcyz8-izma8F-aZ-o7vhpUpc'
);

const GEMINI_KEY = 'AIzaSyDHoSlSzSifa6jZa3Mv5zjRQCI8N-v2rsM';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;

async function generateWithGemini(title, author, description, language, genre, pages) {
  const isHindi = language === 'hindi';

  const prompt = isHindi
    ? `इस पुस्तक के दो सारांश हिंदी में लिखें।

पुस्तक: ${title} - लेखक: ${author}
विवरण: ${description || 'कोई विवरण उपलब्ध नहीं'}
विधा: ${genre.join(', ')}
पृष्ठ: ${pages}

1. छोटा सारांश (short): 50-80 शब्दों में पुस्तक का सार
2. विस्तृत सारांश (long): 200-300 शब्दों में विस्तृत विश्लेषण`
    : `Write two summaries for this book.

Book: ${title} by ${author}
About: ${description || 'No description available'}
Genre: ${genre.join(', ')}
Pages: ${pages}

1. short: 50-80 word overview
2. long: 200-300 word analysis covering themes, who should read it, why it matters`;

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            short: { type: 'string' },
            long: { type: 'string' },
          },
          required: ['short', 'long'],
        },
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API ${res.status}: ${err.substring(0, 100)}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  if (!text) throw new Error('Empty response');

  const parsed = JSON.parse(text);
  if (!parsed.short || !parsed.long) throw new Error('Missing short or long');
  return parsed;
}

async function main() {
  console.log('🤖 Generating AI summaries using Google Gemini 2.5 Flash (FREE)\n');

  const { data: books } = await sb.from('books').select('*');
  const { data: authors } = await sb.from('authors').select('*');

  const getAuthorName = (id) => authors?.find(a => a.id === id)?.name || 'Unknown';

  const needsSummary = books.filter(b => !b.short_summary || !b.long_summary);
  const alreadyDone = books.length - needsSummary.length;

  console.log(`Total books: ${books.length}`);
  console.log(`Already have summaries: ${alreadyDone}`);
  console.log(`Need summaries: ${needsSummary.length}\n`);

  if (needsSummary.length === 0) {
    console.log('🎉 All books already have summaries!');
    return;
  }

  let generated = 0, failed = 0;

  for (let i = 0; i < needsSummary.length; i++) {
    const book = needsSummary[i];
    const authorName = getAuthorName(book.author_id);
    process.stdout.write(`[${i + 1}/${needsSummary.length}] ${book.title}... `);

    try {
      const summary = await generateWithGemini(
        book.title, authorName, book.description || '',
        book.language, book.genre || [], book.pages || 0
      );

      const { error } = await sb.from('books').update({
        short_summary: summary.short,
        long_summary: summary.long,
      }).eq('id', book.id);

      if (error) {
        console.log('DB ERROR: ' + error.message);
        failed++;
      } else {
        console.log('✅');
        generated++;
      }

      await new Promise(r => setTimeout(r, 1500));

    } catch (err) {
      console.log('FAIL: ' + err.message.substring(0, 80));
      failed++;
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  console.log('\n=============================');
  console.log(`✅ Generated: ${generated}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📖 Total with summaries: ${alreadyDone + generated}/${books.length}`);
  console.log('=============================');

  if (failed > 0) console.log('\nRun the script again to retry failed ones.');
}

main().then(() => process.exit(0));
