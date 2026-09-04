import { useNavigate } from 'react-router-dom';

import { toast } from '@/components/shared';
import { useCreateProject } from '@/features/projects/api/useCreateProject';
import { CreateProjectForm } from '@/features/projects/components/CreateProjectForm';
import type { CreateProjectInput } from '@/features/projects/types';

/** Creates a project, then routes to its setup page to declare dates + roles. */
export function CreateProjectContainer() {
  const navigate = useNavigate();
  const createProject = useCreateProject();

  const handleSubmit = (values: CreateProjectInput) => {
    createProject.mutate(values, {
      onSuccess: (project) => {
        toast.success('Project created');
        void navigate(`/projects/${project.id}/setup`);
      },
      onError: (error) => toast.error(error.message),
    });
  };

  return (
    <CreateProjectForm
      isPending={createProject.isPending}
      onSubmit={handleSubmit}
      onCancel={() => void navigate('/projects')}
    />
  );
}
