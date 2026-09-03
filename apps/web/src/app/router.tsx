import { createBrowserRouter, Navigate } from 'react-router-dom';

import { RequirePermission } from '@/app/guards/RequirePermission';
import { AppLayout } from '@/app/AppLayout';
import { AssistantPage } from '@/pages/AssistantPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { PeopleDirectoryPage } from '@/pages/PeopleDirectoryPage';
import { ProjectListPage } from '@/pages/ProjectListPage';
import { TicketListPage } from '@/pages/TicketListPage';

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to='/dashboard' replace /> },
      {
        path: '/assistant',
        element: (
          <RequirePermission permission='assistant.use'>
            <AssistantPage />
          </RequirePermission>
        ),
      },
      { path: '/dashboard', element: <DashboardPage /> },
      {
        path: '/projects',
        element: (
          <RequirePermission permission='projects.view'>
            <ProjectListPage />
          </RequirePermission>
        ),
      },
      {
        path: '/people',
        element: (
          <RequirePermission permission='people.view'>
            <PeopleDirectoryPage />
          </RequirePermission>
        ),
      },
      {
        path: '/tickets',
        element: (
          <RequirePermission permission='tickets.view'>
            <TicketListPage />
          </RequirePermission>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
