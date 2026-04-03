'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Send, Paperclip, Smile, Search, ArrowLeft, Loader2, User, Clock, Check, MoreHorizontal, Mail, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { getStoreTickets, SupportTicket, getTicketMessages, sendTicketMessage } from '@/lib/actions/support';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

type Message = {
  id: string;
  sender_id: string;
  sender_type: 'customer' | 'support';
  content: string;
  created_at: string;
};

function ChatContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const storeId = Number(params.id);
  const ticketIdFromUrl = searchParams.get('ticket');

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(ticketIdFromUrl);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();

  useEffect(() => {
    async function loadTickets() {
      if (storeId) {
        const data = await getStoreTickets(storeId);
        setTickets(data);
        if (!selectedTicketId && data.length > 0) {
          setSelectedTicketId(data[0].id);
        }
      }
    }
    loadTickets();
  }, [storeId]);

  useEffect(() => {
    if (selectedTicketId) {
      loadMessages(selectedTicketId);
      
      const channel = supabase
        .channel(`ticket-${selectedTicketId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'support_messages',
            filter: `ticket_id=eq.${selectedTicketId}`
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
  }, [selectedTicketId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function loadMessages(ticketId: string) {
    setIsLoading(true);
    try {
      const data = await getTicketMessages(ticketId);
      setMessages(data || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedTicketId) return;
    setIsSending(true);
    
    try {
      const result = await sendTicketMessage(selectedTicketId, messageText, 'support');
      if (result.success && result.data) {
        const msg = result.data as Message;
        if (!messages.some(m => m.id === msg.id)) {
           setMessages(prev => [...prev, msg]);
        }
        setMessageText('');
      }
    } catch (error) {
      console.error('Message send error:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Live Support <span className="text-primary italic">Ro2ya</span></h1>
          <p className="text-muted-foreground font-medium text-sm">Gestion des conversations clients en temps réel</p>
        </div>
        <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse ring-4 ring-green-500/20" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Connecté</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[720px] overflow-hidden">
        {/* Sidebar */}
        <Card className="flex flex-col border border-border/50 bg-card/40 backdrop-blur-xl shadow-2xl overflow-hidden rounded-[2rem]">
          <div className="p-6 border-b bg-muted/10">
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.push(`/dashboard/${storeId}/support/tickets`)} 
                className="mb-4 w-full justify-start hover:bg-primary/10 rounded-xl group transition-all"
            >
              <ArrowLeft className="w-4 h-4 mr-2 text-primary group-hover:-translate-x-1 transition-transform" /> 
              <span className="font-bold text-xs uppercase tracking-wider">Tous les tickets</span>
            </Button>
            <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Filtrer..." className="pl-9 h-9 rounded-full bg-background/50 border-none ring-1 ring-border/50 text-xs shadow-inner" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
            {tickets.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs font-black uppercase tracking-widest opacity-30 mt-20">
                <Mail className="w-12 h-12 mx-auto mb-4 opacity-10" />
                Désert...
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {tickets.map((ticket, index) => (
                  <motion.button
                    layout
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    key={ticket.id}
                    onClick={() => setSelectedTicketId(ticket.id)}
                    className={`w-full p-4 rounded-[1.5rem] text-left transition-all relative group flex flex-col gap-2 ${selectedTicketId === ticket.id 
                      ? 'bg-primary shadow-lg shadow-primary/20 text-primary-foreground' 
                      : 'hover:bg-muted/50 border border-transparent hover:border-border/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                       <span className={`text-[10px] font-black uppercase tracking-widest ${selectedTicketId === ticket.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                         #{ticket.id.slice(0,6)}
                       </span>
                       <Badge variant="outline" className={`text-[8px] font-black uppercase py-0 px-2 h-5 border-none rounded-full shadow-sm ${
                         ticket.status === 'open' 
                            ? 'bg-green-500 text-white' 
                            : 'bg-slate-800 text-slate-400'
                       }`}>
                         {ticket.status}
                       </Badge>
                    </div>
                    <p className={`font-black text-sm line-clamp-1 leading-tight ${selectedTicketId === ticket.id ? 'text-white' : 'text-foreground'}`}>
                        {ticket.subject}
                    </p>
                    <div className="flex items-center justify-between">
                         <span className={`text-[9px] font-bold ${selectedTicketId === ticket.id ? 'text-primary-foreground/60' : 'text-muted-foreground/60'}`}>
                            Il y a 5 min
                         </span>
                         {selectedTicketId !== ticket.id && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            )}
          </div>
        </Card>

        {/* Chat Area */}
        <div className="lg:col-span-3 flex flex-col h-full overflow-hidden bg-muted/5 rounded-[2rem] border border-border/30 relative">
          
          <header className="flex items-center justify-between p-6 border-b bg-card/80 backdrop-blur-2xl z-10 sticky top-0 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-[1.2rem] bg-gradient-to-br from-primary via-primary/90 to-black flex items-center justify-center text-white font-black text-lg shadow-xl ring-2 ring-primary/20 rotate-3 group-hover:rotate-0 transition-transform">
                    {selectedTicket?.subject?.substring(0,2).toUpperCase() || 'R'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-4 border-card shadow-sm" />
              </div>
              <div>
                <h3 className="font-black text-lg text-foreground tracking-tight leading-none mb-1">
                    {selectedTicket?.subject || 'En attente de sélection'}
                </h3>
                <div className="flex items-center gap-2">
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest flex items-center gap-1.5 opacity-60">
                        <Check className="w-3 h-3 text-primary" /> Support Ro2ya Officiel
                    </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost" className="rounded-full h-10 w-10 border border-border/20 shadow-sm">
                    <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                </Button>
            </div>
          </header>

          <main 
            className="flex-1 overflow-y-auto p-6 space-y-8 container-scroll relative bg-[#0a0c10] custom-scrollbar" 
            ref={scrollRef}
          >
            {isLoading && messages.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            ) : null}
            
            <AnimatePresence initial={false}>
              {messages.length === 0 && !isLoading ? (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center p-10"
                >
                    <div className="w-24 h-24 bg-primary/5 rounded-[2.5rem] flex items-center justify-center mb-6 ring-1 ring-primary/10 shadow-inner">
                        <MessageSquare className="w-10 h-10 text-primary opacity-40" />
                    </div>
                    <h4 className="text-xl font-black text-foreground mb-2">Engagez la discussion</h4>
                    <p className="text-sm text-muted-foreground max-w-[240px] leading-relaxed">
                        Le client attend votre réponse. Soyez pro, soyez Ro2ya.
                    </p>
                </motion.div>
              ) : messages.map((msg, idx) => {
                const isSupport = msg.sender_type === 'support';
                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg.id} 
                    className={`flex ${isSupport ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] md:max-w-[70%] rounded-2xl p-5 shadow-xl relative border ${
                        isSupport
                          ? 'bg-[#1e1414] text-red-50 border-red-900/30 rounded-tr-none'
                          : 'bg-[#1a1d23] text-slate-100 border-slate-800 rounded-tl-none'
                      }`}
                    >
                       <div className={`flex items-center justify-between mb-2 pb-2 border-b ${
                           isSupport ? 'border-red-900/20' : 'border-white/5'
                       }`}>
                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                                isSupport ? 'text-primary' : 'text-slate-500'
                            }`}>
                                {isSupport ? 'Support Ro2ya' : 'Message Client'}
                            </span>
                            <span className={`text-[9px] font-medium opacity-40 ${isSupport ? 'text-red-200' : 'text-slate-400'}`}>
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                       </div>
                      <p className="text-[14px] font-medium leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                      {isSupport && (
                          <div className="mt-2 flex justify-end">
                              <Check className="w-3 h-3 text-primary/50" />
                          </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </main>

          <footer className="p-6 bg-card border-t shadow-[0_-10px_30px_rgba(0,0,0,0.02)] z-10">
            <div className="flex gap-4 items-center bg-muted/30 p-2 rounded-[1.8rem] border border-border/50 shadow-inner focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <Button size="icon" variant="ghost" className="rounded-full h-12 w-12 hover:bg-background shadow-sm shrink-0 transition-transform hover:scale-110 active:scale-95">
                <Paperclip className="w-5 h-5 text-muted-foreground" />
              </Button>
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Écrivez votre message..."
                disabled={!selectedTicketId || isSending}
                className="flex-1 bg-transparent border-none px-2 h-12 text-sm font-bold focus:outline-none disabled:opacity-50 placeholder:text-muted-foreground/50 placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest"
              />
              <Button size="icon" variant="ghost" className="rounded-full h-12 w-12 hover:bg-background transition-transform hover:scale-110">
                <Smile className="w-5 h-5 text-muted-foreground" />
              </Button>
              <Button 
                onClick={handleSendMessage} 
                disabled={!selectedTicketId || isSending || !messageText.trim()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl h-12 px-8 shadow-xl shadow-primary/30 active:scale-95 transition-all shrink-0 group overflow-hidden relative"
              >
                {isSending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <>
                        <span className="font-black text-xs uppercase tracking-widest mr-2">Envoyer</span>
                        <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform" />
                    </>
                )}
              </Button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="p-8 flex items-center gap-4 text-primary"><Loader2 className="w-6 h-6 animate-spin" /> <span className="font-black text-xs tracking-widest uppercase">Initialisation Ro2ya...</span></div>}>
      <ChatContent />
    </Suspense>
  );
}
