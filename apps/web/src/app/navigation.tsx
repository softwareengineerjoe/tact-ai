import type { ComponentType, SVGProps } from 'react';

import {
  BellIcon,
  DashboardIcon,
  PeopleIcon,
  ProjectsIcon,
  ShieldIcon,
  SitemapIcon,
  SparklesIcon,
  TicketIcon,
  UploadIcon,
} from '@/components/icons';
import type { Permission } from '@/types/permissions';

export interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  permission?: Permission;
  /** Short hint shown in the command palette. */
  hint?: string;
}

/** Single source of truth for primary navigation (rail + command palette). */
export const NAV_ITEMS: readonly NavItem[] = [
  {
    to: '/assistant',
    label: 'AI Assistant',
    icon: SparklesIcon,
    permission: 'assistant.use',
    hint: 'Ask about projects, people, and tickets',
  },
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: DashboardIcon,
    permission: 'reports.view',
    hint: 'Management overview',
  },
  {
    to: '/projects',
    label: 'Projects',
    icon: ProjectsIcon,
    permission: 'projects.view',
    hint: 'Create, staff, and track projects',
  },
  {
    to: '/people',
    label: 'People',
    icon: PeopleIcon,
    permission: 'people.view',
    hint: 'Internal employee directory',
  },
  {
    to: '/tickets',
    label: 'Tickets',
    icon: TicketIcon,
    permission: 'tickets.view',
    hint: 'Work across your projects',
  },
  {
    to: '/notifications',
    label: 'Notifications',
    icon: BellIcon,
    hint: 'Alerts about your work',
  },
  {
    to: '/imports',
    label: 'Imports',
    icon: UploadIcon,
    permission: 'people.edit',
    hint: 'Bulk-load employees from CSV',
  },
  {
    to: '/admin/roles',
    label: 'Roles',
    icon: ShieldIcon,
    permission: 'roles.manage',
    hint: 'Access model reference',
  },
  {
    to: '/architecture',
    label: 'Architecture',
    icon: SitemapIcon,
    hint: 'MVP system design & integrations',
  },
];
