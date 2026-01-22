/**
 * ================================================================================
 * GUARD DE AUTENTICACIÓN: AuthGuard
 * ================================================================================
 * 
 * PROPÓSITO:
 * Este guard protege rutas que requieren que el usuario esté autenticado.
 * Si un usuario intenta acceder a una ruta protegida sin estar logueado,
 * será redirigido automáticamente a la página de login.
 * 
 * CÓMO FUNCIONA:
 * 1. Verifica si el usuario tiene un token válido (está autenticado)
 * 2. Si está autenticado: PERMITE el acceso (retorna true)
 * 3. Si NO está autenticado: DENIEGA el acceso y redirige a login
 * 
 * UBICACIÓN EN RUTAS:
 * Se usa en app.routes.ts agregándolo a la propiedad 'canActivate' de una ruta:
 * 
 * Example:
 * {
 *   path: 'admin',
 *   component: AdminComponent,
 *   canActivate: [AuthGuard]  // 👈 Protege esta ruta
 * }
 * 
 * PARÁMETROS DE LA URL:
 * Cuando redirige a login, agrega un parámetro 'returnUrl' para volver después:
 * /login?returnUrl=/admin  (regresa a /admin después de loguear)
 * 
 * ================================================================================
 */

import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * @Injectable: Marca esta clase como inyectable en toda la aplicación
 * providedIn: 'root' = disponible globalmente sin necesidad de importar en módulos
 */
@Injectable({
  providedIn: 'root'
})

// a la fuerza la clase AuthGuard debe tener el método canActivate
export class AuthGuard implements CanActivate {
  /**
   * Constructor del guard
   * 
   * @param authService - Servicio de autenticación para verificar si el usuario está logueado
   * @param router - Servicio de router de Angular para navegar a otras rutas
   */
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  /**
   * MÉTODO PRINCIPAL: canActivate
   * 
   * Se ejecuta automáticamente cuando Angular intenta navegar a una ruta protegida.
   * Es parte de la interfaz CanActivate de Angular.
   * 
   * @param route - Información de la ruta que intenta acceder
   * @param state - Estado actual del router (incluye la URL completa)
   * 
   * @returns boolean
   *   - true: Permite navegar a la ruta protegida
   *   - false: Bloquea la navegación
   * 
   * FLUJO:
   * ┌─────────────────────────────────────────────────┐
   * │ 1. Usuario intenta ir a ruta protegida          │
   * │ 2. Guard ejecuta canActivate()                  │
   * │ 3. ¿Está autenticado?                           │
   * │    ├─ SÍ → return true (permite navegar)        │
   * │    └─ NO → redirige a /login (bloquea)          │
   * └─────────────────────────────────────────────────┘
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Paso 1: Verificar si el usuario está autenticado
    // estaAutenticado() comprueba si hay token válido en localStorage
    if (this.authService.estaAutenticado()) {
      console.log('✅ AuthGuard - Usuario autenticado, acceso permitido');
      return true; // ✅ Permite el acceso a la ruta
    }

    // Paso 2: Si no está autenticado, redirigir a login
    console.log('❌ AuthGuard - Usuario no autenticado, redirigiendo a login');
    
    // Navega a /login y guarda la URL original en queryParams
    // Esto permite que después de loguear vuelva a la ruta que intentó acceder
    this.router.navigate(
      ['/login'],
      {
        queryParams: {
          returnUrl: state.url  // Ejemplo: /admin, /perfil, /matriculas
        }
      }
    );
    
    return false; // ❌ Bloquea el acceso a la ruta
  }
}
