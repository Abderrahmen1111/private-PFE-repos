'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Paperclip, Link, Mic, MicOff, Send, Info, X, RotateCcw } from 'lucide-react';

declare const SpeechRecognition: any;
type SpeechRecognitionEvent = any;
type SpeechRecognitionErrorEvent = any;

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  role: 'user' | 'assistant';
  content: string;
  attachment?: { name: string; type: string; url?: string };
}

// ─── Markdown renderer ────────────────────────────────────────────────────────
function MessageContent({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**'))
          return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
        if (part.startsWith('`') && part.endsWith('`'))
          return <code key={i} className="px-1.5 py-0.5 bg-zinc-700 text-emerald-300 rounded text-[11px] font-mono">{part.slice(1, -1)}</code>;
        return part.split('\n').map((line, j, arr) => (
          <React.Fragment key={`${i}-${j}`}>{line}{j < arr.length - 1 && <br />}</React.Fragment>
        ));
      })}
    </>
  );
}

// ─── Typing dots ──────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map(i => (
        <div key={i} className="w-1.5 h-1.5 bg-zinc-500 rounded-full"
          style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const FloatingAiAssistant = () => {
  const [isChatOpen, setIsChatOpen]   = useState(false);
  const [message, setMessage]         = useState('');
  const [charCount, setCharCount]     = useState(0);
  const [messages, setMessages]       = useState<Message[]>([]);
  const [isStreaming, setIsStreaming]  = useState(false);
  const [error, setError]             = useState<string | null>(null);

  // ── Upload state ──
  const [attachment, setAttachment]   = useState<{ name: string; type: string; content: string } | null>(null);
  const fileInputRef                  = useRef<HTMLInputElement>(null);

  // ── Link state ──
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkValue, setLinkValue]         = useState('');

  // ── Voice state ──
  const [isRecording, setIsRecording]     = useState(false);
  const [voiceError, setVoiceError]       = useState<string | null>(null);
  const recognitionRef                    = useRef<any | null>(null);
  const baseTextRef                       = useRef<string>(''); // text in textarea before voice started

  const maxChars      = 2000;
  const chatRef       = useRef<HTMLDivElement>(null);
  const buttonRef     = useRef<HTMLButtonElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef   = useRef<HTMLTextAreaElement>(null);
  const linkInputRef  = useRef<HTMLInputElement>(null);
  const abortRef      = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  useEffect(() => {
    if (isChatOpen) setTimeout(() => textareaRef.current?.focus(), 100);
  }, [isChatOpen]);

  useEffect(() => {
    if (showLinkInput) setTimeout(() => linkInputRef.current?.focus(), 50);
  }, [showLinkInput]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!chatRef.current?.contains(target) && !buttonRef.current?.contains(target))
        setIsChatOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Cleanup voice on unmount ──
  useEffect(() => {
    return () => { recognitionRef.current?.stop(); };
  }, []);

  // ════════════════════════════════════════
  // 📎 FILE UPLOAD
  // ════════════════════════════════════════
  const handleFileClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Max size is 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      setAttachment({ name: file.name, type: file.type, content });
      // Append filename to message as context
      setMessage(prev => prev ? `${prev}\n\n[Fichier joint: ${file.name}]` : `[Fichier joint: ${file.name}]`);
      setCharCount(prev => prev + file.name.length + 17);
    };

    if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }

    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  // ════════════════════════════════════════
  // 🔗 LINK ATTACH
  // ════════════════════════════════════════
  const handleLinkToggle = () => {
    setShowLinkInput(prev => !prev);
    setLinkValue('');
  };

  const handleLinkConfirm = () => {
    if (!linkValue.trim()) { setShowLinkInput(false); return; }
    let url = linkValue.trim();
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    const snippet = `[Lien: ${url}]`;
    setMessage(prev => prev ? `${prev}\n${snippet}` : snippet);
    setCharCount(prev => prev + snippet.length);
    setShowLinkInput(false);
    setLinkValue('');
    textareaRef.current?.focus();
  };

  const handleLinkKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleLinkConfirm();
    if (e.key === 'Escape') { setShowLinkInput(false); setLinkValue(''); }
  };

  // ════════════════════════════════════════
  // 🎤 VOICE INPUT  (Web Speech API)
  // ════════════════════════════════════════
  const handleVoiceToggle = useCallback(() => {
    // Stop if already recording
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    // Browser support check
    const SR = (window as unknown as Record<string, unknown>).SpeechRecognition as typeof SpeechRecognition | undefined
            || (window as unknown as Record<string, unknown>).webkitSpeechRecognition as typeof SpeechRecognition | undefined;

    if (!SR) {
      setVoiceError('Voice input not supported. Please use Chrome or Edge.');
      setTimeout(() => setVoiceError(null), 4000);
      return;
    }

    // Snapshot text already in the textarea so we can append to it
    baseTextRef.current = message.trimEnd();

    const recognition = new SR();
    recognition.lang = 'fr-FR';
    recognition.interimResults = true;
    recognition.continuous = true;   // keep listening until user stops manually
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
      setVoiceError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += transcript;
        else interim += transcript;
      }

      // Build new message: base + final so far + interim preview
      const base = baseTextRef.current;
      const combined = [base, final, interim].filter(Boolean).join(' ').trim();
      setMessage(combined);
      setCharCount(combined.length);

      // Once we have a final chunk, advance the base so next chunk appends
      if (final) {
        baseTextRef.current = [baseTextRef.current, final].filter(Boolean).join(' ').trim();
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      // Clean up any trailing space
      setMessage(prev => prev.trim());
      textareaRef.current?.focus();
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setIsRecording(false);
      if (event.error === 'aborted' || event.error === 'no-speech') return;
      const errorMessages: Record<string, string> = {
        'not-allowed': 'Microphone access denied. Allow it in your browser settings.',
        'network':     'Network error during voice recognition. Check your connection.',
        'audio-capture': 'No microphone found. Please connect one and try again.',
      };
      setVoiceError(errorMessages[event.error] ?? `Voice error: ${event.error}`);
      setTimeout(() => setVoiceError(null), 5000);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (err) {
      setVoiceError('Could not start microphone. Is another app using it?');
      setTimeout(() => setVoiceError(null), 4000);
    }
  }, [isRecording, message]);

  // ════════════════════════════════════════
  // 📨 SEND
  // ════════════════════════════════════════
  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed || isStreaming) return;

    setError(null);
    const userMessage: Message = {
      role: 'user',
      content: trimmed,
      ...(attachment ? { attachment: { name: attachment.name, type: attachment.type } } : {}),
    };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setMessage('');
    setCharCount(0);
    setAttachment(null);
    setIsStreaming(true);
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const controller = new AbortController();
      abortRef.current = controller;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || 'Something went wrong');
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') break;
          try {
            const { text } = JSON.parse(data);
            setMessages(prev => {
              const next = [...prev];
              const last = next[next.length - 1];
              if (last.role === 'assistant')
                next[next.length - 1] = { ...last, content: last.content + text };
              return next;
            });
          } catch { /* skip malformed */ }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(msg);
      setMessages(prev => {
        const next = [...prev];
        if (next[next.length - 1]?.content === '') next.pop();
        return next;
      });
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleStop = () => { abortRef.current?.abort(); setIsStreaming(false); };

  const handleReset = () => {
    abortRef.current?.abort();
    recognitionRef.current?.stop();
    setMessages([]); setMessage(''); setCharCount(0);
    setError(null); setIsStreaming(false); setAttachment(null);
    setShowLinkInput(false); setIsRecording(false);
  };

  const hasMessages = messages.length > 0;

  // ── Sync charCount when message changes via voice ──
  useEffect(() => { setCharCount(message.length); }, [message]);

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*,.pdf,.txt,.md,.csv,.json,.js,.ts,.tsx,.jsx,.py,.html,.css"
        onChange={handleFileChange}
      />

      <style>{`
        @keyframes popIn {
          0%   { opacity: 0; transform: scale(0.88) translateY(20px); }
          100% { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0);    opacity: 0.4; }
          40%           { transform: translateY(-5px); opacity: 1;   }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(239,68,68,0.5); }
          70%  { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
          100% { box-shadow: 0 0 0 0 rgba(239,68,68,0);   }
        }
        .msg-in { animation: fadeSlideIn 0.25s ease forwards; }
        .recording-btn { animation: pulse-ring 1.5s ease-out infinite; }
        .chat-scroll::-webkit-scrollbar { width: 4px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>

      <div className="fixed bottom-6 right-6 z-50">

        {/* ── FAB Button ── */}
        <button
          ref={buttonRef}
          onClick={() => setIsChatOpen(prev => !prev)}
          className="relative w-14 h-14 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
        >
          <div className="absolute inset-0 rounded-full bg-[#ffffff]" />
          <div className="absolute inset-0 rounded-full border border-white/10" />
          <div className="relative z-10">
            {isChatOpen
              ? <X className="w-6 h-6 text-black" />
              : <img src="/ro2ya_logo11.png" alt="Ro2ya" className="w-8 h-8 rounded-full object-contain" />
            }
          </div>
          {!isChatOpen && hasMessages && (
            <span className="absolute top-0.5 right-0.5 w-3 h-3 bg-violet-500 rounded-full border-2 border-zinc-900" />
          )}
        </button>

        {/* ── Chat Panel ── */}
        {isChatOpen && (
          <div
            ref={chatRef}
            className="absolute bottom-20 right-0 w-[420px] max-w-[calc(100vw-2rem)]"
            style={{ animation: 'popIn 0.3s cubic-bezier(0.175,0.885,0.32,1.275) forwards' }}
          >
            <div
              className="relative flex flex-col rounded-3xl bg-zinc-800 border border-zinc-700 shadow-2xl overflow-hidden"
              style={{ maxHeight: '72vh' }}
            >
              {/* ── Header ── */}
              <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-zinc-700/60 shrink-0">
                <div className="flex items-center gap-2.5">
                  <img src="/ro2ya_logo11.png" alt="Ro2ya" className="w-7 h-7 rounded-full object-contain" />
                  <div>
                    <p className="text-sm font-semibold text-white leading-tight">Ro2ya Assistant</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] text-zinc-500">
                        {isRecording ? 'Listening…' : isStreaming ? 'Typing…' : 'Online'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {hasMessages && (
                    <button onClick={handleReset} title="Clear conversation"
                      className="p-1.5 rounded-full hover:bg-zinc-700/60 text-zinc-500 hover:text-zinc-300 transition-colors">
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <span className="px-2 py-0.5 text-[10px] font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full">
                    Llama 3.1 · Groq
                  </span>
                  <button onClick={() => setIsChatOpen(false)}
                    className="p-1.5 rounded-full hover:bg-zinc-700/60 text-zinc-500 hover:text-zinc-300 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* ── Messages ── */}
              <div className="flex-1 overflow-y-auto chat-scroll px-4 py-3 space-y-3 min-h-0"
                style={{ maxHeight: hasMessages ? '340px' : '0px', transition: 'max-height 0.3s ease' }}>

                {!hasMessages && (
                  <div className="py-6 text-center space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 border border-violet-500/20 flex items-center justify-center">
                      <span className="text-xl">✨</span>
                    </div>
                    <p className="text-zinc-400 text-sm font-medium">How can I help you today?</p>
                    <p className="text-zinc-600 text-xs">Ask me anything about products, sellers, or the Ro2ya marketplace.</p>
                    <div className="flex flex-wrap gap-1.5 justify-center mt-3">
                      {['Trouver un PC étudiant', 'Meilleurs vendeurs près de moi', 'Comment comparer des produits ?'].map(prompt => (
                        <button key={prompt}
                          onClick={() => { setMessage(prompt); textareaRef.current?.focus(); }}
                          className="text-[11px] px-2.5 py-1 rounded-full bg-zinc-700 border border-zinc-600 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors">
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div key={i} className={`msg-in flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      {msg.role === 'assistant' && (
                        <div className="w-6 h-6 rounded-full bg-zinc-700 border border-zinc-600 flex items-center justify-center shrink-0 mt-1">
                          <span className="text-[10px]">✨</span>
                        </div>
                      )}
                      <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-violet-600 text-white rounded-br-sm'
                          : 'bg-zinc-700 text-zinc-200 rounded-bl-sm'
                      }`}>
                        {msg.content === '' && msg.role === 'assistant'
                          ? <TypingDots />
                          : <MessageContent text={msg.content} />
                        }
                      </div>
                    </div>
                    {/* Attachment badge */}
                    {msg.attachment && (
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-700/60 border border-zinc-600/50 text-[11px] text-zinc-400 ${msg.role === 'user' ? 'mr-2' : 'ml-8'}`}>
                        <Paperclip className="w-3 h-3" />
                        {msg.attachment.name}
                      </div>
                    )}
                  </div>
                ))}

                {(error || voiceError) && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                    <span className="shrink-0">⚠️</span>
                    {error || voiceError}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* ── Link input bar (slides in) ── */}
              {showLinkInput && (
                <div className="px-4 py-2 border-t border-zinc-700/60 bg-zinc-800/80 flex items-center gap-2">
                  <Link className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <input
                    ref={linkInputRef}
                    type="url"
                    value={linkValue}
                    onChange={e => setLinkValue(e.target.value)}
                    onKeyDown={handleLinkKeyDown}
                    placeholder="https://example.com"
                    className="flex-1 bg-transparent text-sm text-zinc-200 placeholder-zinc-600 outline-none"
                  />
                  <button onClick={handleLinkConfirm}
                    className="text-[11px] font-medium text-violet-400 hover:text-violet-300 transition-colors px-2 py-1 rounded-lg hover:bg-violet-500/10">
                    Add
                  </button>
                  <button onClick={() => { setShowLinkInput(false); setLinkValue(''); }}
                    className="text-zinc-600 hover:text-zinc-400 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* ── Attachment preview ── */}
              {attachment && (
                <div className="px-4 py-2 border-t border-zinc-700/60 flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-700/60 border border-zinc-600/50">
                    <Paperclip className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span className="text-[12px] text-zinc-300 truncate">{attachment.name}</span>
                  </div>
                  <button onClick={() => {
                    setAttachment(null);
                    setMessage(prev => prev.replace(/\n?\[Fichier joint: .*?\]/, '').trim());
                  }} className="text-zinc-600 hover:text-red-400 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* ── Input area ── */}
              <div className="px-4 pb-4 pt-2 shrink-0">
                <div className="rounded-2xl bg-zinc-700/60 border border-zinc-600/40 overflow-hidden">
                  <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={e => { const v = e.target.value; if (v.length <= maxChars) { setMessage(v); setCharCount(v.length); } }}
                    onKeyDown={handleKeyDown}
                    rows={3}
                    disabled={isStreaming}
                    className="w-full px-4 pt-3 pb-1 bg-transparent border-none outline-none resize-none text-sm leading-relaxed text-zinc-100 placeholder-zinc-600 disabled:opacity-50"
                    placeholder={
                      isRecording ? '🎤 Listening… speak now'
                      : isStreaming ? 'Waiting for response…'
                      : 'Ask anything about Ro2ya…'
                    }
                    style={{ scrollbarWidth: 'none' }}
                  />

                  {/* Toolbar */}
                  <div className="flex items-center justify-between px-3 pb-3">
                    <div className="flex items-center gap-1.5">

                      {/* 📎 Upload */}
                      <button
                        onClick={handleFileClick}
                        title="Attach file (image, PDF, text…)"
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-600/50 transition-all"
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                      </button>

                      {/* 🔗 Link */}
                      <button
                        onClick={handleLinkToggle}
                        title="Attach a link"
                        className={`p-1.5 rounded-lg transition-all ${
                          showLinkInput
                            ? 'text-violet-400 bg-violet-500/10'
                            : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-600/50'
                        }`}
                      >
                        <Link className="w-3.5 h-3.5" />
                      </button>

                      {/* 🎤 Voice */}
                      <button
                        onClick={handleVoiceToggle}
                        title={isRecording ? 'Stop recording' : 'Voice input'}
                        className={`p-1.5 rounded-lg transition-all ${
                          isRecording
                            ? 'text-red-400 bg-red-500/10 recording-btn'
                            : 'text-zinc-500 hover:text-red-400 hover:bg-zinc-600/50'
                        }`}
                      >
                        {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                      </button>

                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] tabular-nums ${charCount > maxChars * 0.9 ? 'text-amber-400' : 'text-zinc-600'}`}>
                        {charCount}<span className="text-zinc-700">/{maxChars}</span>
                      </span>

                      {isStreaming ? (
                        <button onClick={handleStop}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-600 hover:bg-zinc-500 rounded-xl text-zinc-300 text-xs font-medium transition-colors">
                          <span className="w-2 h-2 bg-zinc-300 rounded-sm" />
                          Stop
                        </button>
                      ) : (
                        <button onClick={handleSend} disabled={!message.trim()}
                          className="group p-2.5 bg-gradient-to-r from-violet-600 to-violet-500 rounded-xl text-white shadow-lg hover:from-violet-500 hover:to-violet-400 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100">
                          <Send className="w-3.5 h-3.5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hint */}
                <div className="flex items-center justify-between mt-2 text-[10px] text-zinc-600">
                  <div className="flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    <kbd className="px-1 py-0.5 bg-zinc-700 border border-zinc-600 rounded font-mono text-zinc-500">Shift+Enter</kbd>
                    <span>for new line</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    All systems operational
                  </div>
                </div>
              </div>

              {/* Inner glow */}
              <div className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.04), transparent, rgba(236,72,153,0.03))' }} />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export { FloatingAiAssistant };