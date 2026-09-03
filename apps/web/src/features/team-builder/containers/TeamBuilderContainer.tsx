import { useMemo, useState } from 'react';

import {
  ConfirmDialog,
  EmptyState,
  ErrorState,
  ForbiddenState,
  LoadingState,
  toast,
} from '@/components/shared';
import { useProjectRequirements } from '@/features/team-builder/api/useProjectRequirements';
import { useProjectTeam } from '@/features/team-builder/api/useProjectTeam';
import { useRecommendations } from '@/features/team-builder/api/useRecommendations';
import { useReserveEmployee } from '@/features/team-builder/api/useReserveEmployee';
import { useAssignEmployee } from '@/features/team-builder/api/useAssignEmployee';
import { useRemoveAssignment } from '@/features/team-builder/api/useRemoveAssignment';
import { CandidateTable } from '@/features/team-builder/components/CandidateTable';
import { TeamRoster } from '@/features/team-builder/components/TeamRoster';
import type {
  Assignment,
  RecommendationCandidate,
  RecommendationParams,
} from '@/features/team-builder/types';

interface TeamBuilderContainerProps {
  projectId: string;
}

function isoAtMidnight(date: string): string {
  return new Date(`${date}T00:00:00.000Z`).toISOString();
}

function defaultDate(offsetDays: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

/** Owns Team Builder data, selection state, and the assign/reserve lifecycle. */
export function TeamBuilderContainer({ projectId }: TeamBuilderContainerProps) {
  const requirements = useProjectRequirements(projectId);
  const roster = useProjectTeam(projectId);

  const [roleId, setRoleId] = useState<string | null>(null);
  const [periodStart, setPeriodStart] = useState(() => defaultDate(0));
  const [periodEnd, setPeriodEnd] = useState(() => defaultDate(90));
  const [toAssign, setToAssign] = useState<RecommendationCandidate | null>(
    null,
  );
  const [toRemove, setToRemove] = useState<Assignment | null>(null);

  const reserve = useReserveEmployee(projectId);
  const assign = useAssignEmployee(projectId);
  const remove = useRemoveAssignment(projectId);

  const recommendationParams = useMemo<RecommendationParams | null>(() => {
    if (!roleId) return null;
    return {
      projectId,
      roleRequirementId: roleId,
      periodStart: isoAtMidnight(periodStart),
      periodEnd: isoAtMidnight(periodEnd),
      limit: 10,
    };
  }, [projectId, roleId, periodStart, periodEnd]);

  const recommendations = useRecommendations(recommendationParams);

  const selectedRole = requirements.data?.find((r) => r.id === roleId) ?? null;

  const handleReserve = (candidate: RecommendationCandidate) => {
    const expiresAt = new Date();
    expiresAt.setUTCDate(expiresAt.getUTCDate() + 7);
    reserve.mutate(
      {
        projectId,
        roleRequirementId: candidate.role_requirement_id,
        employeeId: candidate.employee_id,
        allocationPercent: selectedRole?.allocation_percent ?? 100,
        expiresAt: expiresAt.toISOString(),
      },
      {
        onSuccess: () => toast.success(`Reserved ${candidate.display_name}`),
        onError: (error) => toast.error(error.message),
      },
    );
  };

  const handleAssignConfirm = () => {
    if (!toAssign) return;
    assign.mutate(
      {
        projectId,
        roleRequirementId: toAssign.role_requirement_id,
        employeeId: toAssign.employee_id,
        allocationPercent: selectedRole?.allocation_percent ?? 100,
        startDate: isoAtMidnight(periodStart),
        endDate: isoAtMidnight(periodEnd),
      },
      {
        onSuccess: (result) => {
          toast.success(`Assigned ${toAssign.display_name}`);
          for (const warning of result.warnings) toast.error(warning);
          setToAssign(null);
        },
        onError: (error) => {
          toast.error(error.message);
          setToAssign(null);
        },
      },
    );
  };

  const handleRemoveConfirm = () => {
    if (!toRemove) return;
    const name = toRemove.employee_display_name ?? 'team member';
    remove.mutate(
      {
        projectId,
        assignmentId: toRemove.id,
        version: toRemove.version,
      },
      {
        onSuccess: () => {
          toast.success(`Removed ${name} from the team`);
          setToRemove(null);
        },
        onError: (error) => {
          toast.error(error.message);
          setToRemove(null);
        },
      },
    );
  };

  // --- Requirements lifecycle (drives the role selector) ---
  if (requirements.isPending) {
    return <LoadingState label='Loading roles' variant='skeleton' rows={2} />;
  }
  if (requirements.isError && requirements.error.status === 403) {
    return <ForbiddenState requiredPermissions={['projects.view']} />;
  }
  if (requirements.isError) {
    return (
      <ErrorState
        error={requirements.error}
        onRetry={() => void requirements.refetch()}
      />
    );
  }
  if (requirements.data.length === 0) {
    return (
      <EmptyState
        title='No role requirements yet'
        description='Define the roles and skills this project needs before building a team.'
      />
    );
  }

  return (
    <div className='space-y-6'>
      <section aria-labelledby='tb-role-heading' className='space-y-3'>
        <h2 id='tb-role-heading' className='text-base font-semibold text-fg'>
          1. Choose a role and period
        </h2>
        <div className='flex flex-wrap gap-2'>
          {requirements.data.map((requirement) => (
            <button
              key={requirement.id}
              type='button'
              onClick={() => setRoleId(requirement.id)}
              aria-pressed={roleId === requirement.id}
              className={
                roleId === requirement.id
                  ? 'rounded-md border border-primary bg-primary-subtle px-3 py-1.5 text-sm font-medium text-primary'
                  : 'rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-fg-body transition-colors hover:bg-surface-muted'
              }
            >
              {requirement.role_name}
              <span className='ml-1.5 text-xs text-fg-muted'>
                ×{requirement.headcount}
              </span>
            </button>
          ))}
        </div>
        <div className='flex flex-wrap items-end gap-4'>
          <div>
            <label
              htmlFor='tb-start'
              className='mb-1 block text-xs font-medium text-fg-muted'
            >
              Period start
            </label>
            <input
              id='tb-start'
              type='date'
              value={periodStart}
              onChange={(event) => setPeriodStart(event.target.value)}
              className='h-10 rounded-sm border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-hover'
            />
          </div>
          <div>
            <label
              htmlFor='tb-end'
              className='mb-1 block text-xs font-medium text-fg-muted'
            >
              Period end
            </label>
            <input
              id='tb-end'
              type='date'
              value={periodEnd}
              onChange={(event) => setPeriodEnd(event.target.value)}
              className='h-10 rounded-sm border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-hover'
            />
          </div>
        </div>
      </section>

      <section aria-labelledby='tb-candidates-heading' className='space-y-3'>
        <h2
          id='tb-candidates-heading'
          className='text-base font-semibold text-fg'
        >
          2. Recommended candidates
        </h2>
        {!recommendationParams ? (
          <EmptyState
            title='Select a role to see recommendations'
            description='Pick a role above to run the deterministic Project Fit Score.'
          />
        ) : recommendations.isPending ? (
          <LoadingState
            label='Scoring candidates'
            variant='skeleton'
            rows={3}
          />
        ) : recommendations.isError && recommendations.error.status === 403 ? (
          <ForbiddenState requiredPermissions={['team.recommend']} />
        ) : recommendations.isError ? (
          <ErrorState
            error={recommendations.error}
            onRetry={() => void recommendations.refetch()}
          />
        ) : recommendations.data.length === 0 ? (
          <EmptyState
            title='No eligible candidates'
            description='No active employee has matching skills and remaining capacity in this period.'
          />
        ) : (
          <CandidateTable
            candidates={recommendations.data}
            pendingEmployeeId={
              reserve.isPending
                ? reserve.variables?.employeeId
                : assign.isPending
                  ? toAssign?.employee_id
                  : undefined
            }
            onReserve={handleReserve}
            onAssign={setToAssign}
          />
        )}
      </section>

      <section aria-labelledby='tb-roster-heading' className='space-y-3'>
        <h2 id='tb-roster-heading' className='text-base font-semibold text-fg'>
          3. Current team
        </h2>
        {roster.isPending ? (
          <LoadingState label='Loading team' variant='skeleton' rows={2} />
        ) : roster.isError ? (
          <ErrorState
            error={roster.error}
            onRetry={() => void roster.refetch()}
          />
        ) : roster.data.length === 0 ? (
          <EmptyState
            title='No team members yet'
            description='Reserve or assign candidates to build the team.'
          />
        ) : (
          <TeamRoster
            assignments={roster.data}
            pendingAssignmentId={remove.isPending ? toRemove?.id : undefined}
            onRemove={setToRemove}
          />
        )}
      </section>

      <ConfirmDialog
        open={toAssign !== null}
        title='Confirm assignment?'
        description={
          toAssign
            ? `This assigns ${toAssign.display_name} and updates their capacity for the selected period.`
            : undefined
        }
        confirmLabel='Assign'
        isPending={assign.isPending}
        onConfirm={handleAssignConfirm}
        onCancel={() => setToAssign(null)}
      />

      <ConfirmDialog
        open={toRemove !== null}
        title='Remove from team?'
        description={
          toRemove
            ? `This removes ${toRemove.employee_display_name ?? 'this member'} from the team and releases their capacity.`
            : undefined
        }
        confirmLabel='Remove'
        isPending={remove.isPending}
        onConfirm={handleRemoveConfirm}
        onCancel={() => setToRemove(null)}
      />
    </div>
  );
}
