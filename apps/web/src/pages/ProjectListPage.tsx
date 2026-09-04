import { useState } from 'react';
import { Link } from 'react-router-dom';

import { PageHeader, PermissionGate } from '@/components/shared';
import { ProjectListContainer } from '@/features/projects';

export function ProjectListPage() {
  const [search, setSearch] = useState('');

  return (
    <main aria-labelledby='projects-title'>
      <PageHeader
        id='projects-title'
        title='Projects'
        actions={
          <PermissionGate permission='projects.create'>
            <Link
              to='/projects/new'
              className='h-10 rounded-md bg-primary px-4 text-sm font-medium leading-10 text-primary-fg hover:bg-primary-hover'
            >
              New project
            </Link>
          </PermissionGate>
        }
      />
      <div className='mb-4'>
        <label htmlFor='project-search' className='sr-only'>
          Search projects
        </label>
        <input
          id='project-search'
          type='search'
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder='Search projects'
          className='h-10 w-full max-w-sm rounded-sm border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-hover'
        />
      </div>
      <ProjectListContainer search={search || undefined} />
    </main>
  );
}
