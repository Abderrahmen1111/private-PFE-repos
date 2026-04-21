'use client';

import { useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useCallStore } from '@/lib/store/use-call-store';
import { toast } from 'sonner';

export function useWebRTCCall() {
  const supabase = createClient();
  const { 
    status, 
    partner, 
    setStatus, 
    setPartner, 
    setLocalStream, 
    setRemoteStream, 
    reset,
    localStream
  } = useCallStore();

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const pendingOfferRef = useRef<RTCSessionDescriptionInit | null>(null);
  const userRef = useRef<any>(null);
  const channelRef = useRef<any>(null);

  // Configuration for WebRTC (STUN servers allow connecting across NATs)
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  const cleanup = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    pendingOfferRef.current = null;
    reset();
  }, [localStream, reset]);

  const sendSignal = useCallback((receiverId: string, type: string, payload: any = {}) => {
    if (!userRef.current) return;
    
    // Broadcast on the receiver's personal signal channel
    const signalChannel = supabase.channel(`call-signal:${receiverId}`);
    signalChannel.send({
      type: 'broadcast',
      event: 'signal',
      payload: {
        type,
        senderId: userRef.current.id,
        senderInfo: {
          id: userRef.current.id,
          name: userRef.current.user_metadata?.full_name || 'Utilisateur',
          avatar: userRef.current.user_metadata?.avatar_url
        },
        ...payload
      }
    });
  }, [supabase]);

  // Setup receiving channel
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      userRef.current = user;

      const channel = supabase.channel(`call-signal:${user.id}`);
      
      channel.on('broadcast', { event: 'signal' }, async ({ payload }) => {
        const { type, senderId, senderInfo, offer, answer, candidate } = payload;

        switch (type) {
          case 'OFFER':
            // If already in a call, reject
            const currentStatus = useCallStore.getState().status;
            if (currentStatus !== 'IDLE') {
              sendSignal(senderId, 'CALL_REJECTED');
              return;
            }
            pendingOfferRef.current = offer;
            setPartner(senderInfo);
            setStatus('INCOMING');
            // Play ringtone here if desired natively
            break;

          case 'ANSWER':
            if (pcRef.current) {
              await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
              setStatus('CONNECTED');
            }
            break;

          case 'ICE_CANDIDATE':
            if (pcRef.current && candidate) {
              try {
                await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
              } catch (e) {
                console.error("Error adding received ice candidate", e);
              }
            }
            break;

          case 'CALL_REJECTED':
            toast.error("Appel refusé", { description: "Le correspondant a refusé l'appel." });
            cleanup();
            break;

          case 'CALL_ENDED':
            toast("Appel terminé");
            cleanup();
            break;
        }
      });

      channel.subscribe();
      channelRef.current = channel;
    };

    init();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      cleanup();
    };
  }, [supabase, cleanup, sendSignal, setPartner, setStatus]);

  const createPeerConnection = useCallback((partnerId: string) => {
    const pc = new RTCPeerConnection(rtcConfig);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal(partnerId, 'ICE_CANDIDATE', { candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
        toast.error("Connexion perdue");
        cleanup();
      }
    };

    pcRef.current = pc;
    return pc;
  }, [sendSignal, setRemoteStream, cleanup, rtcConfig]);

  const startCall = useCallback(async (targetId: string, targetName: string, targetAvatar?: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setLocalStream(stream);

      const pc = createPeerConnection(targetId);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      setPartner({ id: targetId, name: targetName, avatar: targetAvatar });
      setStatus('OUTGOING');

      sendSignal(targetId, 'OFFER', { offer });
    } catch (err) {
      console.error("Call error", err);
      toast.error("Impossible de lancer l'appel", { description: "Vérifiez vos autorisations microphone." });
    }
  }, [createPeerConnection, sendSignal, setLocalStream, setPartner, setStatus]);

  const acceptCall = useCallback(async () => {
    if (!partner || !pendingOfferRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setLocalStream(stream);

      const pc = createPeerConnection(partner.id);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(pendingOfferRef.current));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      setStatus('CONNECTED');
      sendSignal(partner.id, 'ANSWER', { answer });
      
    } catch (err) {
      console.error("Accept call error", err);
      toast.error("Erreur", { description: "Impossible d'accéder au micro." });
      sendSignal(partner.id, 'CALL_REJECTED');
      cleanup();
    }
  }, [partner, createPeerConnection, sendSignal, setLocalStream, setStatus, cleanup]);

  const rejectCall = useCallback(() => {
    if (partner) {
      sendSignal(partner.id, 'CALL_REJECTED');
    }
    cleanup();
  }, [partner, sendSignal, cleanup]);

  const endCall = useCallback(() => {
    if (partner) {
      sendSignal(partner.id, 'CALL_ENDED');
    }
    cleanup();
  }, [partner, sendSignal, cleanup]);

  // Toggle Mute
  const toggleMute = useCallback(() => {
    const { localStream, isMuted, setIsMuted } = useCallStore.getState();
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = isMuted; // if previously muted, enable it (which means isMuted becomes false)
      });
      setIsMuted(!isMuted);
    }
  }, []);

  return {
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute
  };
}
