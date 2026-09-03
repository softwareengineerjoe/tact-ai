import { PageHeader } from '@/components/shared';

export function NotFoundPage() {
  return (
    <main aria-labelledby='notfound-title'>
      <PageHeader id='notfound-title' title='Page not found' />
      <p className='text-sm text-fg-muted'>
        The page you are looking for does not exist.
      </p>
    </main>
  );
}
