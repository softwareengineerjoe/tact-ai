import { useState } from 'react';

import { PageHeader } from '@/components/shared';
import { PeopleDirectoryContainer } from '@/features/people';

export function PeopleDirectoryPage() {
  const [search, setSearch] = useState('');

  return (
    <main aria-labelledby='people-title'>
      <PageHeader id='people-title' title='People' />
      <div className='mb-4'>
        <label htmlFor='people-search' className='sr-only'>
          Search people
        </label>
        <input
          id='people-search'
          type='search'
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder='Search by name, role, or skill'
          className='h-10 w-full max-w-sm rounded-sm border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-hover'
        />
      </div>
      <PeopleDirectoryContainer search={search || undefined} />
    </main>
  );
}
