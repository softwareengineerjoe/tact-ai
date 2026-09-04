import type { Feedback } from '@/features/feedback/types';
import { FeedbackCard } from './FeedbackCard';

interface FeedbackListProps {
  items: readonly Feedback[];
  acknowledgingId: string | null;
  onAcknowledge: (feedback: Feedback) => void;
  onEdit: (feedback: Feedback) => void;
  onDelete: (feedback: Feedback) => void;
}

/** Renders the project's feedback entries, newest first. */
export function FeedbackList({
  items,
  acknowledgingId,
  onAcknowledge,
  onEdit,
  onDelete,
}: FeedbackListProps) {
  return (
    <ul className='space-y-3'>
      {items.map((feedback) => (
        <li key={feedback.id}>
          <FeedbackCard
            feedback={feedback}
            isAcknowledging={acknowledgingId === feedback.id}
            onAcknowledge={onAcknowledge}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </li>
      ))}
    </ul>
  );
}
