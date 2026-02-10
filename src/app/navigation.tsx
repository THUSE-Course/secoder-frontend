import type { ReactNode } from 'react';
import {
  Home as HomeIcon,
  People as PeopleIcon,
  Groups as GroupsIcon,
  ManageAccounts as ManageAccountsIcon,
  Mail as MailIcon,
} from '@mui/icons-material';
import type { TFunction } from 'i18next';

export type NavItem = {
  id: 'overview' | 'users' | 'groups' | 'invitations' | 'profile' | 'admin';
  label: string;
  icon: ReactNode;
  path: string;
};

export const buildNavItems = (t: TFunction, isAdmin = false): NavItem[] => {
  const items: NavItem[] = [
    {
      id: 'overview',
      label: t('nav_overview'),
      icon: <HomeIcon />,
      path: '/overview',
    },
    {
      id: 'users',
      label: t('nav_users'),
      icon: <PeopleIcon />,
      path: '/users',
    },
    {
      id: 'groups',
      label: t('nav_groups'),
      icon: <GroupsIcon />,
      path: '/groups',
    },
    {
      id: 'invitations',
      label: t('nav_invitations'),
      icon: <MailIcon />,
      path: '/invitations',
    },
    {
      id: 'profile',
      label: t('nav_profile'),
      icon: <ManageAccountsIcon />,
      path: '/profile',
    },
  ];

  if (isAdmin) {
    items.push({
      id: 'admin',
      label: t('nav_admin'),
      icon: <ManageAccountsIcon />,
      path: '/admin',
    });
  }

  return items;
};
