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
    updateMessage
  } = useMessagingStore();

  // Initialize User
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getUser();
  }, [supabase]);



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
        const partnerId = msg.sender_id === currentUser.id ? msg.receiver_id : msg.sender_id;
        const partnerData = msg.sender_id === currentUser.id ? msg.receiver : msg.sender;

        if (!conversationMap.has(partnerId)) {
          conversationMap.set(partnerId, {
            user_id: partnerId,
            full_name: partnerData?.full_name || 'Utilisateur',
            avatar_url: partnerData?.avatar_url,
            last_message: msg.content,
            last_message_at: msg.created_at,
            unread_count: (!msg.is_read && msg.receiver_id === currentUser.id) ? 1 : 0
          });
        } else if (!msg.is_read && msg.receiver_id === currentUser.id) {
          const entry = conversationMap.get(partnerId)!;
          entry.unread_count += 1;
        }
      });

      setConversations(Array.from(conversationMap.values()));
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

  // Fetch Messages for a specific partner
  const fetchMessages = useCallback(async (partnerId: string) => {
    if (!currentUser) return;

    try {
      const { data, error } = await (supabase as any)
        .from('messages' as any)
        .select('*')
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${currentUser.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark messages as read
      await (supabase as any)
        .from('messages')
        .update({ is_read: true })
        .match({ sender_id: partnerId, receiver_id: currentUser.id, is_read: false });

    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [currentUser, setMessages]);

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

  const sendMessage = async (
    receiverId: string, 
    content: string, 
    type: 'text' | 'image' | 'audio' = 'text',
    attachmentUrl?: string,
    metadata: any = {}
  ) => {
    if (!currentUser) return;

    try {
      const { data, error } = await (supabase as any)
        .from('messages' as any)
        .insert([{
          sender_id: currentUser.id,
          receiver_id: receiverId,
          content,
          type,
          attachment_url: attachmentUrl,
          metadata
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
    fetchConversations,
    fetchMessages,
    sendMessage,
    uploadFile
  };
}
