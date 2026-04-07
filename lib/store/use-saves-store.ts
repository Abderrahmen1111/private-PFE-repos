import { create } from 'zustand';

interface SaveState {
  saveCount: number;
  hasSeenTooltip: boolean;
  incrementSave: () => void;
  markTooltipSeen: () => void;
}

export const useSavesStore = create<SaveState>((set) => ({
  saveCount: 0,
  hasSeenTooltip: false,
  incrementSave: () => set((state) => ({ saveCount: state.saveCount + 1 })),
  markTooltipSeen: () => set({ hasSeenTooltip: true }),
}));
