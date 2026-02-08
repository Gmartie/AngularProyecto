/**
 * COMPONENTE: Home2Component
 * 
 * Escritorio estilo Windows 95 con iconos de programas
 * Los iconos de animatronicos y locales cambian según el id_local del usuario
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // 
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
  rolesPermitidos?: string[];
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
        funcional: true
      },
      {
        id: 'locales',
        nombre: 'Locales',
        icono: this.getIconoLocales(),
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
      
      // PROGRAMAS DECORATIVOS
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

  filtrarProgramas(): void {
    if (!this.usuario) {
      this.programasFiltrados = [];
      return;
    }

    const programas = this.crearProgramas();

    this.programasFiltrados = programas.filter(programa => {
      if (!programa.funcional) {
        return true;
      }

      if (!programa.rolesPermitidos || programa.rolesPermitidos.length === 0) {
        return true;
      }

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

  getHoraActual(): string {
    const ahora = new Date();
    return ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }
}
