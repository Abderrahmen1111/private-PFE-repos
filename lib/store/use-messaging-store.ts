import { create } from 'zustand';
import { Message, Conversation } from '@/types/messaging';

interface MessagingState {
  conversations: Conversation[];
  messages: Message[];
  activePartnerId: string | null;
  isOpen: boolean;
  isMinimized: boolean;
  isNearEdge: boolean;
  
  // Actions
  setConversations: (conversations: Conversation[]) => void;
  setMessages: (messages: Message[]) => void;
  setActivePartnerId: (id: string | null) => void;
  setIsOpen: (isOpen: boolean) => void;
  setIsMinimized: (isMinimized: boolean) => void;
  setIsNearEdge: (isNearEdge: boolean) => void;
  
  // Utils
  addMessage: (message: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
}

export const useMessagingStore = create<MessagingState>((set) => ({
  conversations: [],
  messages: [],
  activePartnerId: null,
  isOpen: false,
  isMinimized: false,
  isNearEdge: false,

  setConversations: (conversations) => set({ conversations }),
  setMessages: (messages) => set({ messages }),
  setActivePartnerId: (id) => set({ activePartnerId: id, isMinimized: false }),
  setIsOpen: (isOpen) => set({ isOpen }),
  setIsMinimized: (isMinimized) => set({ isMinimized }),
  setIsNearEdge: (isNearEdge) => set({ isNearEdge }),
  
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  
  updateMessage: (id: string, updates: Partial<Message>) => set((state) => ({
    messages: state.messages.map(m => m.id === id ? { ...m, ...updates } : m)
  })),
}));
