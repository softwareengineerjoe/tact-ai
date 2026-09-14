import { create } from 'zustand';

/**
 * UI-only state for the guided demo tutorial (a cross-page overlay tour).
 * Holds no server data. Completion is persisted to localStorage so the tour
 * auto-starts once per demo but can always be relaunched from the top bar.
 */
const STORAGE_KEY = 'tact-ai.tutorial-done';
const START_REQUEST_KEY = 'tact-ai.tutorial-start';

interface TutorialState {
  isActive: boolean;
  stepIndex: number;
  /** Total steps for the *current* run, set when the tour starts. */
  totalSteps: number;
  start: (totalSteps: number) => void;
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
  stop: (options?: { completed?: boolean }) => void;
}

export function hasCompletedTutorial(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function markCompleted(): void {
  try {
    localStorage.setItem(STORAGE_KEY, 'true');
  } catch {
    // Ignore storage failures — the tour simply won't remember completion.
  }
}

/**
 * Ask the tour to start after the next full navigation (e.g. entering the demo
 * from the landing page, which reloads the app). Consumed once by the launcher.
 */
export function requestTutorialStart(): void {
  try {
    sessionStorage.setItem(START_REQUEST_KEY, 'true');
  } catch {
    // Ignore — the tour just won't auto-start on entry.
  }
}

/** Consume a pending start request, returning whether one was set. */
export function consumeTutorialStartRequest(): boolean {
  try {
    const requested = sessionStorage.getItem(START_REQUEST_KEY) === 'true';
    if (requested) sessionStorage.removeItem(START_REQUEST_KEY);
    return requested;
  } catch {
    return false;
  }
}

export const useTutorialStore = create<TutorialState>((set, get) => ({
  isActive: false,
  stepIndex: 0,
  totalSteps: 0,
  start: (totalSteps) => set({ isActive: true, stepIndex: 0, totalSteps }),
  next: () => {
    const { stepIndex, totalSteps } = get();
    if (stepIndex >= totalSteps - 1) {
      markCompleted();
      set({ isActive: false });
      return;
    }
    set({ stepIndex: stepIndex + 1 });
  },
  prev: () => set((s) => ({ stepIndex: Math.max(0, s.stepIndex - 1) })),
  goTo: (index) => set({ stepIndex: index }),
  stop: (options) => {
    if (options?.completed) markCompleted();
    set({ isActive: false });
  },
}));
