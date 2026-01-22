/**
 * RUTAS DE LA APLICACIÓN
 * 
 * Define todas las rutas de navegación
 * Incluye guards de autenticación y validación de roles
 */

import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './pages/login/login.component';
import { RegistroComponent } from './pages/registro/registro.component';
import { ModulosComponent } from './pages/modulos/modulos.component';
import { NoticiasComponent } from './pages/noticias/noticias.component';
import { PerfilComponent } from './pages/perfil/perfil.component';
import { AlumnosComponent } from './pages/alumnos/alumnos.component';
import { ProfesoresComponent } from './pages/profesores/profesores.component';
import { AdminComponent } from './pages/admin/admin.component';
import { MatriculasComponent } from './pages/matriculas/matriculas.component';
import { MisMatriculasComponent } from './pages/mis-matriculas/mis-matriculas.component';
import { TestUsersComponent } from './pages/test-users/test-users.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [RoleGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'noticias',
    component: NoticiasComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'modulos',
    component: ModulosComponent,
    canActivate: [RoleGuard],
    data: { roles: ['Administrador', 'Tutor', 'Profesor', 'Alumno'] }
  },
  {
    path: 'mis-matriculas',
    component: MisMatriculasComponent,
    canActivate: [RoleGuard],
    data: { roles: ['Alumno'] }
  },
  {
    path: 'alumnos',
    component: AlumnosComponent,
    canActivate: [RoleGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'profesores',
    component: ProfesoresComponent,
    canActivate: [RoleGuard],
    data: { roles: ['Administrador', 'Profesor'] }
  },
  {
    path: 'matriculas',
    component: MatriculasComponent,
    canActivate: [RoleGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'perfil',
    component: PerfilComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'test-users',
    component: TestUsersComponent
  },
  { path: '**', redirectTo: '' }
];
