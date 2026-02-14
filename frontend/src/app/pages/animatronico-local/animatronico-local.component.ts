/**
 * COMPONENTE: AnimatronicoLocalComponent
 * 
 * Gestión de asignaciones de animatrónicos a locales
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WindowService } from '../../services/window.service';
import { AuthService, UsuarioAutenticado } from '../../services/auth.service';
import { AnimatronicoLocalService } from '../../services/animatronico-local.service';
import { AnimatronicosService } from '../../services/animatronicos.service';
import { LocalesService } from '../../services/locales.service';
import { AnimatronicoLocal } from '../../models/animatronico-local.model';
import { Animatronico } from '../../models/animatronico.model';
import { Subscription, Observable } from 'rxjs';
import { Window } from '../../services/window.service';

interface Local {
  id: number;
  ciudad: string;
  direccion: string;
}

@Component({
  selector: 'app-animatronico-local',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './animatronico-local.component.html',
  styleUrls: ['./animatronico-local.component.css']
})
export class AnimatronicoLocalComponent implements OnInit, OnDestroy {
  
  asignaciones: AnimatronicoLocal[] = [];
  animatronicos: Animatronico[] = [];
  locales: Local[] = [];
  asignacionEditando: AnimatronicoLocal | null = null;
  mostrarFormularioNuevo: boolean = false;
  mostrarFormularioEditar: boolean = false;
  
  // Control de ventana
  isMinimized: boolean = false;
  isMaximized: boolean = false;
  private windowSubscription?: Subscription;
  
  // Usuario y ventanas
  usuario: UsuarioAutenticado | null = null;
  ventanasAbiertas$!: Observable<Window[]>;
  
  nuevaAsignacion: Partial<AnimatronicoLocal> = {
    id_animatronico: 0,
    id_local: 0,
    fecha_instalacion: new Date().toISOString().split('T')[0],
    estado: 'Operativo'
  };

  estadosDisponibles = [
    'Operativo',
    'Fuera de servicio',
    'En mantenimiento',
    'Desactivado',
    'En reparación'
  ];

  constructor(
    private windowService: WindowService,
    private router: Router,
    private authService: AuthService,
    private animatronicoLocalService: AnimatronicoLocalService,
    private animatronicosService: AnimatronicosService,
    private localesService: LocalesService
  ) {}

  ngOnInit(): void {
    // Obtener ventanas abiertas para la taskbar
    this.ventanasAbiertas$ = this.windowService.windows$;
    
    // Obtener usuario autenticado
    this.authService.usuario$.subscribe(usuario => {
      this.usuario = usuario;
      if (usuario) {
        this.cargarDatos();
      }
    });
    
    // Suscribirse al estado de la ventana
    this.windowSubscription = this.windowService.windows$.subscribe(windows => {
      const thisWindow = windows.find(w => w.id === 'animatronico-local');
      if (thisWindow) {
        this.isMinimized = thisWindow.isMinimized;
        this.isMaximized = thisWindow.isMaximized;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.windowSubscription) {
      this.windowSubscription.unsubscribe();
    }
  }

  cargarDatos(): void {
    this.cargarAsignaciones();
    this.cargarAnimatronicos();
    this.cargarLocales();
  }

  cargarAsignaciones(): void {
    this.animatronicoLocalService.obtenerTodos().subscribe({
      next: (asignaciones) => {
        this.asignaciones = asignaciones;
        console.log('Asignaciones cargadas:', asignaciones);
      },
      error: (error) => {
        console.error('Error al cargar asignaciones:', error);
        this.asignaciones = [];
      }
    });
  }

  cargarAnimatronicos(): void {
    this.animatronicosService.obtenerTodos().subscribe({
      next: (animatronicos) => {
        this.animatronicos = animatronicos;
      },
      error: (error) => {
        console.error('Error al cargar animatrónicos:', error);
        this.animatronicos = [];
      }
    });
  }

  cargarLocales(): void {
    this.localesService.obtenerTodos().subscribe({
      next: (locales) => {
        this.locales = locales;
      },
      error: (error) => {
        console.error('Error al cargar locales:', error);
        this.locales = [];
      }
    });
  }

  abrirFormularioNuevo(): void {
    this.mostrarFormularioNuevo = true;
    this.nuevaAsignacion = {
      id_animatronico: this.animatronicos.length > 0 ? this.animatronicos[0].id : 0,
      id_local: this.locales.length > 0 ? this.locales[0].id : 0,
      fecha_instalacion: new Date().toISOString().split('T')[0],
      estado: 'Operativo'
    };
  }

  cerrarFormularioNuevo(): void {
    this.mostrarFormularioNuevo = false;
  }

  guardarNuevo(): void {
    if (!this.nuevaAsignacion.id_animatronico || !this.nuevaAsignacion.id_local) {
      alert('Por favor selecciona un animatrónico y un local');
      return;
    }

    this.animatronicoLocalService.asignar(this.nuevaAsignacion).subscribe({
      next: (response) => {
        console.log('Asignación creada:', response);
        this.cargarAsignaciones();
        this.cerrarFormularioNuevo();
        alert('Animatrónico asignado exitosamente');
      },
      error: (error) => {
        console.error('Error al crear asignación:', error);
        alert(error.error?.message || 'Error al asignar el animatrónico');
      }
    });
  }

  abrirFormularioEditar(asignacion: AnimatronicoLocal): void {
    this.asignacionEditando = {...asignacion};
    this.mostrarFormularioEditar = true;
  }

  cerrarFormularioEditar(): void {
    this.mostrarFormularioEditar = false;
    this.asignacionEditando = null;
  }

  actualizarEstado(): void {
    if (!this.asignacionEditando) return;

    this.animatronicoLocalService.actualizarEstado(
      this.asignacionEditando.id_animatronico,
      this.asignacionEditando.id_local,
      this.asignacionEditando.estado
    ).subscribe({
      next: (response) => {
        console.log('Estado actualizado:', response);
        this.cargarAsignaciones();
        this.cerrarFormularioEditar();
        alert('Estado actualizado exitosamente');
      },
      error: (error) => {
        console.error('Error al actualizar estado:', error);
        alert('Error al actualizar el estado');
      }
    });
  }

  eliminarAsignacion(): void {
    if (!this.asignacionEditando) return;
    
    if (!confirm(`¿Estás seguro de que deseas remover "${this.asignacionEditando.animatronico_nombre}" del local "${this.asignacionEditando.local_ciudad}"?`)) {
      return;
    }

    this.animatronicoLocalService.remover(
      this.asignacionEditando.id_animatronico,
      this.asignacionEditando.id_local
    ).subscribe({
      next: (response) => {
        console.log('Asignación eliminada:', response);
        this.cargarAsignaciones();
        this.cerrarFormularioEditar();
        alert('Asignación eliminada exitosamente');
      },
      error: (error) => {
        console.error('Error al eliminar asignación:', error);
        alert('Error al eliminar la asignación');
      }
    });
  }

  obtenerRutaFoto(nombreFoto: string): string {
    if (!nombreFoto) return 'http://localhost:3000/FNaF_Profile/freddy_clasico.jpg';
    return `http://localhost:3000/FNaF_Profile/${nombreFoto}`;
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'http://localhost:3000/FNaF_Profile/freddy_clasico.jpg';
  }

  obtenerColorEstado(estado: string): string {
    switch (estado) {
      case 'Operativo': return '#28a745';
      case 'Fuera de servicio': return '#dc3545';
      case 'En mantenimiento': return '#ffc107';
      case 'Desactivado': return '#6c757d';
      case 'En reparación': return '#17a2b8';
      default: return '#6c757d';
    }
  }

  cerrarVentana(): void {
    this.windowService.closeWindow('animatronico-local');
    this.router.navigate(['/home2']);
  }

  minimizarVentana(): void {
    this.windowService.minimizeWindow('animatronico-local');
    this.router.navigate(['/home2']);
  }

  toggleMaximizar(): void {
    this.windowService.toggleMaximize('animatronico-local');
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
