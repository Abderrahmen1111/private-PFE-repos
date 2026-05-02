'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Message, Conversation } from '@/types/messaging';
import { useMessagingStore } from '@/lib/store/use-messaging-store';
import { createNotification } from '@/lib/actions/notifications';

export function useMessaging() {
  const supabase = useMemo(() => createClient(), []);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  const { 
    conversations, 
    messages, 
    setConversations, 
    setMessages, 
    addMessage,
    activePartnerId,
    setActivePartnerId,
    isOpen,
    setIsOpen,
    isMinimized,
    setIsMinimized,
    isNearEdge,
    setIsNearEdge,
    updateMessage,
    removeMessage
  } = useMessagingStore();

  // Initialize & Listen to User Auth State
  useEffect(() => {
    // Initial check
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user ?? null;
      setCurrentUser(user);
      setIsAuthLoading(false);
      
      if (event === 'SIGNED_OUT') {
        setConversations([]);
        setMessages([]);
        setActivePartnerId(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, setConversations, setMessages, setActivePartnerId]);



  // Total Unread Count
  const totalUnreadCount = useMemo(() => {
    return conversations.reduce((acc, conv) => acc + (conv.unread_count || 0), 0);
  }, [conversations]);

  // Fetch Conversations
  const fetchConversations = useCallback(async () => {
    if (!currentUser) return;

    try {
      const { data: allMessages, error } = await (supabase as any)
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey(full_name, avatar_url),
          receiver:users!messages_receiver_id_fkey(full_name, avatar_url)
        `)
        .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const conversationMap = new Map<string, Conversation>();

      allMessages?.forEach((msg: any) => {
        // Skip messages deleted for the current user
        if (msg.metadata?.deleted_for?.includes(currentUser.id)) return;

        const isStoreChat = msg.metadata?.chat_type === 'store';
        const partnerId = msg.sender_id === currentUser.id ? msg.receiver_id : msg.sender_id;
        const partnerData = msg.sender_id === currentUser.id ? msg.receiver : msg.sender;

        // FILTER LOGIC: 
        // If I am the RECEIVER of a STORE message, and I have a store (merchant), 
        // DO NOT show this in my general personal /messages sidebar.
        // It should only show in my Dashboard.
        if (isStoreChat && msg.receiver_id === currentUser.id) {
            // We can check if the user is a merchant here if needed, 
            // but the rule is generally: store messages are for the dashboard.
            return;
        }

        if (!conversationMap.has(partnerId)) {
            conversationMap.set(partnerId, {
              user_id: partnerId,
              full_name: partnerData?.full_name || 'Utilisateur',
              avatar_url: partnerData?.avatar_url,
              last_message: msg.content,
              last_message_at: msg.created_at,
              unread_count: (!msg.is_read && msg.receiver_id === currentUser.id) ? 1 : 0,
              chat_type: msg.metadata?.chat_type || 'personal'
            } as any);
        } else if (!msg.is_read && msg.receiver_id === currentUser.id) {
          const entry = conversationMap.get(partnerId)!;
          entry.unread_count += 1;
        }
      });

      // Enrich conversations with store details if the partner is a merchant
      const partnerIds = Array.from(conversationMap.keys());
      if (partnerIds.length > 0) {
        const { data: stores } = await supabase
          .from('stores')
          .select('owner_id, name, logo_url')
          .in('owner_id', partnerIds);
          
        stores?.forEach((store: any) => {
          const conv = conversationMap.get(store.owner_id);
          if (conv) {
            conv.full_name = store.name;
            if (store.logo_url) {
              conv.avatar_url = store.logo_url;
            }
          }
        });
      }

      // Force current active partner to 0 unread locally
      const activeId = useMessagingStore.getState().activePartnerId;
      const updatedConversations = Array.from(conversationMap.values()).map(conv => ({
        ...conv,
        unread_count: conv.user_id === activeId ? 0 : conv.unread_count
      }));

      setConversations(updatedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  }, [currentUser, setConversations]);

  // Initial Data Fetch
  useEffect(() => {
    if (currentUser) {
      fetchConversations();
    }
  }, [currentUser, fetchConversations]);

  const fetchMessages = useCallback(async (partnerId: string) => {
    if (!currentUser) return;

    try {
      const { data, error } = await (supabase as any)
        .from('messages' as any)
        .select('*')
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${currentUser.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      const filteredMessages = data?.filter((msg: any) => 
        !msg.metadata?.deleted_for?.includes(currentUser.id)
      ) || [];
      setMessages(filteredMessages);

      // Optimistic local update
      const currentConversations = useMessagingStore.getState().conversations;
      useMessagingStore.getState().setConversations(
        currentConversations.map(c => 
          c.user_id === partnerId ? { ...c, unread_count: 0 } : c
        )
      );

      // Mark messages as read in DB
      await (supabase as any)
        .from('messages')
        .update({ is_read: true })
        .match({ sender_id: partnerId, receiver_id: currentUser.id, is_read: false });

      // Ensure background sync later with a delay to allow DB indexing/update to reflect
      setTimeout(() => {
        fetchConversations();
      }, 500);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [currentUser, setMessages, fetchConversations]);

  const uploadFile = async (file: File, folder: string = 'others') => {
    if (!currentUser) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `${currentUser.id}/${folder}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Erreur lors du téléchargement du fichier');
      return null;
    }
  };

  const deleteMessage = async (messageId: string, mode: 'me' | 'everyone' = 'me') => {
    if (!currentUser) return;
    
    // Optimistic remove from UI
    removeMessage(messageId);
    
    try {
      if (mode === 'everyone') {
        await (supabase as any)
          .from('messages')
          .delete()
          .eq('id', messageId);
      } else {
        // Mode 'me': Update metadata to include current user in deleted_for list
        const { data: msg } = await (supabase as any)
          .from('messages')
          .select('metadata')
          .eq('id', messageId)
          .single();
        
        const metadata = msg?.metadata || {};
        const deletedFor = metadata.deleted_for || [];
        
        if (!deletedFor.includes(currentUser.id)) {
          await (supabase as any)
            .from('messages')
            .update({ 
              metadata: { 
                ...metadata, 
                deleted_for: [...deletedFor, currentUser.id] 
              } 
            })
            .eq('id', messageId);
        }
      }
      // Refresh conversations to update last_message preview
      fetchConversations();
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Erreur lors de la suppression du message');
      // Re-fetch messages to restore if it failed
      if (activePartnerId) fetchMessages(activePartnerId);
    }
  };

  const sendMessage = async (
    receiverId: string, 
    content: string, 
    type: 'text' | 'image' | 'audio' = 'text',
    attachmentUrl?: string,
    metadata: any = {}
  ) => {
    if (!currentUser) return;

    // Determine chat type from URL if available, or use existing metadata
    const searchParams = new URLSearchParams(window.location.search);
    const chatType = searchParams.get('type') || metadata.chat_type || 'personal';
    const storeId = searchParams.get('storeId') || metadata.store_id;

    const enrichedMetadata = {
        ...metadata,
        chat_type: chatType,
        store_id: storeId
    };

    try {
      const { data, error } = await (supabase as any)
        .from('messages' as any)
        .insert([{
          sender_id: currentUser.id,
          receiver_id: receiverId,
          content,
          type,
          attachment_url: attachmentUrl,
          metadata: enrichedMetadata
        }])
        .select()
        .single();

      if (error) throw error;
      
      addMessage(data);
      fetchConversations();

      // Trigger Notification for the receiver
      await createNotification({
        userId: receiverId,
        title: 'Nouveau message',
        description: content,
        type: 'MESSAGE',
        link: '/messages', // Or deep link if possible
        metadata: { messageId: data.id, senderId: currentUser.id }
      });

      return data;
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du message');
      console.error('Error sending message:', error);
    }
  };

  // Realtime Subscription
  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `receiver_id=eq.${currentUser.id}`
      }, (payload) => {
        const newMessage = payload.new as Message;
        
        // Show toast if window is closed or minimized, or if it's from another partner
        if (!isOpen || isMinimized || newMessage.sender_id !== activePartnerId) {
          toast('Nouveau message reçu', {
              description: newMessage.content.substring(0, 50) + '...',
              action: {
                label: 'Voir',
                onClick: () => {
                  setActivePartnerId(newMessage.sender_id);
                  setIsOpen(true);
                },
              },
          });
        }

        fetchConversations();
        
        // If the new message is from the active partner, add it to current messages
        if (newMessage.sender_id === activePartnerId) {
            addMessage(newMessage);
            // Auto-mark as read if window is active
            if (isOpen && !isMinimized) {
              supabase.from('messages').update({ is_read: true }).eq('id', newMessage.id).then();
            }
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        // We want to know when messages WE SENT are read
        filter: `sender_id=eq.${currentUser.id}`
      }, (payload) => {
        const updatedMessage = payload.new as Message;
        if (updatedMessage.is_read) {
          updateMessage(updatedMessage.id, { is_read: true });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, fetchConversations, activePartnerId, addMessage, setIsOpen, setActivePartnerId]);

  return {
    currentUser,
    messages,
    conversations,
    activePartnerId,
    isOpen,
    isMinimized,
    isNearEdge,
    totalUnreadCount,
    setIsOpen,
    setIsMinimized,
    setIsNearEdge,
    setActivePartnerId,
    isAuthLoading,
    fetchConversations,
    fetchMessages,
    sendMessage,
    deleteMessage,
    uploadFile
  };
}
