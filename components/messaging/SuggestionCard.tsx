'use client';

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, MessageCircle, UserPlus, UserCheck, Clock, X } from "lucide-react";
import Link from "next/link";
import { UserSuggestion } from "@/lib/suggestions";
import { sendFriendRequest, acceptFriendRequest, unsendFriendRequest, declineFriendRequest } from "@/lib/actions/friendships";
import { toast } from "sonner";

interface SuggestionCardProps {
  user: UserSuggestion;
}

export function SuggestionCard({ user }: SuggestionCardProps) {
  const [loading, setLoading] = useState(false);
  const [friendship, setFriendship] = useState(user.friendship);

  const handleSendRequest = async () => {
    setLoading(true);
    const { error } = await sendFriendRequest(user.id);
    if (error) {
      toast.error("Erreur lors de l'envoi de l'invitation");
    } else {
      setFriendship({ status: 'PENDING', direction: 'SENT' });
      toast.success("Invitation envoyée !");
    }
    setLoading(false);
  };

  const handleAcceptRequest = async () => {
    setLoading(true);
    const { error } = await acceptFriendRequest(user.id);
    if (error) {
      toast.error("Erreur lors de l'acceptation");
    } else {
      setFriendship({ status: 'ACCEPTED', direction: 'RECEIVED' });
      toast.success("Invitation acceptée !");
    }
    setLoading(false);
  };

  const handleCancelRequest = async () => {
    setLoading(true);
    const { error } = await unsendFriendRequest(user.id);
    if (error) {
      toast.error("Erreur lors de l'annulation");
    } else {
      setFriendship(null);
      toast.info("Invitation annulée");
    }
    setLoading(false);
  };

  return (
    <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-border/50 bg-background/50 backdrop-blur-sm overflow-hidden border-2 hover:border-primary/20">
      <CardHeader className="flex flex-row items-center gap-4 p-4">
        <Avatar className="h-16 w-16 border-2 border-primary/10 group-hover:border-primary/30 transition-all shadow-lg ring-offset-background group-hover:ring-2 ring-primary/20">
          <AvatarImage src={user.avatar_url || undefined} />
          <AvatarFallback className="text-xl bg-primary/10 text-primary">
            {user.full_name?.substring(0, 2).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-bold">
              {user.full_name}
            </CardTitle>
            {user.role === 'PRO' && (
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                PRO
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            {user.city && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span>{user.city}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70 italic">
              <span>Nouveau membre sur Ro2ya</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {!friendship ? (
          <Button 
            onClick={handleSendRequest}
            disabled={loading}
            className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 group-hover:scale-[1.02] transition-transform"
          >
            <UserPlus className="h-4 w-4" />
            Inviter à discuter
          </Button>
        ) : friendship.status === 'PENDING' ? (
          friendship.direction === 'SENT' ? (
            <div className="flex gap-2">
              <Button 
                disabled
                className="flex-1 gap-2 bg-muted text-muted-foreground"
              >
                <Clock className="h-4 w-4" />
                Invitation envoyée
              </Button>
              <Button 
                variant="outline"
                size="icon"
                onClick={handleCancelRequest}
                disabled={loading}
                className="shrink-0 hover:bg-destructive/10 hover:text-destructive border-dashed"
                title="Annuler l'invitation"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button 
              onClick={handleAcceptRequest}
              disabled={loading}
              className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20"
            >
              <UserCheck className="h-4 w-4" />
              Accepter l'invitation
            </Button>
          )
        ) : friendship.status === 'ACCEPTED' ? (
          <Link href={`/messages?partnerId=${user.id}`} className="block">
            <Button className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 group-hover:scale-[1.02] transition-transform">
              <MessageCircle className="h-4 w-4" />
              Ouvrir la discussion
            </Button>
          </Link>
        ) : (
          <Button disabled className="w-full bg-muted text-muted-foreground">
            Non disponible
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
