'use client';

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Check, CheckCheck } from "lucide-react";

import { AudioPlayer } from "./AudioPlayer";

interface ChatMessageProps {
  content: string;
  timestamp: string;
  isSender: boolean;
  senderName?: string;
  senderAvatar?: string;
  type?: 'text' | 'image' | 'audio' | 'file';
  attachmentUrl?: string | null;
  metadata?: any;
  isRead?: boolean;
}

export function ChatMessage({ 
  content, 
  timestamp, 
  isSender, 
  senderName, 
  senderAvatar, 
  type = 'text', 
  attachmentUrl,
  metadata,
  isRead
}: ChatMessageProps) {
  return (
    <div className={cn(
      "flex w-full mb-4 animate-in fade-in slide-in-from-bottom-2",
      isSender ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "flex max-w-[80%] group",
        isSender ? "flex-row-reverse" : "flex-row"
      )}>
        {!isSender && (
          <Avatar className="h-8 w-8 mt-auto mr-2">
            <AvatarImage src={senderAvatar} alt={senderName} />
            <AvatarFallback>{senderName?.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        )}
        
        <div className="flex flex-col">
          <div className={cn(
            "rounded-2xl text-sm transition-all duration-200 overflow-hidden",
            type === 'text' ? (
              isSender 
                ? "px-4 py-2 bg-primary text-primary-foreground rounded-br-none shadow-lg shadow-primary/20" 
                : "px-4 py-2 bg-muted text-foreground rounded-bl-none border border-border/50 backdrop-blur-sm"
            ) : "p-1"
          )}>
            {type === 'text' && content}
            
            {type === 'image' && attachmentUrl && (
              <div className="relative group/img overflow-hidden rounded-xl">
                <img 
                  src={attachmentUrl} 
                  alt="Attachment" 
                  className="max-w-[280px] max-h-[400px] object-cover rounded-xl transition-transform duration-300 group-hover/img:scale-105"
                />
                {content && (
                  <div className="p-2 text-xs bg-black/50 backdrop-blur-sm absolute bottom-0 left-0 right-0 text-white">
                    {content}
                  </div>
                )}
              </div>
            )}

            {type === 'audio' && attachmentUrl && (
              <AudioPlayer 
                url={attachmentUrl} 
                duration={metadata?.duration} 
                isSender={isSender} 
              />
            )}
          </div>
          <div className={cn(
            "flex items-center gap-1 mt-1 px-1",
            isSender ? "justify-end" : "justify-start"
          )}>
            <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              {formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: fr })}
            </span>
            {isSender && (
              <div className="flex transition-all duration-300">
                {isRead ? (
                  <CheckCheck className="h-3 w-3 text-primary animate-in zoom-in-50" />
                ) : (
                  <Check className="h-3 w-3 text-muted-foreground/50" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
