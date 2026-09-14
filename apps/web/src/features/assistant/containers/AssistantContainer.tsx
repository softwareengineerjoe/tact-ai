import { Fragment, useEffect, useRef, useState } from 'react';

import { ErrorState, LoadingState } from '@/components/shared';
import { toast } from '@/components/shared';
import { assistantService } from '@/services/assistantService';
import { cn } from '@/utils/cn';
import type { ChatMessage } from '../types';
import { useAssistantSession } from '../api/useAssistantSession';
import { useCreateSession } from '../api/useCreateSession';
import { AssistantAvatar } from '../components/AssistantAvatar';
import { AssistantWelcome } from '../components/AssistantWelcome';
import { ChatComposer } from '../components/ChatComposer';
import { ChatMessageBubble } from '../components/ChatMessageBubble';

interface AssistantContainerProps {
  /** Overrides the outer height/layout so the assistant fits its host. */
  className?: string;
}

/**
 * A locally-tracked turn. The assistant message keeps a stable id from the
 * first token through the final payload, so its bubble updates in place (no
 * remount, no re-run of the entrance animation) when streaming finishes.
 */
interface LocalTurn {
  id: string;
  user: ChatMessage;
  assistant: ChatMessage | null;
  isStreaming: boolean;
}

/** Build a client-side message shell (used for optimistic/streamed bubbles). */
function makeMessage(role: ChatMessage['role'], content: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    model_version: null,
    reasoning_summary: null,
    warnings: null,
    suggested_next_action: null,
    citations: [],
    created_at: new Date().toISOString(),
  };
}

/**
 * Owns the assistant conversation lifecycle: creates a session, renders the
 * message history with loading/empty/error states, and streams replies token by
 * token over Server-Sent Events (MASTER FR-020).
 */
export function AssistantContainer({ className }: AssistantContainerProps) {
  const createSession = useCreateSession();
  const sessionId = createSession.data?.id ?? '';
  const session = useAssistantSession(sessionId);
  const startedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [turns, setTurns] = useState<LocalTurn[]>([]);

  const isStreaming = turns.some((turn) => turn.isStreaming);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    createSession.mutate(undefined);
  }, [createSession]);

  // Abort any in-flight stream on unmount.
  useEffect(() => () => abortRef.current?.abort(), []);

  const history = session.data?.messages ?? [];

  // Keep the newest content in view as messages and stream tokens arrive.
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [history.length, turns]);

  const handleSend = (content: string) => {
    if (sessionId === '' || isStreaming) return;

    const turnId = crypto.randomUUID();
    const assistantId = crypto.randomUUID();
    const controller = new AbortController();
    abortRef.current = controller;

    setTurns((prev) => [
      ...prev,
      {
        id: turnId,
        user: makeMessage('user', content),
        assistant: null,
        isStreaming: true,
      },
    ]);

    void assistantService.streamMessage(sessionId, content, {
      signal: controller.signal,
      onToken: (text) =>
        setTurns((prev) =>
          prev.map((turn) =>
            turn.id === turnId
              ? {
                  ...turn,
                  assistant: {
                    ...(turn.assistant ?? makeMessage('assistant', '')),
                    id: assistantId,
                    content: (turn.assistant?.content ?? '') + text,
                  },
                }
              : turn,
          ),
        ),
      onDone: (message) =>
        // Keep the stable id so the bubble is reconciled in place — the final
        // payload (citations, meta) appears without a remount or flicker.
        setTurns((prev) =>
          prev.map((turn) =>
            turn.id === turnId
              ? {
                  ...turn,
                  assistant: { ...message, id: assistantId },
                  isStreaming: false,
                }
              : turn,
          ),
        ),
      onError: (error) => {
        setTurns((prev) => prev.filter((turn) => turn.id !== turnId));
        toast.error(error.message);
      },
    });
  };

  if (createSession.isError) {
    return (
      <ErrorState
        error={createSession.error}
        onRetry={() => createSession.mutate(undefined)}
      />
    );
  }

  const showWelcome = history.length === 0 && turns.length === 0;

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
        ) : showWelcome ? (
          <AssistantWelcome onPick={handleSend} />
        ) : (
          <>
            {history.map((message) => (
              <ChatMessageBubble key={message.id} message={message} />
            ))}

            {turns.map((turn) => (
              <Fragment key={turn.id}>
                <ChatMessageBubble message={turn.user} />
                {turn.assistant === null ? (
                  <ThinkingIndicator />
                ) : (
                  <ChatMessageBubble
                    key={turn.assistant.id}
                    message={turn.assistant}
                    isStreaming={turn.isStreaming}
                  />
                )}
              </Fragment>
            ))}
          </>
        )}
      </div>

      <ChatComposer onSend={handleSend} isSending={isStreaming} />
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
