'use client';

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ConversationSidebar } from "@/components/messaging/ConversationSidebar";
import { ChatWindow } from "@/components/messaging/ChatWindow";
import { useMessaging } from "@/hooks/useMessaging";
import Navbar from "@/components/Navbar";
import { getFriendshipStatus } from "@/lib/actions/friendships";
import { CallOverlay } from "@/components/messaging/CallOverlay";

function MessagesContent() {
  const searchParams = useSearchParams();
  const partnerIdFromUrl = searchParams.get('partnerId');
  const [activePartnerId, setActivePartnerId] = useState<string | null>(partnerIdFromUrl);
  const [selectedNewPartner, setSelectedNewPartner] = useState<any>(null);
  const [friendshipStatus, setFriendshipStatus] = useState<{ status: string | null, direction: string | null }>({ status: null, direction: null });
  
  const { 
    currentUser, 
    messages, 
    conversations, 
    fetchConversations, 
    fetchMessages, 
    sendMessage 
  } = useMessaging();

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (activePartnerId) {
      const fetchStatus = async () => {
        const res = await getFriendshipStatus(activePartnerId);
        setFriendshipStatus(res);
      };
      fetchStatus();
      fetchMessages(activePartnerId);
    }
  }, [activePartnerId, fetchMessages]);

  useEffect(() => {
    if (partnerIdFromUrl) {
      setActivePartnerId(partnerIdFromUrl);
    }
  }, [partnerIdFromUrl]);

  const handleSelectPartner = (id: string, partnerData?: any) => {
    setActivePartnerId(id);
    if (partnerData) {
      setSelectedNewPartner({ 
        user_id: id, 
        full_name: partnerData.full_name, 
        avatar_url: partnerData.avatar_url,
        unread_count: 0
      });
    }
    fetchMessages(id);
  };

  const activePartner = conversations.find((c) => c.user_id === activePartnerId) 
    || (selectedNewPartner?.user_id === activePartnerId ? selectedNewPartner : null);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <Navbar />
      
      <main className="flex-1 flex overflow-hidden pt-16 min-h-0">
        <div className="w-full max-w-7xl mx-auto flex h-full min-h-0 shadow-2xl rounded-t-3xl overflow-hidden border-x border-t border-border/50 bg-background/50 backdrop-blur-xl">
          {/* Sidebar */}
          <div className="w-full md:w-80 lg:w-96 flex-shrink-0">
            <ConversationSidebar 
              conversations={conversations} 
              activeId={activePartnerId || undefined} 
              onSelect={handleSelectPartner}
            />
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 hidden md:flex flex-col h-full min-h-0 border-l border-border/50">
            <ChatWindow 
              partner={activePartner}
              messages={messages}
              currentUserId={currentUser?.id}
              friendshipStatus={friendshipStatus}
              onSendMessage={(content, type, url, meta) => activePartnerId && sendMessage(activePartnerId, content, type, url, meta)}
            />
          </div>

          {/* Mobile Overlay for Chat */}
          {activePartnerId && (
            <div className="fixed inset-0 z-50 md:hidden bg-background flex flex-col">
              <div className="flex flex-col h-full min-h-0 flex-1 relative">
                <button 
                  onClick={() => setActivePartnerId(null)}
                  className="absolute left-4 top-[22px] z-[60] text-sm font-medium hover:text-primary transition-colors"
                >
                  Retour
                </button>
                <ChatWindow 
                  partner={activePartner}
                  messages={messages}
                  currentUserId={currentUser?.id}
                  friendshipStatus={friendshipStatus}
                  onSendMessage={(content, type, url, meta) => activePartnerId && sendMessage(activePartnerId, content, type, url, meta)}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <>
      <Suspense fallback={
        <div className="flex h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }>
        <MessagesContent />
      </Suspense>
      <CallOverlay />
    </>
  );
}
