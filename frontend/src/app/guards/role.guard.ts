/**
 * ================================================================================
 * GUARD DE ROLES: RoleGuard
 * ================================================================================
 * 
 * PROPÓSITO:
 * Este guard protege rutas que requieren roles específicos.
 * Verifica no solo que el usuario esté logueado, sino que tenga
 * los roles necesarios para acceder a esa ruta.
 * 
 * EJEMPLO:
 * Solo administradores pueden acceder a /admin
 * Solo administradores y jefes pueden acceder a /alumnos
 * Solo alumnos pueden acceder a /mis-matriculas
 * 
 * CÓMO FUNCIONA:
 * 1. Verifica que el usuario esté autenticado
 * 2. Obtiene los roles requeridos de la configuración de la ruta
 * 3. Compara los roles del usuario con los roles requeridos
 * 4. Si tiene al menos uno de los roles requeridos: PERMITE acceso
 * 5. Si no tiene los roles: DENIEGA acceso y redirige a home
 * 
 * UBICACIÓN EN RUTAS:
 * Se usa en app.routes.ts con la propiedad 'data' y 'canActivate':
 * 
 * Example:
 * {
 *   path: 'admin',
 *   component: AdminComponent,
 *   canActivate: [RoleGuard],
 *   data: { roles: ['Administrador'] }  // 👈 Solo admin
 * },
 * {
 *   path: 'alumnos',
 *   component: AlumnosComponent,
 *   canActivate: [RoleGuard],
 *   data: { roles: ['Administrador', 'Jefe Departamento'] }  // 👈 Admin O Jefe
 * }
 * 
 * ROLES DISPONIBLES EN EL SISTEMA:
 * - 'Administrador': Control total del sistema
 * - 'Jefe Departamento': Gestiona alumnos, profesores y módulos
 * - 'Tutor': Puede crear/editar módulos
 * - 'Profesor': Puede ver y editar módulos asignados
 * - 'Alumno': Acceso y gestión de  matrículas
 * - 'Usuario Registrado': Acceso limitado
 * 
 * ================================================================================
 */

import { Injectable } from '@angular/core';  
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * @Injectable: Marca esta clase como inyectable en toda la aplicación
 * providedIn: 'root' = disponible globalmente
 */
@Injectable({
  providedIn: 'root'
})

// a la fuerza la clase RoleGuard debe tener el método canActivate
export class RoleGuard implements CanActivate {
  /**
   * Constructor del guard
   * 
   * @param authService - Servicio de autenticación para obtener datos del usuario
   * @param router - Servicio para navegar a otras rutas
   */
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  /**
   * MÉTODO PRINCIPAL: canActivate
   * 
   * Se ejecuta automáticamente cuando Angular intenta navegar a una ruta protegida por roles.
   * Es parte de la interfaz CanActivate de Angular.
   * 
   * @param route - Información de la ruta (contiene los roles requeridos en route.data['roles'])
   * @param state - Estado actual del router (incluye la URL completa)
   * 
   * @returns boolean
   *   - true: Usuario tiene los roles requeridos, permite navegar
   *   - false: Usuario no tiene roles, bloquea navegación y redirige a home
   * 
   * FLUJO COMPLETO:
   * ┌──────────────────────────────────────────────────────────────────┐
   * │ 1. Usuario intenta ir a ruta protegida (ej: /admin)              │
   * │ 2. Guard ejecuta canActivate()                                   │
   * │ 3. Extrae roles requeridos de route.data['roles']               │
   * │ 4. ¿Está autenticado?                                            │
   * │    ├─ NO → redirige a /login (falla)                            │
   * │    └─ SÍ → continúa                                             │
   * │ 5. Obtiene usuario y sus roles                                   │
   * │ 6. Compara: ¿Usuario tiene alguno de los roles requeridos?      │
   * │    ├─ SÍ → return true (permite navegar) ✅                      │
   * │    └─ NO → redirige a / (acceso denegado) ❌                     │
   * └──────────────────────────────────────────────────────────────────┘
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // =================================================================
    // PASO 1: Extraer roles requeridos de la configuración de la ruta
    // =================================================================
    // Estos roles vienen de route.data['roles'] en app.routes.ts
    // Ejemplo: data: { roles: ['Administrador', 'Jefe Departamento'] }
    const rolesRequeridos = route.data['roles'] as string[];

    console.log('🔐 RoleGuard - Validando acceso a ruta:', state.url);
    console.log('🔐 RoleGuard - Roles requeridos:', rolesRequeridos);

    // =================================================================
    // PASO 2: Verificar que el usuario esté autenticado
    // =================================================================
    if (!this.authService.estaAutenticado()) {
      console.log('❌ RoleGuard - Usuario no autenticado');
      this.router.navigate(['/login']);
      return false; // ❌ Bloquea: no puede entrar sin estar logueado
    }

    // =================================================================
    // PASO 3: Obtener datos del usuario autenticado
    // =================================================================
    // obtenerUsuario() devuelve el usuario guardado en localStorage
    const usuario = this.authService.obtenerUsuario();
    
    console.log('🔐 RoleGuard - Usuario actual:', usuario);
    console.log('🔐 RoleGuard - Roles del usuario:', usuario?.roles);

    // =================================================================
    // PASO 4: Validar que el usuario tenga roles asignados
    // =================================================================
    // En casos raros, el usuario podría no tener roles definidos
    if (!usuario || !usuario.roles) {
      console.log('❌ RoleGuard - Usuario o roles es null');
      // Redirige a home (no a login, porque ya está autenticado)
      this.router.navigate(['/']);
      return false; // ❌ Bloquea: sin roles no puede entrar
    }

    // =================================================================
    // PASO 5: Comparar roles del usuario con roles requeridos
    // =================================================================
    // Verifica si el usuario tiene al menos UNO de los roles requeridos
    // 
    // rolesRequeridos: ['Administrador', 'Jefe Departamento']
    // usuario.roles: [{ id: 1, nombre: 'Administrador' }, ...]
    // 
    // some() retorna true si encuentra al menos una coincidencia
    const tieneRol = rolesRequeridos.some(rolRequerido => 
      usuario.roles.some(rolDelUsuario => rolDelUsuario.nombre === rolRequerido)
    );

    console.log('🔐 RoleGuard - ¿Tiene rol requerido?', tieneRol);

    // =================================================================
    // PASO 6: Permitir o denegar acceso según los roles
    // =================================================================
    if (tieneRol) {
      console.log('✅ RoleGuard - Acceso permitido');
      return true; // ✅ PERMITE: el usuario tiene uno de los roles requeridos
    }

    // Usuario está logueado pero NO tiene los roles necesarios
    console.log('❌ RoleGuard - Acceso denegado (sin permisos)');
    this.router.navigate(['/']); // Redirige a home
    return false; // ❌ BLOQUEA: no tiene los roles necesarios
  }
}
