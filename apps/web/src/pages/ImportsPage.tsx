import { PageHeader } from '@/components/shared';
import { UploadIcon } from '@/components/icons';
import { ImportEmployeesContainer } from '@/features/imports';

export function ImportsPage() {
  return (
    <main aria-labelledby='imports-title'>
      <PageHeader
        id='imports-title'
        icon={<UploadIcon className='h-5 w-5' />}
        title='Imports'
        description='Bulk-load employees from a CSV file and review the results.'
      />
      <ImportEmployeesContainer />
    </main>
  );
}
