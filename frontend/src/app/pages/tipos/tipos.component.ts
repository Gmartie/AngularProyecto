import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WindowService } from '../../services/window.service';
import { AuthService, UsuarioAutenticado } from '../../services/auth.service';
import { TiposAnimatronicosService } from '../../services/tiposanimatronicos.service';
import { LocalesService } from '../../services/locales.service';
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
  
  // Control de ventana
  isMinimized: boolean = false;
  isMaximized: boolean = false;
  private windowSubscription?: Subscription;
  
  // Usuario y ventanas
  usuario: UsuarioAutenticado | null = null;
  ventanasAbiertas$!: Observable<Window[]>;
  
  nuevoTipo: Partial<TipoAnimatronico> = {
    nombre: '',
    id_local: 1
  };

  constructor(
    private windowService: WindowService,
    private router: Router,
    private authService: AuthService,
    private tiposService: TiposAnimatronicosService,
    private localesService: LocalesService
  ) {}

  ngOnInit(): void {
    // Obtener ventanas abiertas para la taskbar
    this.ventanasAbiertas$ = this.windowService.windows$;
    
    // Obtener usuario autenticado
    this.authService.usuario$.subscribe(usuario => {
      this.usuario = usuario;
      console.log('Usuario en tipos component:', this.usuario);
      
      if (usuario) {
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
  console.log(' CARGANDO TIPOS DE ANIMATRÓNICOS');
  console.log('═══════════════════════════════════════════════════════');
  console.log('Usuario actual:', this.usuario);
  console.log('ID Local del usuario:', this.usuario?.id_local);
  
  this.tiposService.obtenerTodos().subscribe({
    next: (tipos) => {
      console.log('');
      console.log('📥 Tipos recibidos (ya procesados por el servicio):');
      console.log('  - Es un array?', Array.isArray(tipos));
      console.log('  - Cantidad:', tipos.length);
      console.log('  - Datos:', tipos);
      
      // Filtrar solo los tipos del local del usuario
      if (this.usuario && this.usuario.id_local !== undefined && this.usuario.id_local !== null) {
        console.log('');
        console.log(' Filtrando por local:', this.usuario.id_local);
        
        this.tipos = tipos.filter(tipo => {
          const match = tipo.id_local === this.usuario!.id_local;
          console.log(`  Tipo "${tipo.nombre}" (local ${tipo.id_local}) → ${match ? '✅' : '❌'}`);
          return match;
        });
        
        console.log('');
        console.log('Tipos filtrados:', this.tipos.length);
        console.log(' Array final this.tipos:', this.tipos);
      } else {
        console.warn(' Usuario no tiene id_local, mostrando todos');
        this.tipos = tipos;
      }
      
      console.log('═══════════════════════════════════════════════════════');
      console.log('');
    },
    error: (error) => {
      console.error(' Error al cargar tipos:', error);
      this.tipos = [];
    }
  });
}

  abrirFormularioNuevo(): void {
    this.mostrarFormularioNuevo = true;
    // Si el usuario tiene un local asignado, usarlo por defecto
    const localPorDefecto = this.usuario?.id_local || (this.locales.length > 0 ? this.locales[0].id : 1);
    this.nuevoTipo = {
      nombre: '',
      id_local: localPorDefecto
    };
  }

  cerrarFormularioNuevo(): void {
    this.mostrarFormularioNuevo = false;
  }

  guardarNuevo(): void {
    if (!this.nuevoTipo.nombre || !this.nuevoTipo.id_local) {
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
    this.tipoEditando = {...tipo};
    this.mostrarFormularioEditar = true;
  }

  cerrarFormularioEditar(): void {
    this.mostrarFormularioEditar = false;
    this.tipoEditando = null;
  }

  actualizarTipo(): void {
    if (!this.tipoEditando || !this.tipoEditando.id) return;

    if (!this.tipoEditando.nombre || !this.tipoEditando.id_local) {
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

  obtenerNombreLocal(id_local: number): string {
    const local = this.locales.find(l => l.id === id_local);
    return local ? `${local.ciudad} - ${local.direccion}` : 'Desconocido';
  }

  /**
   * Cierra la ventana y vuelve a home2
   */
  cerrarVentana(): void {
    this.windowService.closeWindow('tipos');
    this.router.navigate(['/home2']);
  }

  /**
   * Minimiza la ventana
   */
  minimizarVentana(): void {
    this.windowService.minimizeWindow('tipos');
    this.router.navigate(['/home2']);
  }

  /**
   * Maximiza/restaura la ventana
   */
  toggleMaximizar(): void {
    this.windowService.toggleMaximize('tipos');
  }

  /**
   * Restaura una ventana desde la taskbar
   */
  restaurarVentana(windowId: string): void {
    this.windowService.restoreWindow(windowId);
    const window = this.windowService.getWindow(windowId);
    if (window?.route) {
      this.router.navigate([window.route]);
    }
  }

  /**
   * Cierra sesión desde la taskbar
   */
  cerrarSesion(): void {
    this.windowService.closeAllWindows();
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  /**
   * Obtiene la hora actual para la taskbar
   */
  getHoraActual(): string {
    const ahora = new Date();
    return ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }
}