import { useState } from 'react';

import { PageHeader } from '@/components/shared';
import { ProjectListContainer } from '@/features/projects';

export function ProjectListPage() {
  const [search, setSearch] = useState('');

  return (
    <main aria-labelledby='projects-title'>
      <PageHeader id='projects-title' title='Projects' />
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
