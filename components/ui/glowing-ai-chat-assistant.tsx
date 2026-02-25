'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Link, Mic, Send, Info, X } from 'lucide-react';

const FloatingAiAssistant = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [charCount, setCharCount] = useState(0);
  const maxChars = 2000;
  const chatRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    setCharCount(value.length);
  };

  const handleSend = () => {
    if (message.trim()) {
      console.log('Sending message:', message);
      setMessage('');
      setCharCount(0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Close chat when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedInsideChat = chatRef.current?.contains(target);
      const clickedButton = buttonRef.current?.contains(target);
      if (!clickedInsideChat && !clickedButton) {
        setIsChatOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Keyframe animations injected once via a plain <style> tag */}
      <style>{`
        @keyframes popIn {
          0%   { opacity: 0; transform: scale(0.8) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes aiPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(139,92,246,0.7), 0 0 40px rgba(124,58,237,0.5), 0 0 60px rgba(109,40,217,0.3); }
          50%       { box-shadow: 0 0 30px rgba(139,92,246,0.9), 0 0 55px rgba(124,58,237,0.7), 0 0 80px rgba(109,40,217,0.5); }
        }
      `}</style>

      <div className="fixed bottom-6 right-6 z-50">
        {/* Floating Glowing AI Button */}
        <button
          ref={buttonRef}
          className="relative w-14 h-14 rounded-full flex items-center justify-center  hover:bg-white transition-colors shadow-lg"
          onClick={() => setIsChatOpen((prev) => !prev)}
        >
          {/* 3D highlight */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent" />
          <div className="absolute inset-0 rounded-full border border-white/10" />

          {/* Icon */}
          <div className="relative z-10">
            {isChatOpen
              ? <X className="w-6 h-6 text-black" />
              : <img src="/ro2ya_logo11.png" alt="Ro2ya" className="w-8 h-8 rounded-full object-contain" />
            }
          </div>
        </button>

        {/* Chat Panel */}
        {isChatOpen && (
          <div
            ref={chatRef}
            className="absolute bottom-20 right-0 w-[420px] max-w-[calc(100vw-2rem)]"
            style={{ animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' }}
          >
            <div className="relative flex flex-col rounded-3xl bg-zinc-900/95 border border-zinc-700/60 shadow-2xl backdrop-blur-xl overflow-hidden">

              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-4 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-medium text-zinc-400">AI Assistant</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs font-medium bg-zinc-800 text-zinc-300 rounded-full">GPT-4</span>
                  <span className="px-2 py-1 text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 rounded-full">Pro</span>
                  <button
                    onClick={() => setIsChatOpen(false)}
                    className="p-1.5 rounded-full hover:bg-zinc-700/60 transition-colors"
                  >
                    <X className="w-4 h-4 text-zinc-400" />
                  </button>
                </div>
              </div>

              {/* Textarea */}
              <textarea
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                rows={4}
                className="w-full px-5 py-4 bg-transparent border-none outline-none resize-none text-sm leading-relaxed text-zinc-100 placeholder-zinc-600"
                placeholder="What would you like to explore today? Ask anything, share ideas, or request assistance..."
                style={{ scrollbarWidth: 'none' }}
              />

              {/* Toolbar */}
              <div className="px-4 pb-4">
                <div className="flex items-center justify-between">

                  {/* Left tools */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 p-1 bg-zinc-800/60 rounded-xl border border-zinc-700/40">
                      {[
                        { Icon: Paperclip, label: 'Upload files', color: 'hover:text-zinc-200' },
                        { Icon: Link, label: 'Web link', color: 'hover:text-red-400' },
                      ].map(({ Icon, label, color }) => (
                        <button
                          key={label}
                          title={label}
                          className={`group relative p-2 rounded-lg text-zinc-500 ${color} hover:bg-zinc-700/50 transition-all duration-200`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="absolute -top-9 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-900 text-zinc-200 text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-zinc-700/50 z-10">
                            {label}
                          </span>
                        </button>
                      ))}
                    </div>

                    <button
                      title="Voice input"
                      className="group relative p-2 border border-zinc-700/30 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800/60 hover:border-red-500/30 transition-all duration-200"
                    >
                      <Mic className="w-4 h-4" />
                      <span className="absolute -top-9 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-900 text-zinc-200 text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-zinc-700/50 z-10">
                        Voice input
                      </span>
                    </button>
                  </div>

                  {/* Right: counter + send */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-600">
                      {charCount}<span className="text-zinc-500">/{maxChars}</span>
                    </span>
                    <button
                      onClick={handleSend}
                      className="group p-3 bg-gradient-to-r from-red-600 to-red-500 rounded-xl text-white shadow-lg hover:from-red-500 hover:to-red-400 hover:scale-110 active:scale-95 transition-all duration-200"
                    >
                      <Send className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform duration-200" />
                    </button>
                  </div>
                </div>

                {/* Footer hint */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800/60 text-xs text-zinc-600 gap-4">
                  <div className="flex items-center gap-1.5">
                    <Info className="w-3 h-3 shrink-0" />
                    <span>
                      <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-400 font-mono text-[10px]">
                        Shift+Enter
                      </kbd>{' '}
                      for new line
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    <span>All systems operational</span>
                  </div>
                </div>
              </div>

              {/* Subtle inner glow */}
              <div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.04), transparent, rgba(147,51,234,0.04))' }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export { FloatingAiAssistant };