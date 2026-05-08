'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Loader2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getTicketMessages, sendTicketMessage } from '@/lib/actions/support';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { blockUser, getFriendshipStatus } from '@/lib/actions/friendships';
import { ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

interface SupportChatDrawerProps {
  ticketId: string;
  isOpen: boolean;
  onClose: () => void;
  businessName: string;
}

type Message = {
  id: string;
  sender_id: string;
  sender_type: 'customer' | 'support';
  content: string;
  created_at: string;
};

export default function SupportChatDrawer({ ticketId, isOpen, onClose, businessName }: SupportChatDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id || null);
    });
  }, [supabase]);

  // Fetch ticket details to get the customer_id
  useEffect(() => {
    if (isOpen && ticketId) {
      supabase
        .from('support_tickets')
        .select('customer_id')
        .eq('id', ticketId)
        .single()
        .then(({ data }) => {
          if (data?.customer_id) {
            setPartnerId(data.customer_id);
            // Check blocking status
            getFriendshipStatus(data.customer_id).then(res => {
              setIsBlocked(res?.status === 'BLOCKED');
            });
          }
        });
    }
  }, [isOpen, ticketId, supabase]);

  const handleBlock = async () => {
    if (!partnerId) return;
    if (window.confirm("Bloquer cet utilisateur ?")) {
      const { error } = await blockUser(partnerId);
      if (!error) {
        toast.success("Utilisateur bloqué");
        setIsBlocked(true);
      }
    }
  };

  useEffect(() => {
    if (isOpen && ticketId) {
      loadMessages(ticketId);
      
      const channel = supabase
        .channel(`ticket-${ticketId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'support_messages',
            filter: `ticket_id=eq.${ticketId}`
          },
          (payload) => {
            const newMessage = payload.new as Message;
            setMessages(prev => {
              if (prev.some(m => m.id === newMessage.id)) return prev;
              return [...prev, newMessage];
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isOpen, ticketId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function loadMessages(tid: string) {
    setIsLoading(true);
    try {
      const data = await getTicketMessages(tid);
      setMessages(data || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSendMessage = async () => {
    if (!messageText.trim() || isSending) return;

    setIsSending(true);
    const content = messageText.trim();
    setMessageText('');

    const result = await sendTicketMessage(ticketId, content, 'customer');
    if (!result.success) {
      console.error('Failed to send message:', result.error);
      setMessageText(content); // restore if failed
    }
    setIsSending(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{businessName}</h3>
                  <p className="text-xs text-slate-500">Messagerie directe</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {partnerId && (
                  <button
                    onClick={handleBlock}
                    className={cn(
                      "p-2 rounded-full transition-colors",
                      isBlocked ? "text-red-600 bg-red-50" : "text-slate-400 hover:bg-slate-100 hover:text-red-500"
                    )}
                    title={isBlocked ? "Déjà bloqué" : "Bloquer l'utilisateur"}
                    disabled={isBlocked}
                  >
                    <ShieldAlert className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50"
            >
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-red-500" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <MessageCircle className="w-8 h-8 text-slate-300" />
                  </div>
                  <h4 className="font-bold text-slate-900 mb-2">Pas encore de messages</h4>
                  <p className="text-sm text-slate-500">Envoyez votre premier message pour démarrer la discussion avec l'établissement.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender_id === currentUserId || msg.sender_type === 'customer';
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex flex-col max-w-[80%]",
                        isMe ? "ml-auto items-end" : "mr-auto items-start"
                      )}
                    >
                      <div
                        className={cn(
                          "px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm",
                          isMe 
                            ? "bg-red-500 text-white rounded-tr-none" 
                            : "bg-white text-slate-900 border border-slate-100 rounded-tl-none"
                        )}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t bg-white">
              <div className="flex items-center gap-2">
                <Input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Écrivez votre message..."
                  className="rounded-full bg-slate-50 border-slate-100 focus:ring-red-500"
                  disabled={isBlocked}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || isSending || isBlocked}
                  className="rounded-full w-10 h-10 p-0 bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 shrink-0"
                >
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
