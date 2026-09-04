import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ChatMessageBubble } from '@/features/assistant/components/ChatMessageBubble';
import type { ChatMessage } from '@/features/assistant/types';

function makeMessage(overrides: Partial<ChatMessage>): ChatMessage {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    role: 'assistant',
    content: 'I found 2 projects: Atlas, Orion.',
    model_version: 'local-deterministic',
    reasoning_summary: null,
    warnings: null,
    suggested_next_action: null,
    citations: [],
    created_at: '2026-09-05T08:00:00.000Z',
    ...overrides,
  };
}

describe('ChatMessageBubble', () => {
  it('renders assistant content with its sources and model metadata', () => {
    render(
      <ChatMessageBubble
        message={makeMessage({
          citations: [
            { source_type: 'project', source_id: 'p1', label: 'Atlas' },
          ],
        })}
      />,
    );

    expect(screen.getByText(/I found 2 projects/)).toBeInTheDocument();
    expect(screen.getByText(/Sources:/)).toBeInTheDocument();
    expect(screen.getByText(/local-deterministic/)).toBeInTheDocument();
  });

  it('surfaces warnings from the assistant answer', () => {
    render(
      <ChatMessageBubble
        message={makeMessage({
          warnings: ['The AI service was unavailable; used a local fallback.'],
        })}
      />,
    );

    expect(screen.getByText(/used a local fallback/)).toBeInTheDocument();
  });

  it('renders a user message aligned to the user role', () => {
    render(
      <ChatMessageBubble
        message={makeMessage({
          role: 'user',
          content: 'Which projects are active?',
        })}
      />,
    );

    expect(screen.getByTestId('chat-message-user')).toBeInTheDocument();
    expect(screen.getByText('Which projects are active?')).toBeInTheDocument();
  });
});
