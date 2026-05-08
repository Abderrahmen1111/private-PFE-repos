import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Mock extractDarijaWords if needed or import it
import { extractDarijaWords } from '../lib/darija-dictionary';

const MODEL_CHAIN = [
  'anthropic/claude-3-haiku',
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemma-3-27b-it:free',
  'openrouter/free',
];

async function openRouterChat(
  systemPrompt: string,
  userMessage: string,
  maxTokens = 200,
): Promise<{ text: string; modelUsed: string }> {
  for (const model of MODEL_CHAIN) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'X-Title': 'Smart Search Test',
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          temperature: 0.1,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
        }),
      });
      if (!res.ok) continue;
      const data = await res.json();
      return { text: data.choices?.[0]?.message?.content?.trim(), modelUsed: data.model ?? model };
    } catch (e) { console.error(`Error with ${model}:`, e); }
  }
  throw new Error('All models failed');
}

async function normalizeDarija(query: string) {
  const darijaWords = extractDarijaWords(query);
  const systemPrompt = `Expert darija tunisien. Traduis en français marketplace. Réponse courte, que la traduction.`;
  const hint = darijaWords.length > 0 ? `\nIndices : ${darijaWords.map(w => `${w.original}→${w.french}`).join(',')}` : '';
  console.log(`Generated hint: ${hint}`);
  return openRouterChat(systemPrompt, `"${query}"${hint}`, 120);
}

async function test() {
  const query = "nhb nkl haja";
  console.log(`Input: ${query}`);
  const result = await normalizeDarija(query);
  console.log(`Normalized: ${result.text} (using ${result.modelUsed})`);
}

test();
