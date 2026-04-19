export const dynamic = 'force-dynamic'
import OpenAI from 'openai';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

// Groq is free, OpenAI-compatible, and extremely fast (~200 tokens/sec)
// Get your free key at: https://console.groq.com
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
  timeout: 25_000,
});

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Invalid messages format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const stream = await client.chat.completions.create({
      model: 'llama-3.1-8b-instant', // fastest free model on Groq — sub-second first token
      max_tokens: 512,
      stream: true,
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content: `You are Ro2ya's helpful AI assistant — an intelligent marketplace assistant for the Ro2ya platform, a premium SaaS marketplace based in Tunisia.

You help users:
- Find products and businesses that match their needs
- Compare options and make informed purchase decisions
- Navigate the Ro2ya marketplace
- Answer questions about sellers, products, and services
- Provide personalized recommendations

Personality: Warm, intelligent, concise, and trustworthy. Respond in the same language the user writes in (French, Arabic, or English). Keep answers focused and actionable. Be brief.`,
        },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ],
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? '';
            if (text) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (err) {
          console.error('[Stream error]', err);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error: unknown) {
    console.error('[Chat API Error]', JSON.stringify(error, null, 2));
    const message = error instanceof Error ? error.message : 'Failed to process your request.';
    const isTimeout = message.toLowerCase().includes('timeout');

    return new Response(
      JSON.stringify({
        error: isTimeout
          ? 'Request timed out. Please try again.'
          : message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}