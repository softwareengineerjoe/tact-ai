import { useEffect, useRef } from 'react';

import { EmptyState, ErrorState, LoadingState } from '@/components/shared';
import { toast } from '@/components/shared';
import { useAssistantSession } from '../api/useAssistantSession';
import { useCreateSession } from '../api/useCreateSession';
import { useSendMessage } from '../api/useSendMessage';
import { ChatComposer } from '../components/ChatComposer';
import { ChatMessageBubble } from '../components/ChatMessageBubble';

/**
 * Owns the assistant conversation lifecycle: creates a session, renders the
 * message history with loading/empty/error states, and sends messages.
 */
export function AssistantContainer() {
  const createSession = useCreateSession();
  const sessionId = createSession.data?.id ?? '';
  const session = useAssistantSession(sessionId);
  const sendMessage = useSendMessage();
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    createSession.mutate(undefined);
  }, [createSession]);

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

  const messages = session.data?.messages ?? [];

  return (
    <div className='flex h-[calc(100vh-16rem)] flex-col gap-4'>
      <div
        className='flex-1 space-y-3 overflow-y-auto rounded-lg border border-border bg-bg p-4'
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
          <EmptyState
            title='Ask the assistant anything'
            description='Try “Which projects are active?” or “Who is available?”'
          />
        ) : (
          messages.map((message) => (
            <ChatMessageBubble key={message.id} message={message} />
          ))
        )}

        {sendMessage.isPending ? (
          <LoadingState label='The assistant is thinking' variant='inline' />
        ) : null}
      </div>

      <ChatComposer onSend={handleSend} isSending={sendMessage.isPending} />
    </div>
  );
}
