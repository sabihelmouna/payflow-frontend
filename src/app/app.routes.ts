import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component')
          .then(m => ({ default: m.LoginComponent }))
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component')
          .then(m => ({ default: m.RegisterComponent }))
      }
      
      
    ]
  },
  {
  path: 'profile',
  canActivate: [authGuard],
  loadComponent: () => import('./features/profile/profile.component')
    .then(m => ({ default: m.ProfileComponent }))
},
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/home/home.component')
      .then(m => ({ default: m.HomeComponent }))
  },
  {
    path: 'payments',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/payments/payment-list/payment-list.component')
          .then(m => ({ default: m.PaymentListComponent }))
      },
      {
        path: 'new',
        loadComponent: () => import('./features/payments/payment-form/payment-form.component')
          .then(m => ({ default: m.PaymentFormComponent }))
      }
    ]
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component')
          .then(m => ({ default: m.AdminDashboardComponent }))
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/admin-users/admin-users.component')
          .then(m => ({ default: m.AdminUsersComponent }))
      },
      {
  path: 'payments',
  loadComponent: () => import('./features/admin/admin-payments/admin-payments.component')
    .then(m => ({ default: m.AdminPaymentsComponent }))
}
      
    ]
  },
  
  { path: '**', redirectTo: 'auth/login' }
  
];
