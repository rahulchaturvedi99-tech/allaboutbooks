// AI Summary Service
// Generates book summaries using Claude API

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

interface SummaryResult {
  short: string;
  long: string;
}

export async function generateBookSummary(
  title: string,
  author: string,
  description: string,
  language: 'english' | 'hindi',
  genre: string[],
  pages: number
): Promise<SummaryResult> {
  const langInstruction = language === 'hindi'
    ? 'Write the summaries in Hindi (Devanagari script). Use simple, accessible Hindi.'
    : 'Write the summaries in English.';

  const prompt = `You are a book expert and literary critic. Generate TWO summaries for this book:

Book: "${title}" by ${author}
Description: ${description}
Genre: ${genre.join(', ')}
Pages: ${pages}
Language: ${language}

${langInstruction}

Generate:
1. SHORT SUMMARY (50-80 words): A concise overview capturing the essence of the book. Include what makes it worth reading.
2. LONG SUMMARY (200-350 words): A comprehensive analysis covering:
   - What the book is about (plot/main ideas)
   - Key themes and takeaways
   - Who should read this book
   - Why it matters

IMPORTANT: Do NOT include spoilers. Focus on what makes the book compelling.

Respond ONLY with valid JSON in this exact format, no markdown, no backticks:
{"short": "...", "long": "..."}`;

  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [
        { role: 'user', content: prompt }
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || '';
  
  // Parse JSON response
  try {
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(clean);
    return {
      short: parsed.short || '',
      long: parsed.long || '',
    };
  } catch {
    // If JSON parsing fails, use the raw text as short summary
    return {
      short: text.slice(0, 300),
      long: text,
    };
  }
}
