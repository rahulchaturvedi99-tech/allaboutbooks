// ============================================
// Generate "Should I Read This?" AI Scores
// Run: node generate-scores.mjs
// ============================================

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const sb = createClient(
  'https://hshbqndvfeawxiyiwhxu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzaGJxbmR2ZmVhd3hpeWl3aHh1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDM0MTczMCwiZXhwIjoyMDg5OTE3NzMwfQ.-iCK4jyrclaUp8OpYKoRcyz8-izma8F-aZ-o7vhpUpc'
);

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;

async function generateScore(title, author, description, language, genre, pages) {
  const prompt = `You are a book critic and reading advisor. Analyze this book and generate a reading recommendation score.

Book: "${title}" by ${author}
Description: ${description || 'No description available'}
Genre: ${genre.join(', ')}
Pages: ${pages || 'Unknown'}
Language: ${language}

Generate scores from 1-10 for each dimension:
- readability: How easy is it to read? (1=very difficult academic, 10=page-turner)
- impact: How much will it change the reader's thinking/life? (1=light entertainment, 10=life-changing)
- entertainment: How engaging/enjoyable is the reading experience? (1=dry, 10=unputdownable)
- relevance: How relevant is it in 2026? (1=outdated, 10=extremely timely)
- value: Is it worth the time investment? (1=skip it, 10=must-read)
- overall: Overall recommendation score (1-10, weighted average)

Also provide:
- reading_time_minutes: Estimated reading time in minutes (average reader reads 250 words/minute, use page count)
- best_for: Array of 2-4 audience tags like "Career professionals", "Students", "Fiction lovers", "Hindi literature fans", "Self-improvement seekers", "History buffs", "Young adults", "Entrepreneurs", "Philosophy enthusiasts", "Casual readers"
- verdict: A punchy 2-3 sentence recommendation. Be honest — say who should read it AND who should skip it. ${language === 'hindi' ? 'Write the verdict in Hindi.' : ''}`;

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
            readability: { type: 'number' },
            impact: { type: 'number' },
            entertainment: { type: 'number' },
            relevance: { type: 'number' },
            value: { type: 'number' },
            overall: { type: 'number' },
            reading_time_minutes: { type: 'number' },
            best_for: { type: 'array', items: { type: 'string' } },
            verdict: { type: 'string' },
          },
          required: ['readability', 'impact', 'entertainment', 'relevance', 'value', 'overall', 'reading_time_minutes', 'best_for', 'verdict'],
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
  return JSON.parse(text);
}

async function main() {
  console.log('🎯 Generating "Should I Read This?" scores...\n');

  const { data: books } = await sb.from('books').select('*');
  const { data: authors } = await sb.from('authors').select('*');

  const getAuthorName = (id) => authors?.find(a => a.id === id)?.name || 'Unknown';

  // Filter books without scores
  const needsScore = books.filter(b => !b.read_score);
  const alreadyDone = books.length - needsScore.length;

  console.log(`Total books: ${books.length}`);
  console.log(`Already have scores: ${alreadyDone}`);
  console.log(`Need scores: ${needsScore.length}\n`);

  if (needsScore.length === 0) {
    console.log('🎉 All books already have scores!');
    return;
  }

  let generated = 0, failed = 0;

  for (let i = 0; i < needsScore.length; i++) {
    const book = needsScore[i];
    const authorName = getAuthorName(book.author_id);
    process.stdout.write(`[${i + 1}/${needsScore.length}] ${book.title}... `);

    try {
      const score = await generateScore(
        book.title, authorName, book.description || '',
        book.language, book.genre || [], book.pages || 0
      );

      // Separate the scores into read_score JSON and individual columns
      const readScore = {
        readability: Math.min(10, Math.max(1, Math.round(score.readability))),
        impact: Math.min(10, Math.max(1, Math.round(score.impact))),
        entertainment: Math.min(10, Math.max(1, Math.round(score.entertainment))),
        relevance: Math.min(10, Math.max(1, Math.round(score.relevance))),
        value: Math.min(10, Math.max(1, Math.round(score.value))),
        overall: Math.min(10, Math.max(1, parseFloat(score.overall.toFixed(1)))),
      };

      const { error } = await sb.from('books').update({
        read_score: readScore,
        reading_time_minutes: Math.round(score.reading_time_minutes) || Math.round((book.pages || 250) * 1.5),
        best_for: (score.best_for || []).slice(0, 4),
        verdict: score.verdict || '',
      }).eq('id', book.id);

      if (error) {
        console.log('DB ERROR: ' + error.message);
        failed++;
      } else {
        console.log(`✅ (${readScore.overall}/10)`);
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
  console.log(`🎯 Total with scores: ${alreadyDone + generated}/${books.length}`);
  console.log('=============================');

  if (failed > 0) console.log('\nRun again to retry failed ones.');
}

main().then(() => process.exit(0));
