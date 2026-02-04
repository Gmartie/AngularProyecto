/**
 * COMPONENTE: Home2Component
 * 
 * Escritorio estilo Windows 95 con iconos de programas
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService, UsuarioAutenticado } from '../../services/auth.service';
import { WindowService } from '../../services/window.service';

interface ProgramaIcono {
  id: string;
  nombre: string;
  icono: string;
  ruta?: string;
  descripcion: string;
  rolesPermitidos?: string[];
  funcional: boolean; // true = tiene funcionalidad, false = solo decorativo
}

@Component({
  selector: 'app-home2',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home2.component.html',
  styleUrls: ['./home2.component.css']
})
export class Home2Component implements OnInit {
  usuario: UsuarioAutenticado | null = null;
  ventanasAbiertas$!: Observable<any>;
  
  // Todos los programas (funcionales y decorativos)
  programas: ProgramaIcono[] = [
    // PROGRAMAS FUNCIONALES
    {
      id: 'animatronicos',
      nombre: 'Animatrónicos',
      icono: '/Icons/freddy_icon.png',
      ruta: '/animatronicos',
      descripcion: 'Gestión de Animatrónicos',
      funcional: true
    },
    {
      id: 'locales',
      nombre: 'Locales',
      icono: '/Icons/restaurant_icon.png',
      ruta: '/locales',
      descripcion: 'Control de Locales',
      funcional: true
    },
    {
      id: 'tipos',
      nombre: 'Tipos',
      icono: '/Icons/springlock_icon.png',
      ruta: '/tipos',
      descripcion: 'Tipos de Animatrónicos',
      funcional: true
    },
    {
      id: 'perfil',
      nombre: 'Mi Perfil',
      icono: '/Icons/profile_icon.png',
      ruta: '/perfil',
      descripcion: 'Perfil de Operador',
      funcional: true
    },
    {
      id: 'admin',
      nombre: 'Admin',
      icono: '/Icons/computer_icon.png',
      ruta: '/admin',
      descripcion: 'Panel de Administración',
      rolesPermitidos: ['Administrador'],
      funcional: true
    },
    
    // PROGRAMAS DECORATIVOS (sin funcionalidad)
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

  programasFiltrados: ProgramaIcono[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private windowService: WindowService
  ) {}

  ngOnInit(): void {
    this.authService.usuario$.subscribe(usuario => {
      this.usuario = usuario;
      this.ventanasAbiertas$ = this.windowService.windows$;
      this.filtrarProgramas();
    });
  }

  filtrarProgramas(): void {
    if (!this.usuario) {
      this.programasFiltrados = [];
      return;
    }

    this.programasFiltrados = this.programas.filter(programa => {
      // Programas decorativos siempre se muestran
      if (!programa.funcional) {
        return true;
      }

      // Si el programa no tiene roles específicos, está disponible para todos
      if (!programa.rolesPermitidos || programa.rolesPermitidos.length === 0) {
        return true;
      }

      // Verificar si el usuario tiene alguno de los roles permitidos
      return programa.rolesPermitidos.some(rolRequerido => 
        this.tieneRol(rolRequerido)
      );
    });
  }

  tieneRol(nombreRol: string): boolean {
    if (!this.usuario?.roles) return false;
    return this.usuario.roles.some(rol => rol.nombre === nombreRol);
  }

  abrirPrograma(programa: ProgramaIcono): void {
    if (!programa.funcional) {
      // Programa decorativo - mostrar mensaje
      alert(`"${programa.nombre}" aún no está disponible.\n\nEsta función estará disponible en una futura actualización.`);
      return;
    }

    // Programa funcional - abrir ventana
    if (programa.ruta) {
      this.windowService.openWindow(
        programa.id,
        programa.nombre,
        programa.icono,
        programa.ruta
      );
    }
  }

  restaurarVentana(windowId: string): void {
    this.windowService.restoreWindow(windowId);
  }

  cerrarSesion(): void {
    this.windowService.closeAllWindows();
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  // Obtener hora actual para la barra de tareas
  getHoraActual(): string {
    const ahora = new Date();
    return ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }
}
