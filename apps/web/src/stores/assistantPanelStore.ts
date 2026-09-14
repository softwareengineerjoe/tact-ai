import { create } from 'zustand';

interface AssistantPanelState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

/** UI-only state for the persistent assistant side panel (MASTER FR-020). */
export const useAssistantPanelStore = create<AssistantPanelState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));
