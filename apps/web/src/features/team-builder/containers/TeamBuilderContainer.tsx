import { useMemo, useState } from 'react';

import {
  ConfirmDialog,
  EmptyState,
  ErrorState,
  ForbiddenState,
  LoadingState,
  PermissionGate,
  toast,
} from '@/components/shared';
import { EmployeeFeedbackContainer } from '@/features/feedback';
import { useProject } from '@/features/projects';
import { useProjectRequirements } from '@/features/team-builder/api/useProjectRequirements';
import { useProjectTeam } from '@/features/team-builder/api/useProjectTeam';
import { useRecommendations } from '@/features/team-builder/api/useRecommendations';
import { useReserveEmployee } from '@/features/team-builder/api/useReserveEmployee';
import { useAssignEmployee } from '@/features/team-builder/api/useAssignEmployee';
import { useRemoveAssignment } from '@/features/team-builder/api/useRemoveAssignment';
import { CandidateTable } from '@/features/team-builder/components/CandidateTable';
import { CandidateComparison } from '@/features/team-builder/components/CandidateComparison';
import { TeamRoster } from '@/features/team-builder/components/TeamRoster';
import type {
  Assignment,
  RecommendationCandidate,
  RecommendationParams,
} from '@/features/team-builder/types';

interface TeamBuilderContainerProps {
  projectId: string;
}

// Assignment statuses that count toward filling a role's headcount.
const FILLING_STATUSES = new Set<Assignment['status']>([
  'recommended',
  'reserved',
  'pending_approval',
  'confirmed',
  'active',
]);

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Owns Team Builder data, selection state, and the assign/reserve lifecycle. */
export function TeamBuilderContainer({ projectId }: TeamBuilderContainerProps) {
  const project = useProject(projectId);
  const requirements = useProjectRequirements(projectId);
  const roster = useProjectTeam(projectId);

  const [roleId, setRoleId] = useState<string | null>(null);
  const [toAssign, setToAssign] = useState<RecommendationCandidate | null>(
    null,
  );
  const [toRemove, setToRemove] = useState<Assignment | null>(null);
  const [comparedIds, setComparedIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const selectRole = (id: string) => {
    setRoleId(id);
    setComparedIds(new Set());
  };

  const toggleCompare = (employeeId: string) => {
    setComparedIds((current) => {
      const next = new Set(current);
      if (next.has(employeeId)) next.delete(employeeId);
      else next.add(employeeId);
      return next;
    });
  };

  const reserve = useReserveEmployee(projectId);
  const assign = useAssignEmployee(projectId);
  const remove = useRemoveAssignment(projectId);

  // The staffing period comes from the project's own dates (set on the
  // project), not a per-role picker in the Team Builder.
  const periodStartIso = project.data?.start_date ?? null;
  const periodEndIso = project.data?.target_end_date ?? null;
  const hasPeriod = periodStartIso !== null && periodEndIso !== null;

  // How many people each role still needs, from the current roster.
  const filledByRole = useMemo(() => {
    const counts = new Map<string, number>();
    for (const assignment of roster.data ?? []) {
      if (!FILLING_STATUSES.has(assignment.status)) continue;
      counts.set(
        assignment.role_requirement_id,
        (counts.get(assignment.role_requirement_id) ?? 0) + 1,
      );
    }
    return counts;
  }, [roster.data]);

  const recommendationParams = useMemo<RecommendationParams | null>(() => {
    if (!roleId || !periodStartIso || !periodEndIso) return null;
    return {
      projectId,
      roleRequirementId: roleId,
      periodStart: periodStartIso,
      periodEnd: periodEndIso,
      limit: 10,
    };
  }, [projectId, roleId, periodStartIso, periodEndIso]);

  const recommendations = useRecommendations(recommendationParams);

  const comparedCandidates = useMemo(
    () =>
      (recommendations.data ?? []).filter((candidate) =>
        comparedIds.has(candidate.employee_id),
      ),
    [recommendations.data, comparedIds],
  );

  const selectedRole = requirements.data?.find((r) => r.id === roleId) ?? null;

  // Current roster status per employee for the selected role, so already
  // reserved/assigned candidates show their state instead of action buttons.
  const statusByEmployeeId = useMemo(() => {
    const map = new Map<string, Assignment['status']>();
    if (!roleId) return map;
    for (const assignment of roster.data ?? []) {
      if (assignment.role_requirement_id !== roleId) continue;
      if (!FILLING_STATUSES.has(assignment.status)) continue;
      map.set(assignment.employee_id, assignment.status);
    }
    return map;
  }, [roster.data, roleId]);

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
    if (!toAssign || !periodStartIso || !periodEndIso) return;
    assign.mutate(
      {
        projectId,
        roleRequirementId: toAssign.role_requirement_id,
        employeeId: toAssign.employee_id,
        allocationPercent: selectedRole?.allocation_percent ?? 100,
        startDate: periodStartIso,
        endDate: periodEndIso,
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

  // --- Project + requirements lifecycle (drive the role selector) ---
  if (project.isPending || requirements.isPending) {
    return (
      <LoadingState label='Loading team builder' variant='skeleton' rows={3} />
    );
  }
  if (project.isError && project.error.status === 403) {
    return <ForbiddenState requiredPermissions={['projects.view']} />;
  }
  if (project.isError) {
    return (
      <ErrorState
        error={project.error}
        onRetry={() => void project.refetch()}
      />
    );
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
        <div className='flex flex-wrap items-baseline justify-between gap-2'>
          <h2 id='tb-role-heading' className='text-base font-semibold text-fg'>
            1. Choose a role to staff
          </h2>
          <p className='text-xs text-fg-muted'>
            {hasPeriod ? (
              <>
                Project duration:{' '}
                <span className='font-medium text-fg-body'>
                  {formatDate(periodStartIso)} – {formatDate(periodEndIso)}
                </span>
              </>
            ) : (
              'Project duration not set'
            )}
          </p>
        </div>

        {!hasPeriod ? (
          <div
            role='status'
            className='rounded-md border border-warning/30 bg-surface p-3 text-sm text-fg-body'
          >
            Set the project start and target end dates on the project before
            staffing — capacity is calculated for that period.
          </div>
        ) : null}

        <ul className='grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
          {requirements.data.map((requirement) => {
            const filled = filledByRole.get(requirement.id) ?? 0;
            const isComplete = filled >= requirement.headcount;
            const isSelected = roleId === requirement.id;
            return (
              <li key={requirement.id}>
                <button
                  type='button'
                  onClick={() => selectRole(requirement.id)}
                  aria-pressed={isSelected}
                  className={
                    isSelected
                      ? 'flex w-full flex-col gap-1 rounded-md border border-primary bg-primary-subtle p-3 text-left'
                      : 'flex w-full flex-col gap-1 rounded-md border border-border bg-surface p-3 text-left transition-colors hover:bg-surface-muted'
                  }
                >
                  <span className='flex items-center justify-between gap-2'>
                    <span
                      className={
                        isSelected
                          ? 'text-sm font-medium text-primary'
                          : 'text-sm font-medium text-fg'
                      }
                    >
                      {requirement.role_name}
                    </span>
                    <span
                      className={
                        isComplete
                          ? 'inline-flex items-center gap-1 rounded-full bg-primary-subtle px-2 py-0.5 text-xs font-medium text-success'
                          : 'inline-flex items-center gap-1 rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium text-fg-muted'
                      }
                    >
                      <span
                        aria-hidden
                        className='h-1.5 w-1.5 rounded-full bg-current'
                      />
                      {filled}/{requirement.headcount} filled
                    </span>
                  </span>
                  <span className='text-xs text-fg-muted'>
                    {requirement.allocation_percent}% allocation
                    {requirement.headcount > 1
                      ? ` · needs ${requirement.headcount} people`
                      : ''}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby='tb-candidates-heading' className='space-y-3'>
        <h2
          id='tb-candidates-heading'
          className='text-base font-semibold text-fg'
        >
          2. Recommended candidates
        </h2>
        {!hasPeriod ? (
          <EmptyState
            title='Set the project duration first'
            description='Recommendations use the project period to compute capacity.'
          />
        ) : !recommendationParams ? (
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
            statusByEmployeeId={statusByEmployeeId}
            comparedEmployeeIds={comparedIds}
            onToggleCompare={toggleCompare}
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
        {comparedCandidates.length >= 2 ? (
          <CandidateComparison
            candidates={comparedCandidates}
            onClear={() => setComparedIds(new Set())}
          />
        ) : comparedCandidates.length === 1 ? (
          <p className='text-xs text-fg-muted'>
            Select at least one more candidate to compare side by side.
          </p>
        ) : null}
      </section>

      {comparedCandidates.length >= 1 ? (
        <PermissionGate permission='feedback.view_shared'>
          <section aria-labelledby='tb-feedback-heading' className='space-y-3'>
            <h2
              id='tb-feedback-heading'
              className='text-base font-semibold text-fg'
            >
              Feedback for selected candidates
            </h2>
            <p className='text-xs text-fg-muted'>
              Past project feedback is shown for context only — it never affects
              the deterministic Project Fit Score.
            </p>
            <div className='grid gap-4 md:grid-cols-2'>
              {comparedCandidates.map((candidate) => (
                <div key={candidate.employee_id} className='space-y-2'>
                  <h3 className='text-sm font-medium text-fg'>
                    {candidate.display_name}
                  </h3>
                  <EmployeeFeedbackContainer
                    employeeId={candidate.employee_id}
                    employeeName={candidate.display_name}
                  />
                </div>
              ))}
            </div>
          </section>
        </PermissionGate>
      ) : null}

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
