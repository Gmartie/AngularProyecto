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

  // Auth
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'registro',
    component: RegistroComponent
  },

  // Home2 - Escritorio estilo Windows 95
  {
    path: 'home2',
    component: Home2Component,
    canActivate: [AuthGuard]
  },

  // Programas (se abren como ventanas encima de home2)
  {
    path: 'animatronicos',
    loadComponent: () =>
      import('./pages/animatronicos/animatronicos.component')
        .then(m => m.AnimatronicosComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'locales',
    loadComponent: () =>
      import('./pages/locales/locales.component')
        .then(m => m.LocalesComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'tipos',
    loadComponent: () =>
      import('./pages/tipos/tipos.component')
        .then(m => m.TiposComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'perfil',
    loadComponent: () =>
      import('./pages/perfil/perfil.component')
        .then(m => m.PerfilComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'usuario',
    component: UsuarioComponent,
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

  // Dashboard redirige a home2
  {
    path: 'dashboard',
    redirectTo: 'home2',
    pathMatch: 'full'
  },

  // Wildcard → home
  {
    path: '**',
    redirectTo: ''
  }
];
