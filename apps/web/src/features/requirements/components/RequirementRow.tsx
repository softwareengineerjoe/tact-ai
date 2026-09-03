import { PermissionGate } from '@/components/shared';
import type { RoleRequirement } from '@/features/team-builder/types';

interface RequirementRowProps {
  requirement: RoleRequirement;
  onEdit: (requirement: RoleRequirement) => void;
  onDelete: (requirement: RoleRequirement) => void;
}

/** Presentational summary of a single role requirement with edit/delete. */
export function RequirementRow({
  requirement,
  onEdit,
  onDelete,
}: RequirementRowProps) {
  return (
    <article className='rounded-lg border border-border bg-surface p-4 shadow-xs'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <h3 className='font-medium text-fg'>{requirement.role_name}</h3>
          <p className='mt-0.5 text-xs text-fg-muted'>
            {requirement.headcount} needed · {requirement.allocation_percent}%
            allocation
          </p>
        </div>
        <PermissionGate permission='projects.edit'>
          <div className='flex gap-2'>
            <button
              type='button'
              onClick={() => onEdit(requirement)}
              className='text-xs font-medium text-primary hover:underline'
            >
              Edit
            </button>
            <button
              type='button'
              onClick={() => onDelete(requirement)}
              className='text-xs font-medium text-danger hover:underline'
            >
              Remove
            </button>
          </div>
        </PermissionGate>
      </div>

      {requirement.required_skills.length > 0 ? (
        <div className='mt-3'>
          <p className='text-xs font-medium text-fg-muted'>Required</p>
          <ul className='mt-1 flex flex-wrap gap-1.5'>
            {requirement.required_skills.map((skill) => (
              <li
                key={skill}
                className='rounded-full bg-primary-subtle px-2 py-0.5 text-xs text-primary-active'
              >
                {skill}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {requirement.preferred_skills.length > 0 ? (
        <div className='mt-2'>
          <p className='text-xs font-medium text-fg-muted'>Preferred</p>
          <ul className='mt-1 flex flex-wrap gap-1.5'>
            {requirement.preferred_skills.map((skill) => (
              <li
                key={skill}
                className='rounded-full bg-surface-muted px-2 py-0.5 text-xs text-fg-muted'
              >
                {skill}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {requirement.description ? (
        <p className='mt-3 text-sm text-fg-muted'>{requirement.description}</p>
      ) : null}
    </article>
  );
}
