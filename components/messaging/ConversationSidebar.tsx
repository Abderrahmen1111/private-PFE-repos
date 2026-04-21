'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useState, useEffect } from "react";
import { Search, Users, Check, X, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Conversation } from "@/types/messaging";
import { getPendingRequests, acceptFriendRequest, declineFriendRequest, getFriends } from "@/lib/actions/friendships";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMessagingStore } from "@/lib/store/use-messaging-store";

interface ConversationSidebarProps {
  conversations?: Conversation[];
  activeId?: string;
  onSelect: (id: string, partnerData?: { full_name?: string; avatar_url?: string }) => void;
}

export function ConversationSidebar({ activeId: propsActiveId, onSelect }: ConversationSidebarProps) {
  // Read directly from the Zustand store so updates are immediate
  const { 
    conversations, 
    setConversations, 
    activePartnerId: storeActiveId 
  } = useMessagingStore();
  
  const activeId = propsActiveId || storeActiveId;
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [showRequests, setShowRequests] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      const data = await getPendingRequests();
      setPendingRequests(data);
    };
    const fetchFriendsData = async () => {
      const data = await getFriends();
      setFriends(data);
    };
    fetchRequests();
    fetchFriendsData();
  }, []);

  const handleAccept = async (senderId: string) => {
    const { error } = await acceptFriendRequest(senderId);
    if (!error) {
      setPendingRequests(prev => prev.filter(r => r.user_id !== senderId));
      toast.success("Invitation acceptée !");
      // Refresh conversations would be good here, but useMessaging might handle it
    }
  };

  const handleDecline = async (senderId: string) => {
    const { error } = await declineFriendRequest(senderId);
    if (!error) {
      setPendingRequests(prev => prev.filter(r => r.user_id !== senderId));
      toast.info("Invitation déclinée");
    }
  };

  return (
    <div className="flex flex-col h-full border-r border-border/50 bg-background/50 backdrop-blur-md">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Messages
          </h2>
          <div className="flex items-center gap-2">
            {pendingRequests.length > 0 && (
              <button 
                onClick={() => setShowRequests(!showRequests)}
                className="relative p-2 rounded-full hover:bg-muted/50 text-primary transition-all group"
                title="Demandes d'invitation"
              >
                <Bell className="h-5 w-5 group-hover:scale-110 transition-transform fill-primary/10" />
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-[10px] text-white rounded-full flex items-center justify-center font-bold border-2 border-background">
                  {pendingRequests.length}
                </span>
              </button>
            )}
            <Link href="/messages/suggestions">
              <button className="p-2 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-primary transition-all group" title="Suggestions d'amis">
                <Users className="h-5 w-5 group-hover:scale-110 transition-transform" />
              </button>
            </Link>
          </div>
        </div>

        {showRequests && pendingRequests.length > 0 && (
          <div className="space-y-3 bg-muted/30 p-3 rounded-2xl border border-border/50 animate-in fade-in slide-in-from-top-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">
              Demandes d'invitation
            </p>
            {pendingRequests.map((req) => (
              <div key={req.id} className="flex items-center gap-3 bg-background/50 p-2 rounded-xl border border-border/10">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={req.sender.avatar_url} />
                  <AvatarFallback>{req.sender.full_name?.substring(0,2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{req.sender.full_name}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-7 w-7 rounded-full text-green-500 hover:text-green-600 hover:bg-green-500/10"
                    onClick={() => handleAccept(req.user_id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-7 w-7 rounded-full text-red-400 hover:text-red-500 hover:bg-red-500/10"
                    onClick={() => handleDecline(req.user_id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher..." 
            className="pl-9 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/50"
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1 px-2">
        <Tabs defaultValue="conversations" className="w-full">
          <TabsList className="w-full grid grid-cols-2 mb-2 bg-muted/50 rounded-xl h-10 p-1">
            <TabsTrigger value="conversations" className="rounded-lg text-xs font-semibold">Conversations</TabsTrigger>
            <TabsTrigger value="friends" className="rounded-lg text-xs font-semibold">Amis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="conversations" className="space-y-1 m-0 focus-visible:outline-none">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground animate-in fade-in">
                Aucune conversation
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.user_id}
                  onClick={() => {
                    // Immediately clear unread badge (optimistic update)
                    setConversations(
                      conversations.map(c =>
                        c.user_id === conv.user_id ? { ...c, unread_count: 0 } : c
                      )
                    );
                    onSelect(conv.user_id);
                  }}
                  className={cn(
                    "flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200 group relative",
                    activeId === conv.user_id 
                      ? "bg-primary/10 shadow-sm shadow-primary/5" 
                      : "hover:bg-muted/50"
                  )}
                >
                  <Avatar className="h-12 w-12 border-2 border-transparent group-hover:border-primary/20 transition-all">
                    <AvatarImage src={conv.avatar_url} />
                    <AvatarFallback>{conv.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 text-left overflow-hidden">
                    <div className="flex justify-between items-baseline gap-2">
                      <span className={cn(
                        "truncate", 
                        conv.unread_count > 0 ? "font-bold text-foreground" : "font-semibold text-foreground/90"
                      )}>
                        {conv.full_name}
                      </span>
                      {conv.last_message_at && (
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(conv.last_message_at), { locale: fr })}
                        </span>
                      )}
                    </div>
                    <p className={cn(
                      "text-xs truncate transition-colors",
                      conv.unread_count > 0 ? "text-primary font-bold" : "text-muted-foreground"
                    )}>
                        {(() => {
                          if (conv.unread_count > 0) {
                            return `${conv.unread_count} ${conv.unread_count > 1 ? 'nouveaux messages' : 'nouveau message'}`;
                          }
                          const words = conv.last_message?.split(' ') || [];
                          return words.slice(0, 5).join(' ') + (words.length > 5 ? '...' : '');
                        })()}
                    </p>
                  </div>

                  {conv.unread_count > 0 && (
                    <div className="flex items-center justify-center min-w-5 h-5 rounded-full bg-primary px-1.5 text-[10px] font-black text-primary-foreground shadow-sm shadow-primary/40">
                      {conv.unread_count}
                    </div>
                  )}

                  {activeId === conv.user_id && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-lg" />
                  )}
                </button>
              ))
            )}
          </TabsContent>

          <TabsContent value="friends" className="space-y-1 m-0 focus-visible:outline-none animate-in fade-in">
            {friends.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Aucun ami trouvé. Allez sur les suggestions pour vous faire des amis !
              </div>
            ) : (
              friends.map((friend) => (
                <button
                  key={friend.id}
                  onClick={() => onSelect(friend.id, { full_name: friend.full_name, avatar_url: friend.avatar_url })}
                  className="flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200 hover:bg-muted/50 group"
                >
                  <Avatar className="h-10 w-10 border-2 border-transparent group-hover:border-primary/20 transition-all">
                    <AvatarImage src={friend.avatar_url} />
                    <AvatarFallback>{friend.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="font-semibold text-foreground truncate flex-1 text-left">
                    {friend.full_name}
                  </span>
                </button>
              ))
            )}
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </div>
  );
}
