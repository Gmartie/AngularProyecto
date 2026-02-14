/**
 * COMPONENTE: TiposComponent - VERSIÓN CON CONTROL DE PERMISOS
 * 
 * Gestión de tipos de animatrónicos con permisos según rol:
 * - id_rol = 1 (Propietario): CRUD completo
 * - id_rol = 2 (Técnico): CRUD completo
 * - Otros roles: NO tienen acceso (el icono no aparece en home2)
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WindowService } from '../../services/window.service';
import { AuthService, UsuarioAutenticado } from '../../services/auth.service';
import { TiposAnimatronicosService } from '../../services/tiposanimatronicos.service';
import { LocalesService } from '../../services/locales.service';
import { PermisosService } from '../../services/permisos.service';  // NUEVO
import { TipoAnimatronico } from '../../models/tiposanimatronicos.model';
import { Local } from '../../models/local.model';
import { Subscription, Observable } from 'rxjs';
import { Window } from '../../services/window.service';

@Component({
  selector: 'app-tipos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tipos.component.html',
  styleUrls: ['./tipos.component.css']
})
export class TiposComponent implements OnInit, OnDestroy {
  
  tipos: TipoAnimatronico[] = [];
  locales: Local[] = [];
  tipoEditando: TipoAnimatronico | null = null;
  mostrarFormularioNuevo: boolean = false;
  mostrarFormularioEditar: boolean = false;
  
  // NUEVO: Variables de control de permisos
  puedeEditar: boolean = false;
  puedeCrear: boolean = false;
  puedeEliminar: boolean = false;
  
  // Control de ventana
  isMinimized: boolean = false;
  isMaximized: boolean = false;
  private windowSubscription?: Subscription;
  
  // Usuario y ventanas
  usuario: UsuarioAutenticado | null = null;
  ventanasAbiertas$!: Observable<Window[]>;
  
  nuevoTipo: Partial<TipoAnimatronico> = {
    nombre: ''
  };

  constructor(
    private windowService: WindowService,
    private router: Router,
    private authService: AuthService,
    private tiposService: TiposAnimatronicosService,
    private localesService: LocalesService,
    public permisosService: PermisosService  // NUEVO - public para usar en template
  ) {}

  ngOnInit(): void {
    // Obtener ventanas abiertas para la taskbar
    this.ventanasAbiertas$ = this.windowService.windows$;
    
    // Obtener usuario autenticado
    this.authService.usuario$.subscribe(usuario => {
      this.usuario = usuario;
      console.log('Usuario en tipos component:', this.usuario);
      
      if (usuario) {
        // NUEVO: Configurar permisos
        this.configurarPermisos();
        this.cargarLocales();
        this.cargarTipos();
      }
    });
    
    // Suscribirse al estado de la ventana
    this.windowSubscription = this.windowService.windows$.subscribe(windows => {
      const thisWindow = windows.find(w => w.id === 'tipos');
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

  /**
   * NUEVO: Configura los permisos del usuario actual
   */
  private configurarPermisos(): void {
    this.puedeEditar = this.permisosService.puedeEditarTipos();
    this.puedeCrear = this.permisosService.puedeCrearTipos();
    this.puedeEliminar = this.permisosService.puedeEliminarTipos();
    
    console.log('Permisos de Tipos configurados:', {
      puedeEditar: this.puedeEditar,
      puedeCrear: this.puedeCrear,
      puedeEliminar: this.puedeEliminar,
      rol: this.permisosService.obtenerNombreRol()
    });
  }

  cargarLocales(): void {
    this.localesService.obtenerTodos().subscribe({
      next: (locales) => {
        this.locales = locales;
        console.log('Locales cargados:', locales);
      },
      error: (error) => {
        console.error('Error al cargar locales:', error);
        this.locales = [];
      }
    });
  }

  cargarTipos(): void {
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📦 CARGANDO TIPOS DE ANIMATRÓNICOS');
    console.log('═══════════════════════════════════════════════════════');
    
    this.tiposService.obtenerTodos().subscribe({
      next: (tipos) => {
        console.log('📥 Tipos recibidos:', tipos);
        this.tipos = tipos;
        console.log('✅ Tipos cargados:', this.tipos.length);
        console.log('═══════════════════════════════════════════════════════');
      },
      error: (error) => {
        console.error('❌ Error al cargar tipos:', error);
        this.tipos = [];
      }
    });
  }

  abrirFormularioNuevo(): void {
    // NUEVO: Verificar permisos antes de abrir formulario
    if (!this.puedeCrear) {
      alert('No tienes permisos para crear nuevos tipos de animatrónicos.');
      return;
    }
    
    this.mostrarFormularioNuevo = true;
    this.nuevoTipo = {
      nombre: ''
    };
  }

  cerrarFormularioNuevo(): void {
    this.mostrarFormularioNuevo = false;
  }

  guardarNuevo(): void {
    if (!this.nuevoTipo.nombre) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    this.tiposService.crear(this.nuevoTipo as TipoAnimatronico).subscribe({
      next: (response) => {
        console.log('Tipo creado:', response);
        this.cargarTipos();
        this.cerrarFormularioNuevo();
      },
      error: (error) => {
        console.error('Error al crear tipo:', error);
        alert('Error al guardar el tipo de animatrónico. Verifica la conexión con el servidor.');
      }
    });
  }

  abrirFormularioEditar(tipo: TipoAnimatronico): void {
    // NUEVO: Verificar permisos antes de abrir formulario
    if (!this.puedeEditar) {
      alert('No tienes permisos para editar tipos de animatrónicos.');
      return;
    }
    
    this.tipoEditando = {...tipo};
    this.mostrarFormularioEditar = true;
  }

  cerrarFormularioEditar(): void {
    this.mostrarFormularioEditar = false;
    this.tipoEditando = null;
  }

  actualizarTipo(): void {
    if (!this.tipoEditando || !this.tipoEditando.id) return;

    if (!this.tipoEditando.nombre) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    this.tiposService.actualizar(this.tipoEditando.id, this.tipoEditando).subscribe({
      next: (response) => {
        console.log('Tipo actualizado:', response);
        this.cargarTipos();
        this.cerrarFormularioEditar();
      },
      error: (error) => {
        console.error('Error al actualizar tipo:', error);
        alert('Error al actualizar el tipo de animatrónico. Verifica la conexión con el servidor.');
      }
    });
  }

  eliminarTipo(): void {
    if (!this.tipoEditando || !this.tipoEditando.id) return;
    
    // NUEVO: Verificar permisos antes de eliminar
    if (!this.puedeEliminar) {
      alert('No tienes permisos para eliminar tipos de animatrónicos.');
      return;
    }
    
    if (!confirm(`¿Estás seguro de que deseas eliminar el tipo "${this.tipoEditando.nombre}"?`)) {
      return;
    }

    this.tiposService.eliminar(this.tipoEditando.id).subscribe({
      next: (response) => {
        console.log('Tipo eliminado:', response);
        this.cargarTipos();
        this.cerrarFormularioEditar();
      },
      error: (error) => {
        console.error('Error al eliminar tipo:', error);
        alert('Error al eliminar el tipo. Verifica la conexión con el servidor.');
      }
    });
  }

  /**
   * Obtiene el icono de animatrónico según el nombre del tipo
   */
  obtenerIconoPorTipo(nombreTipo: string): string {
    const nombreLower = nombreTipo.toLowerCase();
    
    if (nombreLower.includes('unwithered') || nombreLower.includes('withered')) {
      return '/Icons/w_freddy_icon.png';
    } else if (nombreLower.includes('toy')) {
      return '/Icons/t_freddy_icon.png';
    } else if (nombreLower.includes('funtime')) {
      return '/Icons/f_freddy_icon.png';
    } else if (nombreLower.includes('clásico') || nombreLower.includes('clasico')) {
      return '/Icons/freddy_icon.png';
    } else {
      return '/Icons/freddy_icon.png'; // Default
    }
  }

  cerrarVentana(): void {
    this.windowService.closeWindow('tipos');
    this.router.navigate(['/home2']);
  }

  minimizarVentana(): void {
    this.windowService.minimizeWindow('tipos');
    this.router.navigate(['/home2']);
  }

  toggleMaximizar(): void {
    this.windowService.toggleMaximize('tipos');
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
