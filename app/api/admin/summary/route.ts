import { NextRequest, NextResponse } from 'next/server';

// Uses Gemini 2.5 Flash (your existing model) via the REST API.
const MODEL = 'gemini-2.5-flash';

export async function POST(request: NextRequest) {
  try {
    const { title, author, language, description } = await request.json();

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is missing in .env.local' }, { status: 500 });
    }

    const langLine =
      language === 'hindi'
        ? 'Write everything in Hindi (Devanagari script).'
        : 'Write everything in English.';

    // We ask Gemini to return strict JSON so we can split it into 3 fields.
    const prompt = `You are writing book summaries for a book-summary website.
Book title: "${title}"
${author ? `Author: ${author}` : ''}
${description ? `Publisher description: ${description}` : ''}

${langLine}

Return ONLY valid JSON (no markdown, no backticks) in exactly this shape:
{
  "short_summary": "2-3 sentence hook, ~60 words, makes a reader want the book",
  "long_summary": "5-7 paragraph detailed summary covering key themes, main ideas, and takeaways, ~500 words",
  "verdict": "1-2 sentence final recommendation: who should read this and why"
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 2048 },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `Gemini error (${res.status}): ${errText.slice(0, 200)}` }, { status: 400 });
    }

    const data = await res.json();
    let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Strip any stray ```json fences Gemini sometimes adds.
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      // If JSON parsing fails, return the raw text in the long field
      // so your work isn't lost — you can paste it manually.
      return NextResponse.json({
        ok: true,
        short_summary: '',
        long_summary: text,
        verdict: '',
        warning: 'AI did not return clean JSON; raw text placed in long summary.',
      });
    }

    return NextResponse.json({
      ok: true,
      short_summary: parsed.short_summary || '',
      long_summary: parsed.long_summary || '',
      verdict: parsed.verdict || '',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Summary generation crashed' }, { status: 500 });
  }
}