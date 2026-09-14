import { cn } from '@/utils/cn';
import type { ChatMessage } from '@/features/assistant/types';
import { AssistantAvatar } from './AssistantAvatar';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  /** While true, show a blinking caret and hide the (not-yet-final) metadata. */
  isStreaming?: boolean;
}

/** Presentational chat bubble: user on the right (green wash), assistant on white with the Tia mascot. */
export function ChatMessageBubble({
  message,
  isStreaming = false,
}: ChatMessageBubbleProps) {
  const isUser = message.role === 'user';
  return (
    <div
      className={cn(
        'animate-rise-in flex items-end gap-2',
        isUser ? 'justify-end' : 'justify-start',
      )}
      data-testid={`chat-message-${message.role}`}
    >
      {!isUser ? (
        <AssistantAvatar size={32} still className='mb-0.5 shrink-0' />
      ) : null}
      <div
        className={cn(
          'max-w-[75%] rounded-2xl border p-3.5 text-sm shadow-xs',
          isUser
            ? 'rounded-br-sm border-primary/20 bg-primary text-primary-fg'
            : 'rounded-bl-sm border-border bg-surface text-fg-body',
        )}
      >
        <p className='whitespace-pre-wrap leading-relaxed'>
          {message.content}
          {isStreaming ? (
            <span
              aria-hidden
              className='ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-primary align-middle'
            />
          ) : null}
        </p>

        {message.role === 'assistant' && !isStreaming ? (
          <AssistantMeta message={message} />
        ) : null}
      </div>
    </div>
  );
}

function AssistantMeta({ message }: { message: ChatMessage }) {
  const hasCitations = message.citations.length > 0;
  const hasWarnings = (message.warnings?.length ?? 0) > 0;

  if (
    !hasCitations &&
    !hasWarnings &&
    !message.reasoning_summary &&
    !message.suggested_next_action &&
    !message.model_version
  ) {
    return null;
  }

  return (
    <div className='mt-2 space-y-1 border-t border-border pt-2 text-xs text-fg-muted'>
      {message.reasoning_summary ? (
        <p>
          <span className='font-medium'>Reasoning:</span>{' '}
          {message.reasoning_summary}
        </p>
      ) : null}

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
