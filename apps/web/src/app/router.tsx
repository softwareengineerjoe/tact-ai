import { createBrowserRouter, Navigate } from 'react-router-dom';

import { RequirePermission } from '@/app/guards/RequirePermission';
import { AppLayout } from '@/app/AppLayout';
import { AssistantPage } from '@/pages/AssistantPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { PeopleDirectoryPage } from '@/pages/PeopleDirectoryPage';
import { CreateProjectPage } from '@/pages/CreateProjectPage';
import { ProjectListPage } from '@/pages/ProjectListPage';
import { ProjectSetupPage } from '@/pages/ProjectSetupPage';
import { ProjectFeedbackPage } from '@/pages/ProjectFeedbackPage';
import { TeamBuilderPage } from '@/pages/TeamBuilderPage';
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
        path: '/projects/new',
        element: (
          <RequirePermission permission='projects.create'>
            <CreateProjectPage />
          </RequirePermission>
        ),
      },
      {
        path: '/projects/:projectId/team-builder',
        element: (
          <RequirePermission permission='team.recommend'>
            <TeamBuilderPage />
          </RequirePermission>
        ),
      },
      {
        path: '/projects/:projectId/setup',
        element: (
          <RequirePermission permission='projects.edit'>
            <ProjectSetupPage />
          </RequirePermission>
        ),
      },
      {
        path: '/projects/:projectId/feedback',
        element: (
          <RequirePermission permission='feedback.view_shared'>
            <ProjectFeedbackPage />
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
