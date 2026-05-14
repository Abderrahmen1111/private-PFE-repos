'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile, Search, Loader2, Check, MoreHorizontal, Mail, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { getStoreTickets, SupportTicket, getTicketMessages, sendTicketMessage, getStoreCustomerMessages, sendStoreCustomerMessage } from '@/lib/actions/support';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SupportMessagesSectionProps {
  storeId: number;
  initialTicketId?: string | null;
}

type Message = {
  id: string;
  sender_id: string;
  sender_type?: 'customer' | 'support';
  content: string;
  created_at: string;
};

type Conversation = {
  id: string;
  partner_name: string;
  partner_avatar?: string;
  last_message: string;
  last_message_at: string;
  unread: boolean;
};

export default function SupportMessagesSection({ storeId, initialTicketId }: SupportMessagesSectionProps) {
  const [activeTab, setActiveTab] = useState<'tickets' | 'clients'>('tickets');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(initialTicketId || null);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
        setCurrentUserId(user?.id || null);
        if (user) {
          supabase.from('users').select('role').eq('id', user.id).single()
            .then(({ data }) => setUserRole(data?.role));
        }
    });
  }, [supabase]);

  useEffect(() => {
    async function loadInitialData() {
      if (storeId) {
        const [ticketsData, convsData] = await Promise.all([
          getStoreTickets(storeId),
          getStoreCustomerMessages(storeId)
        ]);
        
        setTickets(ticketsData);
        setConversations(convsData);
        
        if (activeTab === 'tickets' && !selectedTicketId && ticketsData.length > 0) {
          setSelectedTicketId(ticketsData[0].id);
        } else if (activeTab === 'clients' && !selectedPartnerId && convsData.length > 0) {
          setSelectedPartnerId(convsData[0].id);
        }
      }
    }
    loadInitialData();
  }, [storeId, activeTab]);

  useEffect(() => {
    if (activeTab === 'tickets' && selectedTicketId) {
      loadTicketMessages(selectedTicketId);
      
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
    } else if (activeTab === 'clients' && selectedPartnerId && currentUserId) {
      loadDirectMessages(selectedPartnerId);

      const channel = supabase
        .channel(`direct-${selectedPartnerId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `or(and(sender_id.eq.${currentUserId},receiver_id.eq.${selectedPartnerId}),and(sender_id.eq.${selectedPartnerId},receiver_id.eq.${currentUserId}))`
          },
          (payload) => {
            const newMessage = payload.new as Message;
            setMessages(prev => {
              if (prev.some(m => m.id === newMessage.id)) return prev;
              return [...prev, newMessage];
            });
            // Also refresh conversations to update last message/unread status
            getStoreCustomerMessages(storeId).then(setConversations);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
    
    // Add global subscription for NEW conversations/messages to update the list
    if (currentUserId) {
      const globalChannel = supabase
        .channel('global-messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${currentUserId}`
          },
          () => {
            getStoreCustomerMessages(storeId).then(setConversations);
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(globalChannel);
      };
    }
  }, [selectedTicketId, selectedPartnerId, activeTab, currentUserId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function loadTicketMessages(ticketId: string) {
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

  async function loadDirectMessages(partnerId: string) {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${currentUserId})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Filter by storeId in JS for strict segregation
      const filteredData = (data || []).filter((msg: any) => 
        Number(msg.metadata?.store_id) === Number(storeId)
      );
      
      setMessages(filteredData);
    } catch (error) {
      console.error('Failed to load direct messages:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);
  const selectedConversation = conversations.find(c => c.id === selectedPartnerId);

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    
    if (activeTab === 'tickets' && !selectedTicketId) return;
    if (activeTab === 'clients' && !selectedPartnerId) return;

    setIsSending(true);
    const content = messageText.trim();
    setMessageText('');
    
    try {
      if (activeTab === 'tickets') {
        const senderType = userRole === 'ADMIN' ? 'support' : 'customer';
        const result = await sendTicketMessage(selectedTicketId!, content, senderType);
        if (!result.success) setMessageText(content);
      } else {
        const result = await sendStoreCustomerMessage(selectedPartnerId!, content, storeId);
        if (!result.success) setMessageText(content);
      }
    } catch (error) {
      console.error('Message send error:', error);
      setMessageText(content);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 mb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
            <div className="w-1 h-8 bg-primary rounded-full" />
            <h2 className="text-3xl font-black text-white tracking-tight">Centre de Messagerie</h2>
        </div>
        
        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="bg-white/5 p-1 rounded-2xl border border-white/10">
          <TabsList className="bg-transparent border-none">
            <TabsTrigger value="tickets" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-xs px-6 py-2">
              Support RO2YA
            </TabsTrigger>
            <TabsTrigger value="clients" className="rounded-xl data-[state=active]:bg-red-500 data-[state=active]:text-white font-bold text-xs px-6 py-2">
              Conversations Clients
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[650px] overflow-hidden">
        {/* Conversations List */}
        <Card className="flex flex-col border border-white/5 bg-white/5 backdrop-blur-2xl shadow-2xl overflow-hidden rounded-[2.5rem]">
          <div className="p-5 border-b border-white/5 bg-white/5">
            <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Chercher une discussion..." className="pl-10 h-11 rounded-2xl bg-white/5 border-none text-xs shadow-inner" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
            {activeTab === 'tickets' ? (
              tickets.length === 0 ? (
                <div className="p-12 text-center opacity-20 mt-10">
                  <Mail className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Aucun ticket support</p>
                </div>
              ) : (
                tickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => setSelectedTicketId(ticket.id)}
                    className={cn(
                        "w-full p-4 rounded-2xl text-left transition-all relative group flex flex-col gap-1 border border-transparent",
                        selectedTicketId === ticket.id 
                            ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20' 
                            : 'hover:bg-white/5 hover:border-white/5'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                       <span className={cn("text-[8px] font-black uppercase tracking-widest", selectedTicketId === ticket.id ? "text-white/60" : "text-muted-foreground")}>
                         Ticket #{ticket.ticket_number}
                       </span>
                       <Badge className={cn("text-[8px] h-4 rounded-full border-none", 
                         ticket.status === 'open' ? 'bg-green-500 text-white' : 'bg-white/10 text-white/50'
                       )}>
                         {ticket.status}
                       </Badge>
                    </div>
                    <p className={cn("font-bold text-xs line-clamp-1", selectedTicketId === ticket.id ? "text-white" : "text-foreground")}>
                        {ticket.subject}
                    </p>
                  </button>
                ))
              )
            ) : (
              conversations.length === 0 ? (
                <div className="p-12 text-center opacity-20 mt-10">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Aucun message client</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedPartnerId(conv.id)}
                    className={cn(
                        "w-full p-4 rounded-2xl text-left transition-all relative group flex gap-3 items-center border border-transparent",
                        selectedPartnerId === conv.id 
                            ? 'bg-red-500 text-white shadow-xl shadow-red-500/20' 
                            : 'hover:bg-white/5 hover:border-white/5'
                    )}
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex-shrink-0 overflow-hidden shadow-inner">
                        {conv.partner_avatar ? (
                            <img src={conv.partner_avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center font-black text-xs">
                                {conv.partner_name[0]}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <h4 className="font-bold text-xs truncate">{conv.partner_name}</h4>
                            {conv.unread && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                        </div>
                        <p className={cn("text-[10px] truncate opacity-60", selectedPartnerId === conv.id ? "text-white" : "text-muted-foreground")}>
                            {conv.last_message}
                        </p>
                    </div>
                  </button>
                ))
              )
            )}
          </div>
        </Card>

        {/* Chat Area */}
        <div className="lg:col-span-3 flex flex-col h-full overflow-hidden bg-white/5 rounded-[2.5rem] border border-white/5 relative shadow-2xl">
          <header className="flex items-center justify-between p-6 border-b border-white/5 bg-card/60 backdrop-blur-3xl z-10 sticky top-0">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-2xl ring-1 ring-white/10",
                activeTab === 'tickets' ? "bg-gradient-to-br from-primary to-blue-900" : "bg-gradient-to-br from-red-500 to-rose-900"
              )}>
                  {activeTab === 'tickets' ? (selectedTicket?.subject?.substring(0,2).toUpperCase() || '?') : (selectedConversation?.partner_name[0] || '?')}
              </div>
              <div>
                <h3 className="font-black text-sm text-foreground tracking-tight">
                    {activeTab === 'tickets' ? (selectedTicket?.subject || 'Ticket Support') : (selectedConversation?.partner_name || 'Discussion Client')}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest opacity-60">
                        {activeTab === 'tickets' ? `Status: ${selectedTicket?.status || '---'}` : 'Direct Conversation'}
                    </p>
                </div>
              </div>
            </div>
          </header>

          <main 
            className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#07090e] custom-scrollbar relative" 
            ref={scrollRef}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
            
            {isLoading && (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
            
            {((activeTab === 'tickets' && !selectedTicketId) || (activeTab === 'clients' && !selectedPartnerId)) ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-10">
                    <MessageSquare className="w-24 h-24 mb-6" />
                    <h3 className="text-xl font-black uppercase tracking-[0.3em]">Ouvrir une discussion</h3>
                </div>
            ) : messages.map((msg) => {
              const isMe = msg.sender_id === currentUserId;
              const isSupportMsg = msg.sender_type === 'support';
              
              return (
                <div key={msg.id} className={cn("flex w-full", isMe ? 'justify-end' : 'justify-start')}>
                  <div
                    className={cn(
                        "max-w-[75%] rounded-[1.5rem] p-5 shadow-2xl border transition-transform hover:scale-[1.01]",
                        isMe
                            ? (activeTab === 'tickets' 
                                ? (userRole === 'ADMIN' ? 'bg-blue-500/20 text-blue-50 border-blue-500/30 rounded-tr-none' : 'bg-primary/20 text-blue-50 border-primary/30 rounded-tr-none')
                                : 'bg-red-500/10 text-red-50 border-red-500/20 rounded-tr-none')
                            : 'bg-white/5 text-slate-200 border-white/5 rounded-tl-none'
                    )}
                  >
                    <p className="text-xs font-medium leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>
                    <div className="mt-3 flex justify-end items-center gap-2">
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-30">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMe && <Check className="w-3 h-3 text-primary opacity-50" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </main>

          <footer className="p-6 bg-card/60 backdrop-blur-3xl border-t border-white/5">
            <div className="flex gap-4 items-center bg-white/5 p-2 rounded-[1.5rem] border border-white/5 focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-inner">
              <Button size="icon" variant="ghost" className="rounded-xl h-12 w-12 hover:bg-white/10 shrink-0 text-muted-foreground hover:text-white">
                <Paperclip className="w-5 h-5" />
              </Button>
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Tapez votre message ici..."
                disabled={((activeTab === 'tickets' && !selectedTicketId) || (activeTab === 'clients' && !selectedPartnerId)) || isSending}
                className="flex-1 bg-transparent border-none px-4 h-12 text-sm font-bold focus:outline-none disabled:opacity-50 placeholder:text-muted-foreground/30"
              />
              <Button 
                type="button"
                onClick={handleSendMessage} 
                disabled={((activeTab === 'tickets' && !selectedTicketId) || (activeTab === 'clients' && !selectedPartnerId)) || isSending || !messageText.trim()}
                className={cn(
                    "rounded-2xl h-12 px-8 font-black text-xs uppercase tracking-widest shadow-2xl transition-all shrink-0 active:scale-95",
                    activeTab === 'tickets' ? "bg-primary text-white shadow-primary/30" : "bg-red-500 text-white shadow-red-500/30"
                )}
              >
                {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 mr-2" />}
                Envoyer
              </Button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
