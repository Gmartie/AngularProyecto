import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './pages/login/login.component';
import { RegistroComponent } from './pages/registro/registro.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { UsuarioComponent } from './pages/usuario/usuario.component';
import { HomeComponent } from './pages/home/home.component';
import { Home2Component } from './pages/home2/home2.component';

export const routes: Routes = [

  // Root → home (página principal pública)
  {
    path: '',
    component: HomeComponent
  },

  // Home explícito (página principal pública)
  {
    path: 'home',
    component: HomeComponent
  },

  // Home2 - Escritorio estilo Windows 95 (protegido)
  {
    path: 'home2',
    component: Home2Component,
    canActivate: [AuthGuard]
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

  // Dashboard (protegido) - Mantener por compatibilidad
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
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

  // Tipos
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

  // Usuario
  {
    path: 'usuario',
    component: UsuarioComponent,
    canActivate: [AuthGuard]
  },

  // Wildcard → home en lugar de login
  {
    path: '**',
    redirectTo: ''
  }
];
