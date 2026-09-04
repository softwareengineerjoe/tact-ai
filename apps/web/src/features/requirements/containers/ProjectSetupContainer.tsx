import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  ConfirmDialog,
  EmptyState,
  ErrorState,
  ForbiddenState,
  LoadingState,
  PermissionGate,
  toast,
} from '@/components/shared';
import { useProject, useUpdateProject } from '@/features/projects';
import { useProjectRequirements } from '@/features/team-builder';
import type { RoleRequirement } from '@/features/team-builder/types';
import type { RequirementFormValues } from '@/features/requirements/schemas';
import { useCreateRequirement } from '../api/useCreateRequirement';
import { useUpdateRequirement } from '../api/useUpdateRequirement';
import { useDeleteRequirement } from '../api/useDeleteRequirement';
import { ProjectScheduleForm } from '../components/ProjectScheduleForm';
import { RequirementForm } from '../components/RequirementForm';
import { RequirementRow } from '../components/RequirementRow';

interface ProjectSetupContainerProps {
  projectId: string;
}

function toFormValues(requirement: RoleRequirement): RequirementFormValues {
  return {
    roleName: requirement.role_name,
    headcount: requirement.headcount,
    allocationPercent: requirement.allocation_percent,
    description: requirement.description ?? '',
    requiredSkills: requirement.required_skills,
    preferredSkills: requirement.preferred_skills,
  };
}

export function ProjectSetupContainer({
  projectId,
}: ProjectSetupContainerProps) {
  const navigate = useNavigate();
  const projectQuery = useProject(projectId);
  const requirementsQuery = useProjectRequirements(projectId);

  const updateProject = useUpdateProject(projectId);
  const createRequirement = useCreateRequirement(projectId);
  const updateRequirement = useUpdateRequirement(projectId);
  const deleteRequirement = useDeleteRequirement(projectId);

  const [isAdding, setIsAdding] = useState(false);
  const [editing, setEditing] = useState<RoleRequirement | null>(null);
  const [pendingDelete, setPendingDelete] = useState<RoleRequirement | null>(
    null,
  );

  if (projectQuery.isPending || requirementsQuery.isPending) {
    return (
      <LoadingState label='Loading project setup' variant='skeleton' rows={4} />
    );
  }
  if (projectQuery.isError && projectQuery.error.status === 403) {
    return <ForbiddenState requiredPermissions={['projects.view']} />;
  }
  if (projectQuery.isError) {
    return (
      <ErrorState error={projectQuery.error} onRetry={projectQuery.refetch} />
    );
  }
  if (requirementsQuery.isError) {
    return (
      <ErrorState
        error={requirementsQuery.error}
        onRetry={requirementsQuery.refetch}
      />
    );
  }

  const project = projectQuery.data;
  const requirements = requirementsQuery.data;

  const handleSaveSchedule = (
    input: Parameters<typeof updateProject.mutate>[0],
  ) => {
    updateProject.mutate(input, {
      onSuccess: () => toast.success('Project schedule updated'),
      onError: (error) => toast.error(error.message),
    });
  };

  const handleCreate = (values: RequirementFormValues) => {
    createRequirement.mutate(values, {
      onSuccess: () => {
        toast.success('Role requirement added');
        setIsAdding(false);
      },
      onError: (error) => toast.error(error.message),
    });
  };

  const handleUpdate = (values: RequirementFormValues) => {
    if (!editing) return;
    updateRequirement.mutate(
      { ...values, requirementId: editing.id, version: editing.version },
      {
        onSuccess: () => {
          toast.success('Role requirement updated');
          setEditing(null);
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    deleteRequirement.mutate(pendingDelete.id, {
      onSuccess: () => {
        toast.success('Role requirement removed');
        setPendingDelete(null);
      },
      onError: (error) => toast.error(error.message),
    });
  };

  return (
    <div className='space-y-8'>
      <section aria-labelledby='schedule-heading'>
        <h2 id='schedule-heading' className='text-lg font-semibold text-fg'>
          {project.name} — schedule
        </h2>
        <p className='mt-1 text-sm text-fg-muted'>
          These dates and team size drive staffing and capacity checks.
        </p>
        <div className='mt-4 rounded-lg border border-border bg-surface p-4 shadow-xs'>
          <PermissionGate
            permission='projects.edit'
            fallback={
              <p className='text-sm text-fg-muted'>
                You do not have permission to edit this project.
              </p>
            }
          >
            <ProjectScheduleForm
              project={project}
              isPending={updateProject.isPending}
              onSubmit={handleSaveSchedule}
            />
          </PermissionGate>
        </div>
      </section>

      <section aria-labelledby='requirements-heading'>
        <div className='flex items-center justify-between'>
          <h2
            id='requirements-heading'
            className='text-lg font-semibold text-fg'
          >
            Role requirements
          </h2>
          <PermissionGate permission='projects.edit'>
            {!isAdding && !editing ? (
              <button
                type='button'
                onClick={() => setIsAdding(true)}
                className='h-9 rounded-md bg-primary px-3 text-sm font-medium text-primary-fg hover:bg-primary-hover'
              >
                Add role
              </button>
            ) : null}
          </PermissionGate>
        </div>

        {isAdding ? (
          <div className='mt-4 rounded-lg border border-border bg-surface p-4 shadow-xs'>
            <h3 className='mb-3 font-medium text-fg'>New role</h3>
            <RequirementForm
              submitLabel='Add role'
              isPending={createRequirement.isPending}
              onSubmit={handleCreate}
              onCancel={() => setIsAdding(false)}
            />
          </div>
        ) : null}

        {requirements.length === 0 && !isAdding ? (
          <EmptyState
            className='mt-4'
            title='No role requirements yet'
            description='Add the roles this project needs so you can build a team.'
            action={{
              label: 'Add role',
              onClick: () => setIsAdding(true),
              permission: 'projects.edit',
            }}
          />
        ) : (
          <ul className='mt-4 grid gap-3'>
            {requirements.map((requirement) => (
              <li key={requirement.id}>
                {editing?.id === requirement.id ? (
                  <div className='rounded-lg border border-border bg-surface p-4 shadow-xs'>
                    <h3 className='mb-3 font-medium text-fg'>
                      Edit {requirement.role_name}
                    </h3>
                    <RequirementForm
                      initialValues={toFormValues(requirement)}
                      submitLabel='Save changes'
                      isPending={updateRequirement.isPending}
                      onSubmit={handleUpdate}
                      onCancel={() => setEditing(null)}
                    />
                  </div>
                ) : (
                  <RequirementRow
                    requirement={requirement}
                    onEdit={setEditing}
                    onDelete={setPendingDelete}
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className='flex items-center justify-between gap-2 border-t border-border pt-4'>
        <button
          type='button'
          onClick={() => void navigate('/projects')}
          className='h-10 rounded-md border border-border px-4 text-sm font-medium text-fg hover:bg-surface-muted'
        >
          Back to projects
        </button>
        <PermissionGate permission='team.recommend'>
          <Link
            to={`/projects/${projectId}/team-builder`}
            className='h-10 rounded-md bg-primary px-4 text-sm font-medium leading-10 text-primary-fg hover:bg-primary-hover'
          >
            Go to Team Builder
          </Link>
        </PermissionGate>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title='Remove role requirement?'
        description={
          pendingDelete
            ? `This removes "${pendingDelete.role_name}" from the project's requirements.`
            : undefined
        }
        confirmLabel='Remove'
        tone='danger'
        isPending={deleteRequirement.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
