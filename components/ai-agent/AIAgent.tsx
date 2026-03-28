'use client'

import './AIAgent.css'

import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useAIAgent } from '@/components/ai-agent/useAIAgent'

function BotIcon({ size = 22 }: { size?: number } = {}) {
  return (
    <img
      src="/ro2ya_logo11.png"
      alt="Ro2ya Copilot"
      style={{ width: `${size}px`, height: `${size}px`, objectFit: 'contain' }}
      aria-hidden="true"
    />
  )
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 11.5l18-7-7 18-2-7-7-4z"
        fill="currentColor"
      />
    </svg>
  )
}

function StopIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="6" y="6" width="12" height="12" rx="1" fill="currentColor" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6v9m4-9v9M6 9h12l-1 11H7L6 9z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function renderMarkdownToHtml(raw: string): string {
  const safe = escapeHtml(raw)
  const blocks = safe.split(/\n\n+/)
  const htmlParts: string[] = []

  for (const block of blocks) {
    const lines = block.split('\n')
    const outLines: string[] = []
    for (const line of lines) {
      const t = line.trim()
      if (t.startsWith('### ')) {
        outLines.push(`<p class="aag-h3">${applyInline(t.slice(4))}</p>`)
      } else if (t.startsWith('## ')) {
        outLines.push(`<p class="aag-h2">${applyInline(t.slice(3))}</p>`)
      } else if (t.startsWith('- ')) {
        outLines.push(`<span class="aag-li">${applyInline(t.slice(2))}</span>`)
      } else if (t.length > 0) {
        outLines.push(`<p>${applyInline(t)}</p>`)
      }
    }
    htmlParts.push(outLines.join(''))
  }

  return htmlParts.join('')
}

function applyInline(text: string): string {
  let s = text
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  s = s.replace(/\*(.+?)\*/g, '<em>$1</em>')
  return s
}

function TypingDots() {
  return (
    <div className="aag-bubble ai aag-typing" aria-hidden>
      <span />
      <span />
      <span />
    </div>
  )
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

const QUICK_ACTIONS: { label: string; prompt: string }[] = [
  {
    label: 'Sales this week',
    prompt:
      'Analyze my sales performance this week. Trends and next steps?',
  },
  {
    label: 'Best item',
    prompt:
      'Which product or service is performing best right now and why?',
  },
  {
    label: 'Low stock alert',
    prompt:
      'Which products are running low on stock? What should I reorder?',
  },
  {
    label: 'Create promotion',
    prompt:
      'Suggest a weekend promotion campaign with discount, products, and marketing copy.',
  },
  {
    label: 'Fix low conversion',
    prompt:
      'Which items have many views but few sales? Why and how do I fix it?',
  },
  {
    label: 'Write post',
    prompt:
      'Write an Instagram caption and WhatsApp message for my best-selling item.',
  },
]

export default function AIAgent({ storeId }: { storeId: string }) {
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [quickOpen, setQuickOpen] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const { messages, isLoading, streamingText, sendMessage, stopGeneration, clearMessages } =
    useAIAgent(storeId)

  useEffect(() => {
    setMounted(true)
  }, [])

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingText, isLoading, scrollToBottom])

  const handleSend = async () => {
    const t = input.trim()
    if (!t || isLoading) return
    setInput('')
    setQuickOpen(false)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    await sendMessage(t)
  }

  const handleQuick = async (prompt: string) => {
    if (isLoading) return
    setQuickOpen(false)
    await sendMessage(prompt)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  const onInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const ta = e.target
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 90)}px`
  }

  const assistantCount = messages.filter((m) => m.role === 'assistant').length

  if (!mounted) return null

  return (
    <div className="aag-wrap">
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="panel"
            className="aag-panel"
            initial={{ opacity: 0, scale: 0.88, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 12 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          >
            <div className="aag-header">
              <div className="aag-avatar" aria-hidden>
                <BotIcon />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  Ro2ya Copilot
                  <span className="aag-pulse" />
                </div>
                <div className="text-[11px] text-white/50 truncate">
                  Assistant vendeur · données boutique
                </div>
              </div>
              <button
                type="button"
                className="aag-trash"
                onClick={() => clearMessages()}
                aria-label="Effacer la conversation"
              >
                <TrashIcon />
              </button>
            </div>

            <div className="aag-messages" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="aag-qa-grid">
                  {QUICK_ACTIONS.map((q) => (
                    <button
                      key={q.label}
                      type="button"
                      className="aag-qa-btn"
                      onClick={() => void handleQuick(q.prompt)}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              ) : null}

              {messages.map((m) => (
                <div key={m.id}>
                  {m.role === 'user' ? (
                    <div className="aag-bubble user">{m.content}</div>
                  ) : (
                    <div
                      className="aag-bubble ai"
                      dangerouslySetInnerHTML={{
                        __html: renderMarkdownToHtml(m.content),
                      }}
                    />
                  )}
                  <div className="aag-meta">{formatTime(m.timestamp)}</div>
                </div>
              ))}

              {isLoading && !streamingText ? <TypingDots /> : null}
              {streamingText ? (
                <div className="aag-bubble ai streaming">
                  <span
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdownToHtml(streamingText),
                    }}
                  />
                </div>
              ) : null}
            </div>

            {messages.length > 0 ? (
              <div className="aag-toggle-row">
                <button
                  type="button"
                  className="aag-toggle-btn"
                  onClick={() => setQuickOpen((v) => !v)}
                >
                  {quickOpen ? 'Masquer les idées' : 'Idées rapides'}
                </button>
              </div>
            ) : null}

            {messages.length > 0 && quickOpen ? (
              <div className="px-3 pb-1">
                <div className="aag-qa-grid">
                  {QUICK_ACTIONS.map((q) => (
                    <button
                      key={q.label}
                      type="button"
                      className="aag-qa-btn"
                      onClick={() => void handleQuick(q.prompt)}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="aag-footer">
              <div className="aag-input-row">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={input}
                  onChange={onInput}
                  onKeyDown={onKeyDown}
                  placeholder="Posez une question sur votre boutique…"
                  disabled={isLoading}
                />
                {isLoading ? (
                  <button
                    type="button"
                    className="aag-send-btn stop"
                    aria-label="Arrêter"
                    onClick={() => stopGeneration()}
                  >
                    <StopIcon />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="aag-send-btn"
                    aria-label="Envoyer"
                    disabled={!input.trim()}
                    onClick={() => void handleSend()}
                  >
                    <SendIcon />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.button
        type="button"
        className="aag-fab"
        aria-label={open ? 'Fermer le copilot' : 'Ouvrir le copilot'}
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
      >
        {open ? <CloseIcon /> : <BotIcon size={46} />}
        {!open && assistantCount > 0 ? (
          <span className="aag-fab-badge">{assistantCount > 99 ? '99+' : assistantCount}</span>
        ) : null}
      </motion.button>
    </div>
  )
}
