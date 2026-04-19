'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, X, Maximize2, Minimize2 } from "lucide-react";
import { useMessaging } from "@/hooks/useMessaging";
import { ChatWindow } from "./ChatWindow";
import { ConversationSidebar } from "./ConversationSidebar";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Message, Conversation } from "@/types/messaging";

export function MessageBubble() {
  const { 
    currentUser, 
    messages, 
    conversations, 
    fetchMessages, 
    sendMessage,
    totalUnreadCount: totalUnread,
    isOpen,
    setIsOpen,
    isMinimized,
    setIsMinimized,
    isNearEdge,
    setIsNearEdge,
    activePartnerId,
    setActivePartnerId
  } = useMessaging();
  
  const handleSelectPartner = (id: string) => {
    setActivePartnerId(id);
    fetchMessages(id);
  };

  const activePartner = conversations.find((c: any) => c.user_id === activePartnerId) || null;

  if (!currentUser) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-4 pointer-events-none">
      <AnimatePresence>
        {(isOpen || isNearEdge) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            className="flex flex-col items-end gap-4"
          >
            {/* Chat Window Container */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20, filter: "blur(10px)" }}
                  animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.9, y: 20, filter: "blur(10px)" }}
                  className={cn(
                    "bg-background/80 backdrop-blur-2xl border border-border/50 shadow-2xl rounded-3xl overflow-hidden pointer-events-auto transition-all duration-300",
                    isMinimized ? "h-14 w-64 translate-y-20" : "h-[500px] w-[380px]"
                  )}
                >
                  {isMinimized ? (
                    <div className="flex items-center justify-between p-3 h-full cursor-pointer" onClick={() => setIsMinimized(false)}>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <MessageCircle className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium">Messages ({totalUnread})</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col h-full">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-background/50">
                        <span className="font-bold text-sm">Messages</span>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsMinimized(true)}>
                            <Minimize2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => window.location.href = '/messages'}>
                            <Maximize2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsOpen(false)}>
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex-1 overflow-hidden flex">
                        {!activePartnerId ? (
                          <div className="w-full">
                            <ConversationSidebar 
                              conversations={conversations} 
                              onSelect={handleSelectPartner}
                            />
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col h-full relative">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="absolute left-2 top-2 z-20 h-8 text-[10px] bg-background/50 hover:bg-background"
                              onClick={() => setActivePartnerId(null)}
                            >
                              Retour
                            </Button>
                            <ChatWindow 
                              partner={activePartner}
                              messages={messages}
                              currentUserId={currentUser.id}
                              onSendMessage={(content, type, url, meta) => sendMessage(activePartnerId, content, type, url, meta)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* The Main Toggle Bubble */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setIsOpen(!isOpen); setIsMinimized(false); }}
              className={cn(
                "h-14 w-14 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-300 pointer-events-auto relative group",
                isOpen 
                  ? "bg-muted text-foreground rotate-90" 
                  : "bg-primary text-primary-foreground hover:shadow-primary/20"
              )}
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <>
                  <MessageCircle className="h-6 w-6" />
                  {totalUnread > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background ring-2 ring-red-500/20 group-hover:scale-110 transition-transform">
                      {totalUnread}
                    </span>
                  )}
                </>
              )}
              
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
