import { useEffect, useId, useRef, useState } from 'react';

import { AssistantAvatar } from '@/features/assistant';
import { cn } from '@/utils/cn';

import { GUIDE_ENTRIES, answerQuestion } from '../knowledge';

interface GuideMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  offersDemo?: boolean;
  /** While true, the bubble shows a caret and hides the demo button. */
  typing?: boolean;
}

interface LandingGuideProps {
  /** Enter the demo (the landing page chooses a role and navigates). */
  onTryDemo: () => void;
  className?: string;
}

const WELCOME: GuideMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Hi, I\u2019m Tia \u2014 your guide to TACT AI. Ask me what it does, how teams and projects work, or how to get started. When you\u2019re ready, I\u2019ll point you to the demo.',
  offersDemo: true,
};

// A short, friendly set of starter prompts (not the whole catalog).
const STARTERS = GUIDE_ENTRIES.slice(0, 4);

/**
 * "Tia" on the public landing page: a self-contained, account-free companion
 * that answers general questions about TACT AI and nudges visitors to the demo.
 * It matches questions against a curated local knowledge base and never calls
 * the backend, so it can only ever share public product information.
 */
export function LandingGuide({ onTryDemo, className }: LandingGuideProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<GuideMessage[]>([WELCOME]);
  const [value, setValue] = useState('');
  // Tia "thinks" briefly, then types her reply out — so answers never feel
  // instant or pre-scripted.
  const [isThinking, setIsThinking] = useState(false);

  const panelId = useId();
  const titleId = useId();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const isBusy = isThinking || messages.some((message) => message.typing);

  // Clear every scheduled timer (used on unmount and when replaying).
  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };
  useEffect(() => clearTimers, []);

  // Keep the latest message in view and focus the field when opening.
  useEffect(() => {
    if (!isOpen) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    inputRef.current?.focus();
  }, [isOpen, messages, isThinking]);

  // Close on Escape and return focus to the launcher.
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        launcherRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  const ask = (question: string) => {
    const trimmed = question.trim();
    if (trimmed === '' || isBusy) return;

    const reply = answerQuestion(trimmed);
    const stamp = Date.now();
    setMessages((prev) => [
      ...prev,
      { id: `u-${stamp}`, role: 'user', content: trimmed },
    ]);
    setValue('');

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    const assistantId = `a-${stamp}`;

    // A pause that scales gently with answer length, plus a little jitter, so
    // no two replies land at exactly the same beat.
    const thinkMs = reduceMotion
      ? 250
      : 500 + Math.min(reply.answer.length * 5, 900) + Math.random() * 350;

    setIsThinking(true);
    timersRef.current.push(
      setTimeout(() => {
        setIsThinking(false);

        if (reduceMotion) {
          setMessages((prev) => [
            ...prev,
            {
              id: assistantId,
              role: 'assistant',
              content: reply.answer,
              offersDemo: reply.offersDemo,
            },
          ]);
          return;
        }

        // Mount the assistant bubble once, then reveal its text in place so it
        // never remounts (and never blinks) when it finishes.
        setMessages((prev) => [
          ...prev,
          { id: assistantId, role: 'assistant', content: '', typing: true },
        ]);

        let index = 0;
        const type = () => {
          index = Math.min(index + 3, reply.answer.length);
          const done = index >= reply.answer.length;
          setMessages((prev) =>
            prev.map((message) =>
              message.id === assistantId
                ? {
                    ...message,
                    content: reply.answer.slice(0, index),
                    typing: !done,
                    offersDemo: done ? reply.offersDemo : undefined,
                  }
                : message,
            ),
          );
          if (!done) {
            timersRef.current.push(setTimeout(type, 16));
          }
        };
        type();
      }, thinkMs),
    );
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    ask(value);
  };

  return (
    <div className={cn('fixed bottom-5 right-5 z-50 print:hidden', className)}>
      {isOpen ? (
        <section
          id={panelId}
          role='dialog'
          aria-modal='false'
          aria-labelledby={titleId}
          className='animate-rise-in flex h-[32rem] max-h-[calc(100vh-5rem)] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-lg border border-border bg-surface text-fg-body shadow-lg'
        >
          {/* Header */}
          <header className='relative flex items-center gap-3 overflow-hidden bg-gradient-to-br from-primary-active via-[#0c4030] to-[#08301f] px-4 py-3.5 text-primary-fg'>
            <AssistantAvatar size={40} still className='shrink-0' />
            <div className='min-w-0 flex-1'>
              <p id={titleId} className='text-sm font-semibold leading-tight'>
                Tia · TACT AI guide
              </p>
              <p className='truncate text-xs text-primary-fg/70'>
                General questions · no account needed
              </p>
            </div>
            <button
              type='button'
              onClick={() => {
                setIsOpen(false);
                launcherRef.current?.focus();
              }}
              aria-label='Close Tia'
              className='flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-primary-fg/80 transition-colors hover:bg-primary-fg/10 hover:text-primary-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-fg/70'
            >
              <CloseIcon />
            </button>
          </header>

          {/* Messages */}
          <div
            ref={scrollRef}
            className='no-scrollbar flex-1 space-y-3 overflow-y-auto bg-bg/60 p-3'
          >
            {messages.map((message) => (
              <GuideBubble
                key={message.id}
                message={message}
                onTryDemo={onTryDemo}
              />
            ))}

            {isThinking ? <GuideTyping /> : null}

            {/* Starter prompts appear until the visitor asks something. */}
            {messages.length === 1 && !isBusy ? (
              <div className='space-y-1.5 pt-1'>
                <p className='px-1 text-xs font-medium text-fg-muted'>
                  Try asking…
                </p>
                <div className='flex flex-wrap gap-1.5'>
                  {STARTERS.map((entry) => (
                    <button
                      key={entry.id}
                      type='button'
                      onClick={() => ask(entry.question)}
                      className='rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-fg-body transition-colors hover:border-primary/40 hover:bg-primary-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-hover'
                    >
                      {entry.question}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Composer */}
          <form
            onSubmit={handleSubmit}
            className='flex items-center gap-2 border-t border-border bg-surface p-2.5'
          >
            <label htmlFor={`${panelId}-input`} className='sr-only'>
              Ask Tia about TACT AI
            </label>
            <input
              id={`${panelId}-input`}
              ref={inputRef}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder='Ask about TACT AI…'
              className='h-10 flex-1 rounded-md border border-border bg-surface px-3 text-sm text-fg-body placeholder:text-fg-muted focus:border-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-hover'
            />
            <button
              type='submit'
              disabled={value.trim() === '' || isBusy}
              aria-label='Send'
              className='flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-fg transition-colors hover:bg-primary-hover disabled:bg-surface-muted disabled:text-fg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-hover focus-visible:ring-offset-2 focus-visible:ring-offset-surface'
            >
              <SendIcon />
            </button>
          </form>
        </section>
      ) : null}

      {/* Launcher */}
      <button
        ref={launcherRef}
        type='button'
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className={cn(
          'group flex items-center gap-2 rounded-full border border-primary/30 bg-surface py-2 pl-2 pr-4 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-hover focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
          isOpen && 'hidden',
        )}
      >
        <AssistantAvatar size={36} still className='shrink-0' />
        <span className='text-sm font-semibold text-fg-body'>Ask Tia</span>
      </button>
    </div>
  );
}

/** Tia's "thinking" row: mascot + three animated typing dots. */
function GuideTyping() {
  return (
    <div
      className='flex items-end gap-2'
      role='status'
      aria-label='Tia is typing'
    >
      <AssistantAvatar size={26} still className='mb-0.5 shrink-0' />
      <div className='flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-border bg-surface px-3.5 py-3 shadow-xs'>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className='h-2 w-2 rounded-full bg-primary'
            style={{
              animation: 'tia-typing 1.2s ease-in-out infinite',
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function GuideBubble({
  message,
  onTryDemo,
}: {
  message: GuideMessage;
  onTryDemo: () => void;
}) {
  const isUser = message.role === 'user';
  return (
    <div
      className={cn(
        'animate-rise-in flex items-end gap-2',
        isUser ? 'justify-end' : 'justify-start',
      )}
    >
      {!isUser ? (
        <AssistantAvatar size={26} still className='mb-0.5 shrink-0' />
      ) : null}
      <div
        className={cn(
          'max-w-[80%] rounded-2xl border p-3 text-sm shadow-xs',
          isUser
            ? 'rounded-br-sm border-primary/20 bg-primary text-primary-fg'
            : 'rounded-bl-sm border-border bg-surface text-fg-body',
        )}
      >
        <p className='whitespace-pre-wrap leading-relaxed'>
          {message.content}
          {message.typing ? (
            <span
              aria-hidden
              className='ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-primary align-middle'
            />
          ) : null}
        </p>
        {!isUser && message.offersDemo ? (
          <button
            type='button'
            onClick={onTryDemo}
            className='mt-2.5 inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-fg transition-colors hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-hover focus-visible:ring-offset-2 focus-visible:ring-offset-surface'
          >
            Try the demo
            <span aria-hidden>→</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox='0 0 24 24'
      className='h-5 w-5'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden
    >
      <path d='M18 6 6 18M6 6l12 12' />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      viewBox='0 0 24 24'
      className='h-5 w-5'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden
    >
      <path d='m22 2-7 20-4-9-9-4Z' />
      <path d='M22 2 11 13' />
    </svg>
  );
}
