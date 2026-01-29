/**
 * RUTAS DE LA APLICACIÓN
 *
 * Rutas reales alineadas con las carpetas existentes en /pages
 * Lazy loading + guards
 */

import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './pages/login/login.component';
import { RegistroComponent } from './pages/registro/registro.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [

  // Dashboard
  {
    path: '',
    component: DashboardComponent
  },

  // Auth
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'registro',
    component: RegistroComponent
  },

  // Admin
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [RoleGuard],
    data: { roles: ['Administrador'] }
  },

  // Animatrónicos
  {
    path: 'animatronicos',
    loadComponent: () =>
      import('./pages/animatronicos/animatronicos.component')
        .then(m => m.AnimatronicosComponent),
    canActivate: [AuthGuard]
  },

  // Locales
  {
    path: 'locales',
    loadComponent: () =>
      import('./pages/locales/locales.component')
        .then(m => m.LocalesComponent),
    canActivate: [AuthGuard]
  },

  // Tipos de animatrónicos
  {
    path: 'tipos',
    loadComponent: () =>
      import('./pages/tipos/tipos.component')
        .then(m => m.TiposComponent),
    canActivate: [AuthGuard]
  },

  // Perfil
  {
    path: 'perfil',
    loadComponent: () =>
      import('./pages/perfil/perfil.component')
        .then(m => m.PerfilComponent),
    canActivate: [AuthGuard]
  },

  // Wildcard
  {
    path: '**',
    redirectTo: ''
  }
];
