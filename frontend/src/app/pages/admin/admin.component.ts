/**
 * ════════════════════════════════════════════════════════════════════════════
 * COMPONENTE: AdminComponent
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * PROPÓSITO:
 * Panel de administración principal de la aplicación. Sirve como hub central
 * desde el cual los administradores pueden acceder a todas las funciones de
 * gestión del sistema (alumnos, profesores, matrículas, módulos, etc).
 * 
 * FUNCIONALIDAD PRINCIPAL:
 * - Mostrar dashboard administrativo
 * - Proporcionar acceso rápido a todas las herramientas admin
 * - Mostrar información del usuario administrador actual
 * - Controlar visibilidad de opciones según permisos
 * 
 * PROTECCIÓN:
 * ✅ Solo accesible por usuarios con rol "Administrador"
 * ✅ Protegido por RoleGuard en las rutas
 * 
 * DEPENDENCIAS:
 * - CommonModule: ngIf, ngFor, ngSwitch para lógica de plantilla
 * - RouterLink: Navegación entre rutas del panel admin
 * - AuthService: Obtener datos del usuario autenticado
 * - Observable/RxJS: Manejo reactivo de cambios de usuario
 * 
 * ════════════════════════════════════════════════════════════════════════════
 */

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UsuarioAutenticado } from '../../models/user.model';

/**
 * Decorador @Component
 * 
 * selector: 'app-admin'
 *   → El tag HTML donde se insertar este componente es <app-admin></app-admin>
 * 
 * standalone: true
 *   → Este es un componente standalone (Angular 14+)
 *   → No necesita módulo NgModule para funcionar
 *   → Es más moderno y ligero que la arquitectura de módulos
 * 
 * imports: [CommonModule, RouterLink]
 *   → CommonModule: proporciona *ngIf, *ngFor, *ngSwitch, etc
 *   → RouterLink: proporciona [routerLink], routerLinkActive, etc para navegación
 *   → Estos módulos son necesarios para que la plantilla HTML funcione
 * 
 * templateUrl: './admin.component.html'
 *   → Ruta al archivo HTML de la plantilla
 * 
 * styleUrls: ['./admin.component.css']
 *   → Array de rutas a archivos CSS (puede haber múltiples)
 *   → Los estilos definidos aquí tienen alcance local (no afectan otros componentes)
 */
@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  /**
   * ──────────────────────────────────────────────────────────────────────
   * PROPIEDADES DEL COMPONENTE
   * ──────────────────────────────────────────────────────────────────────
   */

  /**
   * usuario: Signal<UsuarioAutenticado | null>
   * 
   * QUÉ ES:
   * Una señal reactiva del usuario autenticado actualmente.
   * Convierte el Observable del servicio en un Signal.
   * 
   * POR QUÉ ES SIGNAL:
   * - Las Signals son más eficientes que Observables en Angular 17+
   * - No requieren pipe async en templates
   * - Se actualizan automáticamente cuando el usuario cambia
   * - Mejor rendimiento y simplicidad
   * 
   * TIPO: UsuarioAutenticado | null
   * - Puede ser un objeto UsuarioAutenticado (usuario logueado)
   * - O null (sin usuario autenticado)
   * 
   * CÓMO SE USA EN PLANTILLA:
   * <div>{{ usuario()?.usuario }}</div>
   * Se accede con () porque es una función Signal
   * 
   * EJEMPLO DE DATOS:
   * {
   *   id: 1,
   *   usuario: "admin",
   *   email: "admin@example.com",
   *   activo: true,
   *   roles: [
   *     { id: 1, nombre: "Administrador" }
   *   ],
   *   permisos: ["crear_modulo", "eliminar_alumno", ...]
   * }
   */
  usuario = signal<UsuarioAutenticado | null>(null);

  /**
   * ──────────────────────────────────────────────────────────────────────
   * CONSTRUCTOR
   * ──────────────────────────────────────────────────────────────────────
   * 
   * El constructor es más simple ahora.
   * La signal usuario ya se inicializa directamente como una propiedad.
   * 
   * @param authService
   *   → Servicio inyectado que gestiona autenticación
   *   → 'private readonly' significa que solo puede usarse dentro del componente
   *   → 'readonly' significa que no puede reasignarse (es constante)
   */
  constructor(private readonly authService: AuthService) {
    this.authService.usuario$.subscribe(usuario => {
      this.usuario.set(usuario);
    });
  }

  /**
   * ──────────────────────────────────────────────────────────────────────
   * CICLO DE VIDA: ngOnInit()
   * ──────────────────────────────────────────────────────────────────────
   */
  ngOnInit(): void {
    console.log('Panel Admin cargado');
  }
}

