'use client';

import { create } from 'zustand';

export type DrawerMode = 'reservation' | 'checkout' | null;

interface ActionDrawerState {
  isOpen: boolean;
  mode: DrawerMode;
  data: any;
  openDrawer: (mode: DrawerMode, data: any) => void;
  closeDrawer: () => void;
}

export const useActionDrawer = create<ActionDrawerState>((set) => ({
  isOpen: false,
  mode: null,
  data: null,
  openDrawer: (mode, data) => set({ isOpen: true, mode, data }),
  closeDrawer: () => set({ isOpen: false, mode: null, data: null }),
}));
