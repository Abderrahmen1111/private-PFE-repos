import { NextRequest } from 'next/server'
import { getStoreContext } from '@/lib/actions/ai-agent'
import { buildRouterPrompt, getAgentPrompt } from '@/lib/agents/prompts'
import { lookupDarija, formatDarijaContext } from '@/lib/agents/darija-rag'

export const runtime = 'edge'

type ChatTurn = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

type ValidIntent = 'order_tracking' | 'product_info' | 'general' | 'store_info' | 'promotions' | 'feedback' | 'hours' | 'location'

function parseIntentFromGroq(raw: string): ValidIntent {
  const normalized = raw.toLowerCase().trim()
  if (normalized.includes('order_tracking')) return 'order_tracking'
  if (normalized.includes('product_info')) return 'product_info'
  if (normalized.includes('store_info')) return 'store_info'
  if (normalized.includes('promotions')) return 'promotions'
  if (normalized.includes('feedback')) return 'feedback'
  if (normalized.includes('hours')) return 'hours'
  if (normalized.includes('location')) return 'location'
  return 'general'
}

function buildGeminiContents(messages: ChatTurn[]) {
  return messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))
}

function extractGeminiTextChunk(rec: any): string {
  // If it's a non-streaming response
  if (rec.candidates?.[0]?.content?.parts?.[0]?.text) {
    return rec.candidates[0].content.parts[0].text
  }
  // If it's a streaming response
  const parts = rec.candidates?.[0]?.content?.parts
  if (!parts?.length) return ''
  return parts.map((p: any) => p.text ?? '').join('')
}

async function callGroq(systemPrompt: string, messages: ChatTurn[]) {
  const key = process.env.GROQ_API_KEY
  if (!key) throw new Error('GROQ_API_KEY missing')

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  })

  if (!res.ok) throw new Error(`Groq error: ${res.status}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

async function callOpenRouter(systemPrompt: string, messages: ChatTurn[]) {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) throw new Error('OPENROUTER_API_KEY missing')

  const res = await fetch('https://openrouter.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.2-3b-instruct:free',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  })

  if (!res.ok) throw new Error(`OpenRouter error: ${res.status}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

async function classifyIntent(userMessage: string): Promise<ValidIntent> {
  try {
    const key = process.env.GROQ_API_KEY
    if (!key) return 'general'

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: buildRouterPrompt(userMessage) }],
        max_tokens: 10,
        temperature: 0,
      }),
    })

    if (!res.ok) return 'general'

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }
    const raw = data.choices?.[0]?.message?.content ?? ''
    return parseIntentFromGroq(raw)
  } catch {
    return 'general'
  }
}

export async function POST(req: NextRequest) {
  let body: { storeId?: unknown; messages?: unknown; stream?: boolean }
  try {
    body = (await req.json())
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 })
  }

  const storeIdRaw = body.storeId
  const messagesRaw = body.messages

  if (!storeIdRaw || !messagesRaw || !Array.isArray(messagesRaw)) {
    return new Response(JSON.stringify({ error: 'Missing storeId or messages' }), { status: 400 })
  }

  const storeId = Number(storeIdRaw)
  const messages = messagesRaw as ChatTurn[]
  const streamMode = body.stream !== false

  const lastUser = [...messages].reverse().find((m) => m.role === 'user')
  const lastUserMessage = lastUser?.content ?? ''

  // ── Step 0: Darija RAG ────────────────────────────────────────────────────
  const darijaResults = await lookupDarija(lastUserMessage)
  const darijaContext = formatDarijaContext(darijaResults)

  const ctx = await getStoreContext(storeId)
  const intent = await classifyIntent(lastUserMessage)
  const systemPrompt = getAgentPrompt(intent, ctx) + darijaContext

  // ── Step 1: Try Groq (Primary) ───────────────────────────────────────────
  try {
    console.log('[AI Agent] Provider: Groq')
    const text = await callGroq(systemPrompt, messages)
    return new Response(
      streamMode ? `data: ${JSON.stringify({ text })}\n\ndata: [DONE]\n\n` : JSON.stringify({ text }),
      { headers: { 'Content-Type': streamMode ? 'text/event-stream' : 'application/json' } }
    )
  } catch (e: any) {
    console.error('[AI Agent] Groq failed:', e.message)
  }

  // ── Step 2: Try Gemini (Secondary) ───────────────────────────────────────
  try {
    const geminiKey = process.env.GEMINI_API_KEY
    if (geminiKey) {
      console.log('[AI Agent] Provider: Gemini')
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: buildGeminiContents(messages),
          generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const text = extractGeminiTextChunk(data)
        return new Response(
          streamMode ? `data: ${JSON.stringify({ text })}\n\ndata: [DONE]\n\n` : JSON.stringify({ text }),
          { headers: { 'Content-Type': streamMode ? 'text/event-stream' : 'application/json' } }
        )
      }
      console.error('[AI Agent] Gemini failed status:', res.status)
    }
  } catch (e: any) {
    console.error('[AI Agent] Gemini failed error:', e.message)
  }

  // ── Step 3: Try OpenRouter (Final Fallback) ──────────────────────────────
  try {
    console.log('[AI Agent] Provider: OpenRouter')
    const text = await callOpenRouter(systemPrompt, messages)
    return new Response(
      streamMode ? `data: ${JSON.stringify({ text })}\n\ndata: [DONE]\n\n` : JSON.stringify({ text }),
      { headers: { 'Content-Type': streamMode ? 'text/event-stream' : 'application/json' } }
    )
  } catch (e: any) {
    console.error('[AI Agent] OpenRouter failed:', e.message)
    return new Response(JSON.stringify({ error: 'All AI providers failed' }), { status: 502 })
  }
}
