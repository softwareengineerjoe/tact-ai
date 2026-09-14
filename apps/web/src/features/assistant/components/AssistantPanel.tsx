import { useEffect, useRef } from 'react';

import { useAssistantPanelStore } from '@/stores/assistantPanelStore';
import { AssistantAvatar } from './AssistantAvatar';
import { AssistantContainer } from '../containers/AssistantContainer';

/**
 * Persistent assistant side panel available from any screen (MASTER FR-020).
 *
 * Renders a right-aligned slide-over. The conversation is only mounted while
 * open so it does not create a session in the background.
 */
export function AssistantPanel() {
  const isOpen = useAssistantPanelStore((state) => state.isOpen);
  const close = useAssistantPanelStore((state) => state.close);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [isOpen, close]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex justify-end'>
      <button
        type='button'
        aria-label='Close assistant'
        className='absolute inset-0 bg-fg/40'
        onClick={close}
      />
      <aside
        role='dialog'
        aria-modal='true'
        aria-labelledby='assistant-panel-title'
        className='relative flex h-full w-full max-w-md flex-col bg-surface shadow-lg'
      >
        <header className='flex items-center justify-between border-b border-border bg-gradient-to-r from-primary-subtle to-surface px-4 py-3'>
          <span className='flex items-center gap-2.5'>
            <AssistantAvatar size={32} still />
            <h2
              id='assistant-panel-title'
              className='text-sm font-semibold text-fg'
            >
              Tia · TACT AI
            </h2>
          </span>
          <button
            ref={closeButtonRef}
            type='button'
            onClick={close}
            aria-label='Close assistant'
            className='rounded-md px-2 py-1 text-lg leading-none text-fg-muted hover:bg-surface-muted'
          >
            ×
          </button>
        </header>
        <div className='min-h-0 flex-1 p-4'>
          <AssistantContainer className='h-full min-h-0' />
        </div>
      </aside>
    </div>
  );
}
