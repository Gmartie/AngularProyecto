/**
 * RUTAS DE LA APLICACIÓN
 * 
 * Define todas las rutas de navegación con lazy loading
 * Incluye guards de autenticación y validación de roles
 * Los módulos se cargan bajo demanda (lazy loading) para optimizar rendimiento
 */

import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './pages/login/login.component';
import { RegistroComponent } from './pages/registro/registro.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  { 
    path: '', 
    component: DashboardComponent 
  },
  { 
    path: 'login', 
    component: LoginComponent 
  },
  { 
    path: 'registro', 
    component: RegistroComponent 
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [RoleGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'noticias',
    loadComponent: () => import('./pages/noticias/noticias.component').then(m => m.NoticiasComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'modulos',
    loadComponent: () => import('./pages/modulos/modulos.component').then(m => m.ModulosComponent),
    canActivate: [RoleGuard],
    data: { roles: ['Administrador', 'Tutor', 'Profesor', 'Jefe Departamento', 'Alumno'] }
  },
  {
    path: 'mis-matriculas',
    loadComponent: () => import('./pages/mis-matriculas/mis-matriculas.component').then(m => m.MisMatriculasComponent),
    canActivate: [RoleGuard],
    data: { roles: ['Alumno'] }
  },
  {
    path: 'alumnos',
    loadComponent: () => import('./pages/alumnos/alumnos.component').then(m => m.AlumnosComponent),
    canActivate: [RoleGuard],
    data: { roles: ['Administrador', 'Jefe Departamento'] }
  },
  {
    path: 'profesores',
    loadComponent: () => import('./pages/profesores/profesores.component').then(m => m.ProfesoresComponent),
    canActivate: [RoleGuard],
    data: { roles: ['Administrador', 'Tutor', 'Jefe Departamento', 'Profesor'] }
  },
  {
    path: 'matriculas',
    loadComponent: () => import('./pages/matriculas/matriculas.component').then(m => m.MatriculasComponent),
    canActivate: [RoleGuard],
    data: { roles: ['Administrador', 'Jefe Departamento'] }
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil.component').then(m => m.PerfilComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'test-users',
    loadComponent: () => import('./pages/test-users/test-users.component').then(m => m.TestUsersComponent)
  },
  { 
    path: '**', 
    redirectTo: '' 
  }
];
