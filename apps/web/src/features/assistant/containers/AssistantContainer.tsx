import { useEffect, useRef } from 'react';

import { ErrorState, LoadingState } from '@/components/shared';
import { toast } from '@/components/shared';
import { cn } from '@/utils/cn';
import { useAssistantSession } from '../api/useAssistantSession';
import { useCreateSession } from '../api/useCreateSession';
import { useSendMessage } from '../api/useSendMessage';
import { AssistantAvatar } from '../components/AssistantAvatar';
import { AssistantWelcome } from '../components/AssistantWelcome';
import { ChatComposer } from '../components/ChatComposer';
import { ChatMessageBubble } from '../components/ChatMessageBubble';

interface AssistantContainerProps {
  /** Overrides the outer height/layout so the assistant fits its host. */
  className?: string;
}

/**
 * Owns the assistant conversation lifecycle: creates a session, renders the
 * message history with loading/empty/error states, and sends messages.
 */
export function AssistantContainer({ className }: AssistantContainerProps) {
  const createSession = useCreateSession();
  const sessionId = createSession.data?.id ?? '';
  const session = useAssistantSession(sessionId);
  const sendMessage = useSendMessage();
  const startedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    createSession.mutate(undefined);
  }, [createSession]);

  const messages = session.data?.messages ?? [];

  // Keep the newest message in view as the conversation grows.
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages.length, sendMessage.isPending]);

  const handleSend = (content: string) => {
    if (sessionId === '') return;
    sendMessage.mutate(
      { sessionId, content },
      { onError: (error) => toast.error(error.message) },
    );
  };

  if (createSession.isError) {
    return (
      <ErrorState
        error={createSession.error}
        onRetry={() => createSession.mutate(undefined)}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        className ?? 'h-[calc(100vh-16rem)]',
      )}
    >
      <div
        ref={scrollRef}
        className='no-scrollbar relative flex-1 space-y-4 overflow-y-auto rounded-lg border border-border bg-gradient-to-b from-surface to-primary-subtle/30 p-4 shadow-xs'
        aria-live='polite'
      >
        {createSession.isPending || session.isPending ? (
          <LoadingState
            label='Starting the assistant'
            variant='skeleton'
            rows={3}
          />
        ) : session.isError ? (
          <ErrorState error={session.error} onRetry={session.refetch} />
        ) : messages.length === 0 ? (
          <AssistantWelcome onPick={handleSend} />
        ) : (
          messages.map((message) => (
            <ChatMessageBubble key={message.id} message={message} />
          ))
        )}

        {sendMessage.isPending ? <ThinkingIndicator /> : null}
      </div>

      <ChatComposer onSend={handleSend} isSending={sendMessage.isPending} />
    </div>
  );
}

/** Mascot-led "thinking" row with animated typing dots. */
function ThinkingIndicator() {
  return (
    <div
      className='flex items-end gap-2'
      role='status'
      aria-label='The assistant is thinking'
    >
      <AssistantAvatar size={32} state='thinking' still />
      <div className='flex items-center gap-1.5 rounded-lg rounded-bl-sm border border-border bg-surface px-4 py-3 shadow-xs'>
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
