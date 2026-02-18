
import { Injectable } from '@angular/core'; import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
@Injectable({
    providedIn: 'root'
})
export class RoleGuard implements CanActivate {
    constructor(
        private readonly authService: AuthService,
        private readonly router: Router
    ) { }
    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): boolean {
        const rolesRequeridos = route.data['roles'] as string[];
        if (!this.authService.estaAutenticado()) {
            this.router.navigate(['/login']);
            return false;
        }
        const usuario = this.authService.obtenerUsuario();
        if (!usuario) {
            this.router.navigate(['/']);
            return false;
        }
        let tieneRol = false;
        if (usuario.roles && usuario.roles.length > 0) {
            const rolesUsuario = usuario.roles.map(rol => rol.nombre);
            tieneRol = rolesRequeridos.some(rolRequerido => rolesUsuario.includes(rolRequerido)
            );
        } else {
            const mapaRoles: { [key: number]: string } = {
                1: 'Propietario',
                2: 'Técnico',
                3: 'Guardia de seguridad',
                4: 'Empleado',
                5: 'Cocinero',
                6: 'Administrador'
            };
            const rolUsuario = mapaRoles[usuario.id_rol];
            tieneRol = rolesRequeridos.includes(rolUsuario);
        }
        if (tieneRol) {
            return true;
        }
        this.router.navigate(['/']);
        return false;
    }
}