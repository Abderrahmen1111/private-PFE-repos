'use client';

import { useEffect, useRef, useState } from 'react';
import { useCallStore } from '@/lib/store/use-call-store';
import { useWebRTCCall } from '@/hooks/useWebRTCCall';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Phone, PhoneOff, Mic, MicOff, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CallOverlay() {
  const { status, partner, remoteStream, isMuted } = useCallStore();
  const { acceptCall, rejectCall, endCall, toggleMute } = useWebRTCCall();
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [callDuration, setCallDuration] = useState(0);

  // Play remote stream
  useEffect(() => {
    if (audioRef.current && remoteStream) {
      audioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Duration Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'CONNECTED') {
      setCallDuration(0);
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [status]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (status === 'IDLE' || !partner) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-xl animate-in fade-in duration-300">
      <audio ref={audioRef} autoPlay />
      {/* We can play a ringing sound if INCOMING using another audio tag here */}
      {status === 'INCOMING' && (
        <audio src="/sounds/ringtone.mp3" autoPlay loop className="hidden" />
      )}
      {status === 'OUTGOING' && (
        <audio src="/sounds/calling.mp3" autoPlay loop className="hidden" />
      )}

      <div className="w-full max-w-sm overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-card to-background shadow-2xl ring-1 ring-white/5 animate-in zoom-in-95 duration-300">
        
        {/* Top Glow */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary/40 via-primary to-primary/40" />

        <div className="flex flex-col items-center p-10 text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">{partner.name}</h2>
            <p className={cn(
              "text-sm font-medium",
              status === 'CONNECTED' ? "text-green-500" : "text-muted-foreground animate-pulse"
            )}>
              {status === 'INCOMING' && 'Appel entrant...'}
              {status === 'OUTGOING' && 'Appel en cours...'}
              {status === 'CONNECTED' && formatDuration(callDuration)}
            </p>
          </div>

          <div className="relative">
            {/* Ripple effect when calling */}
            {status !== 'CONNECTED' && (
              <>
                <div className="absolute inset-0 rounded-full border border-primary/30 animate-ping" style={{ animationDuration: '3s' }} />
                <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping delay-150" style={{ animationDuration: '3s' }} />
              </>
            )}
            
            {/* Audio visualization when connected */}
            {status === 'CONNECTED' && (
               <div className="absolute -inset-4 rounded-full border border-green-500/20 animate-spin-slow" style={{ borderStyle: 'dashed' }} />
            )}

            <Avatar className="h-32 w-32 ring-4 ring-background shadow-2xl relative z-10">
              <AvatarImage src={partner.avatar} />
              <AvatarFallback className="text-4xl">{partner.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            
            {status === 'CONNECTED' && (
              <div className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-green-500 ring-4 ring-background flex items-center justify-center z-20">
                <Volume2 className="h-4 w-4 text-white" />
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-6 pt-8 w-full">
            {status === 'INCOMING' ? (
              <>
                <Button 
                  onClick={rejectCall}
                  className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-transform hover:scale-110"
                >
                  <PhoneOff className="h-7 w-7 text-white" />
                </Button>
                <Button 
                  onClick={acceptCall}
                  className="h-16 w-16 rounded-full bg-green-500 hover:bg-green-600 shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-transform hover:scale-110 animate-bounce"
                >
                  <Phone className="h-7 w-7 text-white fill-current" />
                </Button>
              </>
            ) : (
              <>
                <Button 
                  onClick={toggleMute}
                  variant="outline"
                  className={cn(
                    "h-14 w-14 rounded-full border-none shadow-lg transition-transform hover:scale-110",
                    isMuted ? "bg-muted text-foreground" : "bg-primary/10 text-primary"
                  )}
                >
                  {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                </Button>
                
                <Button 
                  onClick={endCall}
                  className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-transform hover:scale-110"
                >
                  <PhoneOff className="h-7 w-7 text-white" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
