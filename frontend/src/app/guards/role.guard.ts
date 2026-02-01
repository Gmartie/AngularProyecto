/**
 * GUARD DE ROLES: RoleGuard
 * Protege rutas que requieren roles específicos
 */

import { Injectable } from '@angular/core';  
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const rolesRequeridos = route.data['roles'] as string[];

    console.log('🔐 RoleGuard - Validando acceso a ruta:', state.url);
    console.log('🔐 RoleGuard - Roles requeridos:', rolesRequeridos);

    if (!this.authService.estaAutenticado()) {
      console.log('❌ RoleGuard - Usuario no autenticado');
      this.router.navigate(['/login']);
      return false;
    }

    const usuario = this.authService.obtenerUsuario();
    
    console.log('🔐 RoleGuard - Usuario actual:', usuario);

    if (!usuario) {
      console.log('❌ RoleGuard - Usuario null');
      this.router.navigate(['/']);
      return false;
    }

    // Verificar roles usando el array si está disponible
    let tieneRol = false;
    
    if (usuario.roles && usuario.roles.length > 0) {
      // Usar array de roles
      const rolesUsuario = usuario.roles.map(rol => rol.nombre);
      tieneRol = rolesRequeridos.some(rolRequerido => 
        rolesUsuario.includes(rolRequerido)
      );
      console.log('🔐 RoleGuard - Roles del usuario (array):', rolesUsuario);
    } else {
      // Usar id_rol (fallback)
      const mapaRoles: { [key: number]: string } = {
        1: 'Administrador',
        2: 'Técnico',
        3: 'Guardia de seguridad'
      };
      
      const rolUsuario = mapaRoles[usuario.id_rol];
      tieneRol = rolesRequeridos.includes(rolUsuario);
      console.log('🔐 RoleGuard - Rol del usuario (id_rol):', rolUsuario);
    }

    console.log('🔐 RoleGuard - ¿Tiene rol requerido?', tieneRol);

    if (tieneRol) {
      console.log('✅ RoleGuard - Acceso permitido');
      return true;
    }

    console.log('❌ RoleGuard - Acceso denegado (sin permisos)');
    this.router.navigate(['/']);
    return false;
  }
}