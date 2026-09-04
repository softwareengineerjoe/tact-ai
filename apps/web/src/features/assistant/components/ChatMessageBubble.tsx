import { cn } from '@/utils/cn';
import type { ChatMessage } from '@/features/assistant/types';

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

/** Presentational chat bubble: user on the right (green wash), assistant on white. */
export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isUser = message.role === 'user';
  return (
    <div
      className={cn('flex', isUser ? 'justify-end' : 'justify-start')}
      data-testid={`chat-message-${message.role}`}
    >
      <div
        className={cn(
          'max-w-[75%] rounded-lg border p-3 text-sm',
          isUser
            ? 'border-primary-subtle bg-primary-subtle text-fg-body'
            : 'border-border bg-surface text-fg-body',
        )}
      >
        <p className='whitespace-pre-wrap'>{message.content}</p>

        {message.role === 'assistant' ? (
          <AssistantMeta message={message} />
        ) : null}
      </div>
    </div>
  );
}

function AssistantMeta({ message }: ChatMessageBubbleProps) {
  const hasCitations = message.citations.length > 0;
  const hasWarnings = (message.warnings?.length ?? 0) > 0;

  if (
    !hasCitations &&
    !hasWarnings &&
    !message.suggested_next_action &&
    !message.model_version
  ) {
    return null;
  }

  return (
    <div className='mt-2 space-y-1 border-t border-border pt-2 text-xs text-fg-muted'>
      {hasCitations ? (
        <p>
          <span className='font-medium'>Sources:</span>{' '}
          {message.citations.map((c) => c.label).join(', ')}
        </p>
      ) : null}

      {message.suggested_next_action ? (
        <p>
          <span className='font-medium'>Next:</span>{' '}
          {message.suggested_next_action}
        </p>
      ) : null}

      {hasWarnings ? (
        <ul className='list-inside list-disc text-warning' role='status'>
          {message.warnings?.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      ) : null}

      {message.model_version ? (
        <p className='text-fg-muted'>Model: {message.model_version}</p>
      ) : null}
    </div>
  );
}
