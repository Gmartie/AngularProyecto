/**
 * COMPONENTE: Home2Component - VERSIÓN CON CONTROL DE PERMISOS POR ROL
 * 
 * Escritorio estilo Windows 95 con iconos de programas
 * Los iconos y permisos cambian según el id_rol del usuario
 * 
 * ROLES Y PERMISOS:
 * - id_rol = 1 (Propietario): Editar local, VER animatronicos (no editar), Editar tipos
 * - id_rol = 2 (Técnico): Ver local, CRUD Tipos, CRUD Animátronicos
 * - id_rol = 3,4,5 (Guardia/Empleado/Cocinero): Solo VER locales y animatrónicos
 * - id_rol = 6 (Administrador Master): Panel admin especial (ya implementado)
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService, UsuarioAutenticado } from '../../services/auth.service';
import { WindowService } from '../../services/window.service';
import { Observable } from 'rxjs';
import { Window } from '../../services/window.service';

interface ProgramaIcono {
  id: string;
  nombre: string;
  icono: string;
  ruta?: string;
  descripcion: string;
  rolesPermitidos?: number[];  // CAMBIO: Ahora usa números (id_rol) en lugar de nombres
  funcional: boolean;
}

@Component({
  selector: 'app-home2',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home2.component.html',
  styleUrls: ['./home2.component.css']
})
export class Home2Component implements OnInit {
  usuario: UsuarioAutenticado | null = null;
  ventanasAbiertas$!: Observable<Window[]>;
  programasFiltrados: ProgramaIcono[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private windowService: WindowService
  ) {}

  ngOnInit(): void {
    this.ventanasAbiertas$ = this.windowService.windows$;

    this.authService.usuario$.subscribe(usuario => {
      this.usuario = usuario;
      this.filtrarProgramas();
    });
  }

  /**
   * Obtiene los iconos según el id_local del usuario
   */
  private getIconoAnimatronicos(): string {
    const idLocal = (this.usuario as any)?.id_local;
    
    switch (idLocal) {
      case 1: return '/Icons/w_freddy_icon.png';
      case 2: return '/Icons/t_freddy_icon.png';
      case 3: return '/Icons/f_freddy_icon.png';
      case 4:
      default: return '/Icons/freddy_icon.png';
    }
  }

  private getIconoLocales(): string {
    const idLocal = (this.usuario as any)?.id_local;
    
    switch (idLocal) {
      case 1: return '/Icons/w_restaurant_icon.png';
      case 2: return '/Icons/t_restaurant_icon.png';
      case 3: return '/Icons/f_restaurant_icon.png';
      case 4:
      default: return '/Icons/restaurant_icon.png';
    }
  }

  /**
   * Crea la lista de programas con iconos dinámicos
   * NUEVO: Cada programa tiene definidos los roles que pueden acceder a él
   */
  private crearProgramas(): ProgramaIcono[] {
    return [
      // PROGRAMAS FUNCIONALES
      {
        id: 'animatronicos',
        nombre: 'Animatrónicos',
        icono: this.getIconoAnimatronicos(),
        ruta: '/animatronicos',
        descripcion: 'Gestión de Animatrónicos',
        rolesPermitidos: [1, 2, 3, 4, 5], // Todos excepto Admin Master (6)
        funcional: true
      },
      {
        id: 'locales',
        nombre: 'Locales',
        icono: this.getIconoLocales(),
        ruta: '/locales',
        descripcion: 'Control de Locales',
        rolesPermitidos: [1, 2, 3, 4, 5], // Todos excepto Admin Master (6)
        funcional: true
      },
      {
        id: 'tipos',
        nombre: 'Tipos',
        icono: '/Icons/springlock_icon.png',
        ruta: '/tipos',
        descripcion: 'Tipos de Animatrónicos',
        rolesPermitidos: [1, 2], // Solo Propietario y Técnico
        funcional: true
      },
      {
        id: 'perfil',
        nombre: 'Mi Perfil',
        icono: '/Icons/profile_icon.png',
        ruta: '/perfil',
        descripcion: 'Perfil de Operador',
        rolesPermitidos: [1, 2, 3, 4, 5, 6], // Todos los roles
        funcional: true
      },
      {
        id: 'admin',
        nombre: 'Admin',
        icono: '/Icons/computer_icon.png',
        ruta: '/admin',
        descripcion: 'Panel de Administración',
        rolesPermitidos: [6], // Solo Administrador Master
        funcional: true
      },
      {
        id: 'animatronico-local',
        nombre: 'Asignaciones',
        icono: '/Icons/delivery_box.png',
        ruta: '/animatronico-local',
        descripcion: 'Gestión de Asignaciones',
        rolesPermitidos: [6], // Solo Administrador Master
        funcional: true
      },
      
      // PROGRAMAS DECORATIVOS (visibles para todos)
      {
        id: 'cameras',
        nombre: 'Cámaras',
        icono: '/Icons/camera_icon.png',
        descripcion: 'Sistema de Vigilancia',
        funcional: false
      },
      {
        id: 'capacity',
        nombre: 'Capacidad',
        icono: '/Icons/capacity_icon.png',
        descripcion: 'Control de Aforo',
        funcional: false
      },
      {
        id: 'files',
        nombre: 'Archivos',
        icono: '/Icons/files_icon.png',
        descripcion: 'Gestor de Archivos',
        funcional: false
      },
      {
        id: 'recycle',
        nombre: 'Papelera',
        icono: '/Icons/bin_icon.png',
        descripcion: 'Papelera de Reciclaje',
        funcional: false
      }
    ];
  }

  /**
   * NUEVO: Filtra los programas según el id_rol del usuario
   */
  filtrarProgramas(): void {
    if (!this.usuario) {
      this.programasFiltrados = [];
      return;
    }

    const programas = this.crearProgramas();
    const idRol = this.usuario.id_rol;

    this.programasFiltrados = programas.filter(programa => {
      // Los programas decorativos siempre se muestran
      if (!programa.funcional) {
        return true;
      }

      // Si no tiene restricciones de roles, se muestra a todos
      if (!programa.rolesPermitidos || programa.rolesPermitidos.length === 0) {
        return true;
      }

      // Verificar si el id_rol del usuario está en la lista de roles permitidos
      return programa.rolesPermitidos.includes(idRol);
    });
  }

  /**
   * NUEVO: Verifica si el usuario tiene un rol específico por ID
   */
  tieneRol(idRol: number): boolean {
    return this.usuario?.id_rol === idRol;
  }

  /**
   * NUEVO: Obtiene los permisos del usuario para cada módulo
   * Esto se usará en los componentes hijos
   */
  obtenerPermisos() {
    const idRol = this.usuario?.id_rol;
    
    return {
      // Permisos para ANIMATRONICOS
      animatronicos: {
        ver: [1, 2, 3, 4, 5].includes(idRol || 0),
        crear: [2].includes(idRol || 0),  // Solo Técnico
        editar: [2].includes(idRol || 0),  // Solo Técnico
        eliminar: [2].includes(idRol || 0)  // Solo Técnico
      },
      // Permisos para LOCALES
      locales: {
        ver: [1, 2, 3, 4, 5].includes(idRol || 0),
        crear: false,  // Nadie puede crear locales
        editar: [1].includes(idRol || 0),  // Solo Propietario
        eliminar: false  // Nadie puede eliminar locales
      },
      // Permisos para TIPOS
      tipos: {
        ver: [1, 2].includes(idRol || 0),  // Solo Propietario y Técnico
        crear: [1, 2].includes(idRol || 0),  // Propietario y Técnico
        editar: [1, 2].includes(idRol || 0),  // Propietario y Técnico
        eliminar: [1, 2].includes(idRol || 0)  // Propietario y Técnico
      }
    };
  }

  abrirPrograma(programa: ProgramaIcono): void {
    if (!programa.funcional) {
      alert(`"${programa.nombre}" aún no está disponible.\n\nEsta función estará disponible en una futura actualización.`);
      return;
    }

    if (programa.ruta) {
      this.windowService.openWindow(
        programa.id,
        programa.nombre,
        programa.icono,
        programa.ruta
      );
      this.router.navigate([programa.ruta]);
    }
  }

  restaurarVentana(windowId: string): void {
    this.windowService.restoreWindow(windowId);
    const window = this.windowService.getWindow(windowId);
    if (window?.route) {
      this.router.navigate([window.route]);
    }
  }

  cerrarSesion(): void {
    this.windowService.closeAllWindows();
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  getHoraActual(): string {
    const ahora = new Date();
    return ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }
}
