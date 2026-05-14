'use client';

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import dynamic from "next/dynamic";
import { Theme } from "emoji-picker-react";
const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false, loading: () => <div className="p-4 flex justify-center"><span className="animate-spin h-6 w-6 border-b-2 border-primary rounded-full"></span></div> });
import { Send, MoreVertical, User, Paperclip, Smile, Mic, X, Image as ImageIcon, Trash2, UserPlus, UserCheck, Ban } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { Message, Conversation } from "@/types/messaging";
import Link from "next/link";
import { useMessaging } from "@/hooks/useMessaging";

import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { trackEvent } from "@/lib/tracking/trackEvent";

interface ChatWindowProps {
  partner: Conversation | null;
  messages: Message[];
  currentUserId?: string;
   onSendMessage: (content: string, type?: 'text' | 'image' | 'audio', url?: string, metadata?: any) => void;
  onFriendshipUpdate?: () => void;
  isLoading?: boolean;
  friendshipStatus?: { status: string | null, direction: string | null };
}

export function ChatWindow({ partner, messages, currentUserId, onSendMessage, onFriendshipUpdate, isLoading, friendshipStatus }: ChatWindowProps) {
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [chatMenuOpen, setChatMenuOpen] = useState(false);
  const [chatMenuPos, setChatMenuPos] = useState({ top: 0, left: 0 });
  const chatMenuTriggerRef = useRef<HTMLSpanElement>(null);
  const chatMenuPanelRef = useRef<HTMLDivElement>(null);

  const CHAT_MENU_WIDTH = 192;

  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { uploadFile, deleteMessage } = useMessaging();


  const scrollToBottom = () => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
    try {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    } catch(e) {}
  };

  useEffect(() => {
    scrollToBottom();
    // Attempt again after short delay to allow for image loads/renders
    const timer1 = setTimeout(scrollToBottom, 150);
    const timer2 = setTimeout(scrollToBottom, 500);
    const timer3 = setTimeout(scrollToBottom, 1000);
    return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); };
  }, [messages.length, partner?.user_id]);

  useEffect(() => {
    setChatMenuOpen(false);
  }, [partner?.user_id]);

  const updateChatMenuPosition = () => {
    const el = chatMenuTriggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const gap = 8;
    let left = r.right - CHAT_MENU_WIDTH;
    left = Math.max(8, Math.min(left, window.innerWidth - CHAT_MENU_WIDTH - 8));
    let top = r.bottom + gap;
    const estHeight = 220;
    if (top + estHeight > window.innerHeight - 8) {
      top = Math.max(8, r.top - gap - estHeight);
    }
    setChatMenuPos({ top, left });
  };

  useLayoutEffect(() => {
    if (!chatMenuOpen) return;
    updateChatMenuPosition();
  }, [chatMenuOpen]);

  useEffect(() => {
    if (!chatMenuOpen) return;
    const onScroll = () => updateChatMenuPosition();
    const onResize = () => updateChatMenuPosition();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [chatMenuOpen]);

  useEffect(() => {
    if (!chatMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setChatMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chatMenuOpen]);

  useEffect(() => {
    if (!chatMenuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (chatMenuTriggerRef.current?.contains(t)) return;
      if (chatMenuPanelRef.current?.contains(t)) return;
      setChatMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [chatMenuOpen]);

  // Handle Image Selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Fichier trop volumineux", { description: "L'image ne doit pas dépasser 5 Mo." });
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Voice Recording Logic
  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error("Audio non supporté", { description: "L'enregistrement requiert une connexion sécurisée (HTTPS) ou n'est pas supporté par ce navigateur." });
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      timerRef.current = setInterval(() => setRecordingDuration(prev => prev + 1), 1000);
    } catch (err: any) {
      console.error("Mic error:", err);
      if (err.name === 'NotFoundError' || err.message.includes('Requested device not found')) {
        toast.error("Microphone introuvable", { description: "Aucun microphone n'est détecté sur votre appareil." });
      } else if (err.name === 'NotAllowedError') {
        toast.error("Accès refusé", { description: "L'accès au microphone a été refusé par votre navigateur." });
      } else {
        toast.error("Erreur microphone", { description: err.message || "Impossible d'accéder au micro." });
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() && !selectedImage && !audioBlob) return;

    let type: 'text' | 'image' | 'audio' = 'text';
    let attachmentUrl = undefined;
    let metadata = {};

    try {
      if (selectedImage) {
        toast("Téléchargement de l'image...");
        attachmentUrl = await uploadFile(selectedImage, 'images');
        type = 'image';
      } else if (audioBlob) {
        toast("Téléchargement de la note vocale...");
        const audioFile = new File([audioBlob], 'voice_note.webm', { type: 'audio/webm' });
        attachmentUrl = await uploadFile(audioFile, 'audio');
        type = 'audio';
        metadata = { duration: recordingDuration };
      }

      onSendMessage(inputValue, type, attachmentUrl || undefined, metadata);
      setInputValue("");
      setSelectedImage(null);
      setImagePreview(null);
      setAudioBlob(null);
      setRecordingDuration(0);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const formatDuration = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  if (!partner) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/20">
        <div className="text-center space-y-4 max-w-sm px-6">
          <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Send className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">Vos Messages</h3>
          <p className="text-muted-foreground text-sm">
            Sélectionnez une conversation pour commencer à discuter ou démarrez-en une nouvelle avec vos amis.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden bg-background/30 backdrop-blur-xl">
      {/* Header */}
      <div className="relative z-20 flex items-center justify-between p-4 border-b border-border/50 bg-background/50 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-primary/10">
            <AvatarImage src={partner.avatar_url} />
            <AvatarFallback>{partner.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-sm leading-tight">{partner.full_name}</h3>
            <span className="text-[10px] text-green-500 font-medium flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              En ligne
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <span ref={chatMenuTriggerRef} className="inline-flex">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-primary"
              aria-label="Options de conversation"
              aria-expanded={chatMenuOpen}
              aria-haspopup="true"
              onClick={() => setChatMenuOpen((o) => !o)}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </span>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea ref={scrollRef} className="h-full p-4">
          <div className="space-y-2">
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              id={msg.id}
              content={msg.content}
              timestamp={msg.created_at}
              isSender={msg.sender_id === currentUserId}
              senderName={partner.full_name}
              senderAvatar={partner.avatar_url}
              type={msg.type}
              attachmentUrl={msg.attachment_url}
              metadata={msg.metadata}
              isRead={msg.is_read}
              onDelete={deleteMessage}
            />
          ))}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="bg-muted px-4 py-2 rounded-2xl rounded-bl-none animate-pulse">
                <div className="flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce delay-100" />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
            <div ref={messagesEndRef} className="h-1" />
          </div>
        </ScrollArea>
      </div>

      <div className="p-4 bg-background/50 backdrop-blur-md border-t border-border/50">
        {friendshipStatus?.status !== 'BLOCKED' &&
        (friendshipStatus === undefined ||
          friendshipStatus?.status === 'ACCEPTED' ||
          messages.length > 0) ? (
          <>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageSelect}
            />

            {/* Preview Area */}
            {(imagePreview || audioBlob) && (
              <div className="mb-4 p-3 bg-muted/50 rounded-2xl border border-border/50 flex items-center justify-between animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-3">
                  {imagePreview ? (
                    <div className="relative h-16 w-16">
                      <img src={imagePreview} className="h-full w-full object-cover rounded-lg" alt="Preview" />
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
                        onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg border border-primary/20">
                      <Mic className="h-4 w-4 text-primary" />
                      <span className="text-xs font-medium text-primary">Note vocale prête</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5 text-muted-foreground"
                        onClick={() => setAudioBlob(null)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground italic">Prêt à envoyer</span>
              </div>
            )}

            <div className="flex items-end gap-2 max-w-4xl mx-auto">
              <div className="flex gap-1 mb-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex-1 relative group">
                {isRecording ? (
                  <div className="flex items-center gap-3 px-4 h-11 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in fade-in zoom-in-95">
                    <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-mono text-red-500">{formatDuration(recordingDuration)}</span>
                    <div className="flex-1 flex gap-1 items-center justify-center opacity-40">
                      {[...Array(12)].map((_, i) => (
                        <div 
                          key={i} 
                          className="w-0.5 bg-red-500 rounded-full" 
                          style={{ height: `${Math.random() * 16 + 4}px` }} 
                        />
                      ))}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-red-500 hover:bg-red-500/20"
                      onClick={() => { stopRecording(); setAudioBlob(null); }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="h-8 rounded-full px-3 text-[10px] font-bold"
                      onClick={stopRecording}
                    >
                      ARRÊTER
                    </Button>
                  </div>
                ) : (
                  <>
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder={audioBlob ? "Ajouter une légende..." : "Tapez votre message..."}
                      className="pr-10 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/50 min-h-[44px] rounded-2xl"
                    />
                    {showEmojiPicker && (
                      <div className="absolute bottom-12 right-0 z-[200] shadow-2xl rounded-2xl overflow-hidden border border-border/50 animate-in fade-in slide-in-from-bottom-2">
                        <EmojiPicker 
                          onEmojiClick={(emojiData) => {
                            setInputValue(prev => prev + emojiData.emoji);
                            setShowEmojiPicker(false);
                          }} 
                          theme={Theme.AUTO}
                          lazyLoadEmojis={true}
                        />
                      </div>
                    )}
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-primary group-focus-within:text-primary transition-colors"
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>

              {!inputValue.trim() && !imagePreview && !audioBlob && !isRecording ? (
                <Button 
                  onClick={startRecording}
                  className="h-11 w-11 rounded-2xl bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground shadow-lg transition-all duration-300"
                >
                  <Mic className="h-5 w-5" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSend}
                  disabled={isRecording || (!inputValue.trim() && !imagePreview && !audioBlob)}
                  className={cn(
                    "h-11 w-11 rounded-2xl transition-all duration-300 shadow-lg",
                    (inputValue.trim() || imagePreview || audioBlob)
                      ? "bg-primary text-primary-foreground shadow-primary/20 scale-100" 
                      : "bg-muted text-muted-foreground scale-95 opacity-50"
                  )}
                >
                  <Send className="h-5 w-5" />
                </Button>
              )}
            </div>
            <p className="text-[10px] text-center text-muted-foreground mt-2">
              {isRecording ? "Enregistrement en cours..." : "Partagez des messages, images ou notes vocales"}
            </p>
          </>
        ) : friendshipStatus?.status === 'BLOCKED' ? (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-3 bg-red-50/50 rounded-2xl border border-red-100">
            <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
              <Ban className="h-5 w-5 text-red-600" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-red-900">Conversation bloquée</h4>
              <p className="text-xs text-red-600 max-w-[280px]">
                {friendshipStatus.direction === 'SENT' 
                  ? "Vous avez bloqué cet utilisateur. Débloquez-le pour reprendre la conversation."
                  : "Cet utilisateur vous a bloqué. Vous ne pouvez plus lui envoyer de messages."
                }
              </p>
            </div>
            {friendshipStatus.direction === 'SENT' && (
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full px-6 border-red-200 text-red-600 hover:bg-red-50"
                onClick={async () => {
                  const { unblockUser } = await import("@/lib/actions/friendships");
                  if (partner.user_id) {
                    const { error } = await unblockUser(partner.user_id);
                    if (!error) {
                      toast.success("Utilisateur débloqué");
                      trackEvent({
                        surface: 'profile',
                        event_type: 'USER_UNBLOCKED',
                        target_user_id: partner.user_id
                      });
                      onFriendshipUpdate?.();
                    } else {
                      toast.error("Impossible de débloquer", {
                        description: (error as { message?: string }).message ?? "Erreur serveur ou droits insuffisants.",
                      });
                    }
                  }
                }}
              >
                Débloquer l'utilisateur
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4 text-center space-y-3">
            <div className="h-10 w-10 bg-primary/5 rounded-full flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">Connexion requise</h4>
              <p className="text-xs text-muted-foreground max-w-[250px]">
                {friendshipStatus?.status === 'PENDING' 
                  ? (friendshipStatus.direction === 'SENT' ? "Invitation envoyée. Attendez qu'elle soit acceptée pour discuter." : "Vous avez une invitation en attente de cet utilisateur.")
                  : "Vous devez être connectés pour pouvoir échanger des messages."
                }
              </p>
            </div>
            {friendshipStatus?.status === null && (
              <Button 
                size="sm" 
                className="rounded-full px-6 gap-2"
                onClick={async () => {
                  const { sendFriendRequest } = await import("@/lib/actions/friendships");
                  if (partner?.user_id) {
                    const { error } = await sendFriendRequest(partner.user_id);
                    if (!error) {
                      toast.success("Invitation envoyée !");
                      onFriendshipUpdate?.();
                    }
                  }
                }}
              >
                <UserPlus className="h-4 w-4" />
                Envoyer une invitation
              </Button>
            )}
            {friendshipStatus?.status === 'PENDING' && friendshipStatus.direction === 'RECEIVED' && (
              <Button 
                size="sm" 
                className="rounded-full px-6 gap-2 bg-green-600 hover:bg-green-700"
                onClick={async () => {
                  const { acceptFriendRequest } = await import("@/lib/actions/friendships");
                  if (partner?.user_id) {
                    const { error } = await acceptFriendRequest(partner.user_id);
                    if (!error) {
                      toast.success("Invitation acceptée !");
                      onFriendshipUpdate?.();
                    }
                  }
                }}
              >
                <UserCheck className="h-4 w-4" />
                Accepter l'invitation
              </Button>
            )}
          </div>
        )}
      </div>

      {typeof document !== "undefined" &&
        chatMenuOpen &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[7000] bg-black/20"
              aria-hidden
              onClick={() => setChatMenuOpen(false)}
            />
            <div
              ref={chatMenuPanelRef}
              role="menu"
              className="fixed z-[7001] w-48 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg"
              style={{ top: chatMenuPos.top, left: chatMenuPos.left }}
            >
              <Link
                href={`/user/${partner.user_id}`}
                role="menuitem"
                className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-xs outline-none hover:bg-accent hover:text-accent-foreground"
                onClick={() => setChatMenuOpen(false)}
              >
                <User className="h-4 w-4 shrink-0" />
                Visiter le profil
              </Link>

              {friendshipStatus?.status === "BLOCKED" ? (
                friendshipStatus.direction === "SENT" ? (
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-xs text-emerald-600 outline-none hover:bg-emerald-50 hover:text-emerald-700"
                    onClick={async () => {
                      setChatMenuOpen(false);
                      const { unblockUser } = await import("@/lib/actions/friendships");
                      if (partner.user_id) {
                        const { error } = await unblockUser(partner.user_id);
                        if (!error) {
                          toast.success("Utilisateur débloqué");
                          trackEvent({
                            surface: "profile",
                            event_type: "USER_UNBLOCKED",
                            target_user_id: partner.user_id,
                          });
                          onFriendshipUpdate?.();
                        } else {
                          toast.error("Impossible de débloquer", {
                            description: (error as { message?: string }).message ?? "Erreur serveur ou droits insuffisants.",
                          });
                        }
                      }
                    }}
                  >
                    <UserCheck className="h-4 w-4 shrink-0" />
                    Débloquer
                  </button>
                ) : (
                  <p
                    role="note"
                    className="px-2 py-2 text-[10px] font-medium leading-snug text-red-600"
                  >
                    Vous avez été bloqué par cet utilisateur.
                  </p>
                )
              ) : (
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-xs text-red-600 outline-none hover:bg-red-50 hover:text-red-700"
                  onClick={async () => {
                    setChatMenuOpen(false);
                    if (confirm(`Êtes-vous sûr de vouloir bloquer ${partner.full_name} ?`)) {
                      const { blockUser } = await import("@/lib/actions/friendships");
                      if (partner.user_id) {
                        const { error } = await blockUser(partner.user_id);
                        if (!error) {
                          toast.success("Utilisateur bloqué");
                          trackEvent({
                            surface: "profile",
                            event_type: "USER_BLOCKED",
                            target_user_id: partner.user_id,
                          });
                          onFriendshipUpdate?.();
                        }
                      }
                    }
                  }}
                >
                  <Ban className="h-4 w-4 shrink-0" />
                  Bloquer l&apos;utilisateur
                </button>
              )}
            </div>
          </>,
          document.body
        )}
    </div>
  );
}
