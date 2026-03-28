'use client'

import { useCallback, useRef, useState } from 'react'

import type { AgentMessage } from '@/types/ai-agent'

type HistoryTurn = { role: 'user' | 'assistant'; content: string }

function randomId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

function processSseLine(
  line: string,
  onText: (t: string) => void,
): 'done' | 'continue' {
  const trimmed = line.trim()
  if (!trimmed.startsWith('data:')) return 'continue'
  const payload = trimmed.startsWith('data: ') ? trimmed.slice(6).trim() : trimmed.slice(5).trim()
  if (payload === '[DONE]') return 'done'
  try {
    const parsed = JSON.parse(payload) as { text?: string }
    if (typeof parsed.text === 'string') onText(parsed.text)
  } catch {
    // skip malformed chunk
  }
  return 'continue'
}

export function useAIAgent(storeId: string) {
  const [messages, setMessages] = useState<AgentMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const abortRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(
    async (userText: string) => {
      const trimmed = userText.trim()
      if (!trimmed) return

      const userMessage: AgentMessage = {
        id: randomId(),
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
      }

      const historySnapshot: HistoryTurn[] = [
        ...messages,
        userMessage,
      ].map((m) => ({
        role: m.role,
        content: m.content,
      }))

      setMessages((prev) => [...prev, userMessage])

      setIsLoading(true)
      setStreamingText('')

      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      try {
        const res = await fetch('/api/ai-agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            storeId: Number(storeId),
            messages: historySnapshot,
          }),
        })

        if (res.status === 429) {
          setMessages((prev) => [
            ...prev,
            {
              id: randomId(),
              role: 'assistant',
              content: 'The AI is busy right now. Please wait a few seconds and try again.',
              timestamp: new Date(),
            },
          ])
          setIsLoading(false)
          return
        }

        if (!res.ok) {
          const errJson = await res.json().catch(() => ({ error: res.statusText }))
          const errMsg =
            typeof errJson?.error === 'string'
              ? errJson.error
              : 'La requête a échoué. Réessayez.'
          setMessages((prev) => [
            ...prev,
            {
              id: randomId(),
              role: 'assistant',
              content: `❌ ${errMsg}`,
              timestamp: new Date(),
            },
          ])
          return
        }

        const reader = res.body?.getReader()
        if (!reader) {
          setMessages((prev) => [
            ...prev,
            {
              id: randomId(),
              role: 'assistant',
              content: '❌ Réponse vide du serveur.',
              timestamp: new Date(),
            },
          ])
          return
        }

        const decoder = new TextDecoder()
        let buffer = ''
        let fullText = ''

        const appendText = (t: string) => {
          fullText += t
          setStreamingText(fullText)
        }

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''
          for (const line of lines) {
            const result = processSseLine(line, appendText)
            if (result === 'done') {
              buffer = ''
              break
            }
          }
        }

        if (buffer.trim()) {
          processSseLine(buffer, appendText)
        }

        setMessages((prev) => [
          ...prev,
          {
            id: randomId(),
            role: 'assistant',
            content: fullText || '…',
            timestamp: new Date(),
          },
        ])
        setStreamingText('')
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') {
          return
        }
        const msg = e instanceof Error ? e.message : 'Erreur inconnue'
        setMessages((prev) => [
          ...prev,
          {
            id: randomId(),
            role: 'assistant',
            content: `❌ ${msg}`,
            timestamp: new Date(),
          },
        ])
      } finally {
        setIsLoading(false)
        setStreamingText('')
        abortRef.current = null
      }
    },
    [storeId],
  )

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort()
    setIsLoading(false)
    setStreamingText('')
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
    setStreamingText('')
  }, [])

  return {
    messages,
    isLoading,
    streamingText,
    sendMessage,
    stopGeneration,
    clearMessages,
  }
}
