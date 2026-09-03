export type ToastTone = 'success' | 'error';

export interface ToastItem {
  id: string;
  message: string;
  tone: ToastTone;
}

type Listener = () => void;

const listeners = new Set<Listener>();
let toasts: ToastItem[] = [];

function emit(): void {
  for (const listener of listeners) listener();
}

function dismiss(id: string): void {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

function push(message: string, tone: ToastTone): void {
  const id = crypto.randomUUID();
  toasts = [...toasts, { id, message, tone }];
  emit();
  window.setTimeout(() => dismiss(id), 4000);
}

export function subscribeToasts(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getToasts(): ToastItem[] {
  return toasts;
}

/** Fire-and-forget toast API used by mutations (FRONTEND_STANDARDS §13A). */
export const toast = {
  success: (message: string) => push(message, 'success'),
  error: (message: string) => push(message, 'error'),
};
