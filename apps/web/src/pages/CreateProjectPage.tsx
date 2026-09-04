import { PageHeader } from '@/components/shared';
import { CreateProjectContainer } from '@/features/projects/containers/CreateProjectContainer';

export function CreateProjectPage() {
  return (
    <main aria-labelledby='new-project-title'>
      <PageHeader
        id='new-project-title'
        title='New Project'
        description='Name the project and set its priority. You will define dates and roles next.'
      />
      <CreateProjectContainer />
    </main>
  );
}
