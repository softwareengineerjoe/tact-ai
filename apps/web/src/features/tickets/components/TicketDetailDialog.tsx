import { useState } from 'react';

import { cn } from '@/utils/cn';
import { PermissionGate } from '@/components/shared';
import type { TicketDetail, TicketStatus } from '@/features/tickets/types';
import { TicketStatusBadge } from './TicketStatusBadge';
import {
  ALLOWED_NEXT,
  STATUS_LABELS,
  TICKET_PRIORITY_LABELS,
  TICKET_TYPE_LABELS,
} from '../utils';

interface TicketDetailDialogProps {
  ticket: TicketDetail;
  isTransitioning: boolean;
  isCommenting: boolean;
  onTransition: (status: TicketStatus, blockerReason?: string) => void;
  onComment: (body: string) => void;
  onClose: () => void;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

/** Ticket detail drawer: content, transitions, blocker, comments, history. */
export function TicketDetailDialog({
  ticket,
  isTransitioning,
  isCommenting,
  onTransition,
  onComment,
  onClose,
}: TicketDetailDialogProps) {
  const [comment, setComment] = useState('');
  const [blockerReason, setBlockerReason] = useState('');
  const nextStatuses = ALLOWED_NEXT[ticket.status];

  const handleTransition = (status: TicketStatus) => {
    if (status === 'blocked') {
      if (blockerReason.trim() === '') return;
      onTransition(status, blockerReason.trim());
      setBlockerReason('');
    } else {
      onTransition(status);
    }
  };

  const handleComment = (event: React.FormEvent) => {
    event.preventDefault();
    if (comment.trim() === '') return;
    onComment(comment.trim());
    setComment('');
  };

  return (
    <div className='fixed inset-0 z-50 flex justify-end'>
      <div className='absolute inset-0 bg-fg/40' onClick={onClose} />
      <aside
        role='dialog'
        aria-modal='true'
        aria-labelledby='ticket-detail-title'
        className='relative flex h-full w-full max-w-xl flex-col overflow-y-auto border-l border-border bg-surface shadow-lg'
      >
        <header className='flex items-start justify-between gap-3 border-b border-border p-5'>
          <div className='space-y-1'>
            <span className='text-xs font-medium uppercase tracking-wide text-fg-muted'>
              {TICKET_TYPE_LABELS[ticket.ticket_type]} ·{' '}
              {TICKET_PRIORITY_LABELS[ticket.priority]}
            </span>
            <h2
              id='ticket-detail-title'
              className='text-lg font-semibold text-fg'
            >
              {ticket.title}
            </h2>
            <TicketStatusBadge status={ticket.status} />
          </div>
          <button
            type='button'
            onClick={onClose}
            className='rounded-md p-1 text-fg-muted transition-colors hover:bg-surface-muted'
            aria-label='Close'
          >
            ✕
          </button>
        </header>

        <div className='flex-1 space-y-6 p-5'>
          {ticket.description ? (
            <p className='whitespace-pre-wrap text-sm text-fg-body'>
              {ticket.description}
            </p>
          ) : (
            <p className='text-sm text-fg-muted'>No description.</p>
          )}

          <dl className='grid grid-cols-2 gap-3 text-sm'>
            <div>
              <dt className='text-xs text-fg-muted'>Assignee</dt>
              <dd className='text-fg-body'>{ticket.assignee_name ?? '—'}</dd>
            </div>
            <div>
              <dt className='text-xs text-fg-muted'>Reviewer</dt>
              <dd className='text-fg-body'>{ticket.reviewer_name ?? '—'}</dd>
            </div>
            <div>
              <dt className='text-xs text-fg-muted'>Story points</dt>
              <dd className='text-fg-body tabular-nums'>
                {ticket.story_points ?? '—'}
              </dd>
            </div>
            <div>
              <dt className='text-xs text-fg-muted'>Due date</dt>
              <dd className='text-fg-body'>
                {ticket.due_date
                  ? new Date(ticket.due_date).toLocaleDateString()
                  : '—'}
              </dd>
            </div>
          </dl>

          {ticket.status === 'blocked' && ticket.blocker_reason ? (
            <div className='rounded-md border border-danger/30 bg-[#FBECEC] p-3 text-sm text-danger'>
              <span className='font-medium'>Blocked:</span>{' '}
              {ticket.blocker_reason}
            </div>
          ) : null}

          {/* Transitions */}
          <PermissionGate permission='tickets.transition'>
            {nextStatuses.length > 0 ? (
              <section className='space-y-2'>
                <h3 className='text-sm font-semibold text-fg'>Move to</h3>
                {nextStatuses.includes('blocked') ? (
                  <input
                    value={blockerReason}
                    onChange={(event) => setBlockerReason(event.target.value)}
                    placeholder='Blocker reason (required to block)'
                    className='w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm text-fg-body focus:outline-none focus:ring-2 focus:ring-primary-hover'
                  />
                ) : null}
                <div className='flex flex-wrap gap-2'>
                  {nextStatuses.map((status) => {
                    const isBlock = status === 'blocked';
                    const disabled =
                      isTransitioning ||
                      (isBlock && blockerReason.trim() === '');
                    return (
                      <button
                        key={status}
                        type='button'
                        onClick={() => handleTransition(status)}
                        disabled={disabled}
                        className={cn(
                          'h-8 rounded-md border px-3 text-xs font-medium transition-colors disabled:opacity-50',
                          status === 'cancelled'
                            ? 'border-border bg-surface text-fg-muted hover:bg-surface-muted'
                            : 'border-primary bg-primary text-primary-fg hover:bg-primary-hover',
                        )}
                      >
                        {STATUS_LABELS[status]}
                      </button>
                    );
                  })}
                </div>
              </section>
            ) : null}
          </PermissionGate>

          {/* Activity history */}
          <section className='space-y-2'>
            <h3 className='text-sm font-semibold text-fg'>Activity</h3>
            {ticket.activity.length === 0 ? (
              <p className='text-xs text-fg-muted'>No activity yet.</p>
            ) : (
              <ul className='space-y-1.5'>
                {ticket.activity.map((entry) => (
                  <li
                    key={entry.id}
                    className='flex items-baseline justify-between gap-3 text-xs'
                  >
                    <span className='text-fg-body'>
                      {entry.action}
                      {entry.detail ? (
                        <span className='text-fg-muted'> · {entry.detail}</span>
                      ) : null}
                    </span>
                    <span className='shrink-0 text-fg-muted'>
                      {formatDateTime(entry.created_at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Comments */}
          <section className='space-y-3'>
            <h3 className='text-sm font-semibold text-fg'>Comments</h3>
            {ticket.comments.length === 0 ? (
              <p className='text-xs text-fg-muted'>No comments yet.</p>
            ) : (
              <ul className='space-y-2'>
                {ticket.comments.map((entry) => (
                  <li
                    key={entry.id}
                    className='rounded-md border border-border bg-surface p-3'
                  >
                    <p className='text-sm text-fg-body'>{entry.body}</p>
                    <p className='mt-1 text-xs text-fg-muted'>
                      {formatDateTime(entry.created_at)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <form onSubmit={handleComment} className='space-y-2'>
              <label htmlFor='ticket-comment' className='sr-only'>
                Add a comment
              </label>
              <textarea
                id='ticket-comment'
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                rows={2}
                placeholder='Add a comment'
                className='w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm text-fg-body focus:outline-none focus:ring-2 focus:ring-primary-hover'
              />
              <div className='flex justify-end'>
                <button
                  type='submit'
                  disabled={isCommenting || comment.trim() === ''}
                  className='h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-fg transition-colors hover:bg-primary-hover disabled:opacity-60'
                >
                  Comment
                </button>
              </div>
            </form>
          </section>
        </div>
      </aside>
    </div>
  );
}
