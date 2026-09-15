import { createBrowserRouter } from 'react-router-dom';

import { RequirePermission } from '@/app/guards/RequirePermission';
import { AppLayout } from '@/app/AppLayout';
import { DefaultLanding } from '@/app/DefaultLanding';
import { ArchitecturePage } from '@/pages/ArchitecturePage';
import { AssistantPage } from '@/pages/AssistantPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { MemberDashboardPage } from '@/pages/MemberDashboardPage';
import { ImportsPage } from '@/pages/ImportsPage';
import { LandingPage } from '@/pages/LandingPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { PeopleDirectoryPage } from '@/pages/PeopleDirectoryPage';
import { CreateProjectPage } from '@/pages/CreateProjectPage';
import { ProjectListPage } from '@/pages/ProjectListPage';
import { ProjectOverviewPage } from '@/pages/ProjectOverviewPage';
import { ProjectReportPage } from '@/pages/ProjectReportPage';
import { ProjectSetupPage } from '@/pages/ProjectSetupPage';
import { ProjectFeedbackPage } from '@/pages/ProjectFeedbackPage';
import { RolesReferencePage } from '@/pages/RolesReferencePage';
import { TeamBuilderPage } from '@/pages/TeamBuilderPage';
import { TicketListPage } from '@/pages/TicketListPage';

export const router = createBrowserRouter([
  { path: '/welcome', element: <LandingPage /> },
  {
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <DefaultLanding />,
      },
      {
        path: '/assistant',
        element: (
          <RequirePermission permission='assistant.use'>
            <AssistantPage />
          </RequirePermission>
        ),
      },
      {
        path: '/dashboard',
        element: (
          <RequirePermission permission='reports.view'>
            <DashboardPage />
          </RequirePermission>
        ),
      },
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
        path: '/projects/:projectId',
        element: (
          <RequirePermission permission='projects.view'>
            <ProjectOverviewPage />
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
        path: '/projects/:projectId/reports',
        element: (
          <RequirePermission permission='reports.view'>
            <ProjectReportPage />
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
        path: '/people/:employeeId',
        element: (
          <RequirePermission permission='people.view'>
            <MemberDashboardPage />
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
      { path: '/notifications', element: <NotificationsPage /> },
      { path: '/architecture', element: <ArchitecturePage /> },
      { path: '/admin/roles', element: <RolesReferencePage /> },
      {
        path: '/imports',
        element: (
          <RequirePermission permission='people.edit'>
            <ImportsPage />
          </RequirePermission>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
