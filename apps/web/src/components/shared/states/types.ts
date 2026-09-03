import type { ReactNode } from 'react';

import type { Permission } from '@/types/permissions';

export interface ApiErrorLike {
  message: string;
  status?: number;
  correlationId?: string;
}

export interface LoadingStateProps {
  label: string;
  variant?: 'inline' | 'block' | 'skeleton';
  rows?: number;
  className?: string;
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: { label: string; onClick: () => void; permission?: Permission };
  className?: string;
}

export interface ErrorStateProps {
  error: ApiErrorLike | Error;
  onRetry?: () => void;
  className?: string;
}

export interface ForbiddenStateProps {
  requiredPermissions: readonly Permission[];
  className?: string;
}

export interface OfflineStateProps {
  onRetry?: () => void;
  className?: string;
}
