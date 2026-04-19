import { create } from 'zustand';

export type CallStatus = 'IDLE' | 'OUTGOING' | 'INCOMING' | 'CONNECTED';

interface CallPartner {
  id: string;
  name: string;
  avatar?: string;
}

interface CallStore {
  status: CallStatus;
  partner: CallPartner | null;
  remoteStream: MediaStream | null;
  localStream: MediaStream | null;
  isMuted: boolean;
  
  setStatus: (status: CallStatus) => void;
  setPartner: (partner: CallPartner | null) => void;
  setStreams: (local: MediaStream | null, remote: MediaStream | null) => void;
  setRemoteStream: (stream: MediaStream | null) => void;
  setLocalStream: (stream: MediaStream | null) => void;
  setIsMuted: (isMuted: boolean) => void;
  
  reset: () => void;
}

export const useCallStore = create<CallStore>((set) => ({
  status: 'IDLE',
  partner: null,
  remoteStream: null,
  localStream: null,
  isMuted: false,

  setStatus: (status) => set({ status }),
  setPartner: (partner) => set({ partner }),
  setStreams: (localStream, remoteStream) => set({ localStream, remoteStream }),
  setRemoteStream: (remoteStream) => set({ remoteStream }),
  setLocalStream: (localStream) => set({ localStream }),
  setIsMuted: (isMuted) => set({ isMuted }),

  reset: () => set({
    status: 'IDLE',
    partner: null,
    remoteStream: null,
    localStream: null,
    isMuted: false,
  })
}));
