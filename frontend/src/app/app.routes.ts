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
    {
        path: '',
        component: HomeComponent
    },
    {
        path: 'home',
        component: HomeComponent
    }, {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'registro',
        component: RegistroComponent
    },
    {
        path: 'home2',
        component: Home2Component,
        canActivate: [AuthGuard]
    },
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
        path: 'animatronico-local',
        loadComponent: () =>
            import('./pages/animatronico-local/animatronico-local.component')
                .then(m => m.AnimatronicoLocalComponent),
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
    {
        path: 'roles',
        loadComponent: () =>
            import('./pages/roles/roles.component')
                .then(m => m.RolesComponent),
        canActivate: [AuthGuard]
    }, {
        path: 'admin',
        loadComponent: () =>
            import('./pages/admin/admin.component').then(m => m.AdminComponent),
        canActivate: [RoleGuard],
        data: { roles: ['Administrador'] }
    },
    {
        path: 'dashboard',
        redirectTo: 'home2',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: ''
    }
];
