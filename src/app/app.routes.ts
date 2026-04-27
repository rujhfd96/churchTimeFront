import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  {
    path: 'password-reset-success',
    loadComponent: () => import('./features/auth/reset-password-success/reset-password-success.component').then(m => m.ResetPasswordSuccessComponent)
  },
  {
<<<<<<< HEAD
=======
    path: 'pointing/:eventId',
    loadComponent: () =>
      import('./features/public-checkin/public-checkin.component').then(m => m.PublicCheckinComponent)
  },
  {
>>>>>>> c9f3a96 (meu código)
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'churches',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        children: [
          { path: '', loadComponent: () => import('./features/churches/church-list/church-list.component').then(m => m.ChurchListComponent) },
          { path: 'new', loadComponent: () => import('./features/churches/church-form/church-form.component').then(m => m.ChurchFormComponent) },
          { path: ':id', loadComponent: () => import('./features/churches/church-detail/church-detail.component').then(m => m.ChurchDetailComponent) },
          { path: ':id/edit', loadComponent: () => import('./features/churches/church-form/church-form.component').then(m => m.ChurchFormComponent) }
        ]
      },
      {
        path: 'groups',
        canActivate: [authGuard],
        children: [
          { path: '', loadComponent: () => import('./features/groups/group-list/group-list.component').then(m => m.GroupListComponent) },
          { path: 'new', canActivate: [roleGuard], data: { roles: ['ADMIN', 'LEADER'] }, loadComponent: () => import('./features/groups/group-form/group-form.component').then(m => m.GroupFormComponent) },
          { path: ':id', loadComponent: () => import('./features/groups/group-detail/group-detail.component').then(m => m.GroupDetailComponent) },
          { path: ':id/users', loadComponent: () => import('./features/groups/group-users/group-users.component').then(m => m.GroupUsersComponent) }
        ]
      },
      {
        path: 'users',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        children: [
          { path: '', loadComponent: () => import('./features/users/user-list/user-list.component').then(m => m.UserListComponent) },
          { path: 'new', loadComponent: () => import('./features/users/user-form/user-form.component').then(m => m.UserFormComponent) },
          { path: ':id', loadComponent: () => import('./features/users/user-detail/user-detail.component').then(m => m.UserDetailComponent) }
        ]
      },
      {
        path: 'events',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'LEADER'] },
        children: [
          { path: '', loadComponent: () => import('./features/events/event-list/event-list.component').then(m => m.EventListComponent) },
          { path: 'new', loadComponent: () => import('./features/events/event-form/event-form.component').then(m => m.EventFormComponent) },
          { path: ':id', loadComponent: () => import('./features/events/event-detail/event-detail.component').then(m => m.EventDetailComponent) }
        ]
      },
      {
        path: 'presence',
        canActivate: [authGuard],
        children: [
          { path: 'checkin/:eventId', loadComponent: () => import('./features/presence/checkin/checkin.component').then(m => m.CheckinComponent) },
          { path: 'event/:eventId', loadComponent: () => import('./features/presence/presence-list/presence-list.component').then(m => m.PresenceListComponent) }
        ]
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
<<<<<<< HEAD
];
=======
];
>>>>>>> c9f3a96 (meu código)
