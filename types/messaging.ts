export type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  type: 'text' | 'image' | 'audio' | 'file';
  attachment_url?: string | null;
  metadata?: any;
  created_at: string;
};

export type Conversation = {
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
  online?: boolean;
};
