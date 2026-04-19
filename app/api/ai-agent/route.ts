export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'

import { getStoreContext } from '@/lib/actions/ai-agent'
import { buildRouterPrompt, getAgentPrompt } from '@/lib/agents/prompts'

export const runtime = 'edge'

const VALID_INTENTS = [
  'analytics',
  'marketing',
  'product',
  'moderation',
  'general',
] as const

type ValidIntent = (typeof VALID_INTENTS)[number]

function parseIntentFromGroq(content: string): ValidIntent {
  const trimmed = content.trim().toLowerCase()
  const firstWord = trimmed.split(/\s+/)[0]?.replace(/[^a-z]/g, '') ?? ''
  if (VALID_INTENTS.includes(firstWord as ValidIntent)) {
    return firstWord as ValidIntent
  }
  for (const intent of VALID_INTENTS) {
    if (trimmed.includes(intent)) return intent
  }
  return 'general'
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

type ChatTurn = { role: string; content: string }

function buildGeminiContents(history: ChatTurn[]) {
  return history.map((m) => {
    if (m.role === 'assistant') {
      return { role: 'model', parts: [{ text: m.content }] }
    }
    return { role: 'user', parts: [{ text: m.content }] }
  })
}

function extractGeminiTextChunk(parsed: unknown): string {
  if (!parsed || typeof parsed !== 'object') return ''
  const rec = parsed as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> }
    }>
  }
  const parts = rec.candidates?.[0]?.content?.parts
  if (!parts?.length) return ''
  return parts.map((p) => p.text ?? '').join('')
}

export async function POST(req: NextRequest) {
  let body: { storeId?: unknown; messages?: unknown }
  try {
    body = (await req.json()) as { storeId?: unknown; messages?: unknown }
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const storeIdRaw = body.storeId
  const messagesRaw = body.messages

  console.log(
    '[AI Agent] storeId:',
    storeIdRaw,
    'messages:',
    Array.isArray(messagesRaw) ? messagesRaw.length : messagesRaw,
  )

  if (!storeIdRaw) {
    return new Response(JSON.stringify({ error: 'Missing storeId' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!messagesRaw || !Array.isArray(messagesRaw) || messagesRaw.length === 0) {
    return new Response(JSON.stringify({ error: 'messages must not be empty' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const storeId = Number(storeIdRaw)
  if (!Number.isFinite(storeId) || storeId <= 0) {
    return new Response(JSON.stringify({ error: 'Invalid storeId' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const messages = messagesRaw as ChatTurn[]

  const lastUser = [...messages].reverse().find((m) => m.role === 'user')
  const lastUserMessage = lastUser?.content ?? ''

  const ctx = await getStoreContext(storeId)

  const intent = await classifyIntent(lastUserMessage)
  const systemPrompt = getAgentPrompt(intent, ctx)

  const geminiKey = process.env.GEMINI_API_KEY
  if (!geminiKey) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${process.env.GEMINI_API_KEY}`

  const geminiBody = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: buildGeminiContents(messages),
    generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
  }

  let geminiRes: Response | undefined = undefined
  let retryCount = 0

  while (retryCount <= 2) {
    try {
      geminiRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiBody),
      })

      if (geminiRes.status === 429) {
        if (retryCount < 2) {
          retryCount++
          await new Promise((resolve) => setTimeout(resolve, 2000))
          continue
        }
        return new Response(
          'The AI service is busy. Please wait a few seconds and try again.',
          { status: 429 }
        )
      }

      // Not a 429, or succeeded, so break out of the loop
      break
    } catch (e) {
      if (retryCount < 2) {
        retryCount++
        await new Promise((resolve) => setTimeout(resolve, 2000))
        continue
      }
      const msg = e instanceof Error ? e.message : 'Gemini request failed'
      return new Response(JSON.stringify({ error: msg }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  // Typescript safety since we broke out
  if (!geminiRes) {
    return new Response(JSON.stringify({ error: 'Failed to fetch Gemini' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!geminiRes.ok) {
    const errText = await geminiRes.text().catch(() => '')
    console.error('[Gemini Error]', geminiRes.status, errText)
    return new Response(
      JSON.stringify({
        error: `Gemini error (${geminiRes.status})`,
        detail: errText.slice(0, 500),
      }),
      { status: 502, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const reader = geminiRes.body?.getReader()
  if (!reader) {
    return new Response(JSON.stringify({ error: 'Empty Gemini response body' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  const stream = new ReadableStream({
    async start(controller) {
      let buffer = ''
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''
          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed.startsWith('data:')) continue
            const payload = trimmed.startsWith('data: ')
              ? trimmed.slice(6).trim()
              : trimmed.slice(5).trim()
            if (payload === '[DONE]') {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'))
              continue
            }
            try {
              const parsed: unknown = JSON.parse(payload)
              const text = extractGeminiTextChunk(parsed)
              if (text) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ text })}\n\n`),
                )
              }
            } catch {
              // skip malformed chunk
            }
          }
        }
        if (buffer.trim()) {
          const trimmed = buffer.trim()
          if (trimmed.startsWith('data:')) {
            const payload = trimmed.startsWith('data: ')
              ? trimmed.slice(6).trim()
              : trimmed.slice(5).trim()
            try {
              const parsed: unknown = JSON.parse(payload)
              const text = extractGeminiTextChunk(parsed)
              if (text) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ text })}\n\n`),
                )
              }
            } catch {
              // ignore trailing garbage
            }
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Stream error'
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ text: `\n\n[Erreur: ${msg}]` })}\n\n`),
        )
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
