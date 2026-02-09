import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WindowService } from '../../services/window.service';
import { AuthService, UsuarioAutenticado } from '../../services/auth.service';
import { LocalesService } from '../../services/locales.service';
import { Local } from '../../models/local.model';
import { Subscription, Observable } from 'rxjs';
import { Window } from '../../services/window.service';

@Component({
  selector: 'app-locales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './locales.component.html',
  styleUrls: ['./locales.component.css']
})
export class LocalesComponent implements OnInit, OnDestroy {
  
  // El local donde trabaja el usuario
  localUsuario: Local | null = null;
  localEditando: Local | null = null;
  mostrarFormularioNuevo: boolean = false;
  mostrarFormularioEditar: boolean = false;
  
  // Control de ventana
  isMinimized: boolean = false;
  isMaximized: boolean = false;
  private windowSubscription?: Subscription;
  
  // Usuario y ventanas
  usuario: UsuarioAutenticado | null = null;
  ventanasAbiertas$!: Observable<Window[]>;
  
  nuevoLocal: Partial<Local> = {
    fecha_apertura: new Date(),
    aforo: 100,
    foto: '',
    ciudad: 'Hurricane',
    direccion: '',
    abierto: true
  };

  constructor(
    private windowService: WindowService,
    private router: Router,
    private authService: AuthService,
    private localesService: LocalesService
  ) {}

  ngOnInit(): void {
    console.log('LocalesComponent inicializado');
    
    // Obtener ventanas abiertas para la taskbar
    this.ventanasAbiertas$ = this.windowService.windows$;
    
    // Obtener usuario autenticado
    this.authService.usuario$.subscribe(usuario => {
      console.log('Usuario recibido en LocalesComponent:', usuario);
      this.usuario = usuario;
      if (usuario) {
        console.log('ID Local del usuario:', usuario.id_local);
        this.cargarLocalUsuario();
      } else {
        console.warn('No hay usuario autenticado');
      }
    });
    
    // Suscribirse al estado de la ventana
    this.windowSubscription = this.windowService.windows$.subscribe(windows => {
      const thisWindow = windows.find(w => w.id === 'locales');
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

  cargarLocalUsuario(): void {
    console.log('Usuario actual:', this.usuario);
    
    // Verificar que el usuario existe y tiene un id_local válido (mayor que 0)
    if (!this.usuario || this.usuario.id_local === undefined || this.usuario.id_local === null || this.usuario.id_local === 0) {
      console.log('Usuario no tiene local asignado (id_local:', this.usuario?.id_local, ')');
      this.localUsuario = null;
      return;
    }

    console.log('Intentando cargar local con ID:', this.usuario.id_local);

    // Obtener el local específico del usuario
    this.localesService.obtenerPorId(this.usuario.id_local).subscribe({
      next: (local) => {
        this.localUsuario = local;
        console.log('Local del usuario cargado exitosamente:', local);
      },
      error: (error) => {
        console.error('Error al cargar el local:', error);
        console.error('Detalles del error:', error.message || error);
        this.localUsuario = null;
      }
    });
  }

  abrirFormularioNuevo(): void {
    this.mostrarFormularioNuevo = true;
    this.nuevoLocal = {
      fecha_apertura: new Date(),
      aforo: 100,
      foto: '',
      ciudad: 'Hurricane',
      direccion: '',
      abierto: true
    };
  }

  cerrarFormularioNuevo(): void {
    this.mostrarFormularioNuevo = false;
  }

  guardarNuevo(): void {
    if (!this.nuevoLocal.ciudad || !this.nuevoLocal.direccion || !this.nuevoLocal.aforo || this.nuevoLocal.aforo <= 0) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    // Crear el objeto Local completo
    const localParaCrear: Omit<Local, 'id'> = {
      fecha_apertura: this.nuevoLocal.fecha_apertura || new Date(),
      aforo: this.nuevoLocal.aforo,
      foto: this.nuevoLocal.foto || '',
      ciudad: this.nuevoLocal.ciudad,
      direccion: this.nuevoLocal.direccion,
      abierto: this.nuevoLocal.abierto ?? true
    };

    this.localesService.crear(localParaCrear as Local).subscribe({
      next: (response) => {
        console.log('Local creado:', response);
        this.cargarLocalUsuario();
        this.cerrarFormularioNuevo();
      },
      error: (error) => {
        console.error('Error al crear local:', error);
        alert('Error al guardar el local. Verifica la conexión con el servidor.');
      }
    });
  }

  abrirFormularioEditar(local: Local): void {
    this.localEditando = {...local};
    this.mostrarFormularioEditar = true;
  }

  cerrarFormularioEditar(): void {
    this.mostrarFormularioEditar = false;
    this.localEditando = null;
  }

  actualizarLocal(): void {
    if (!this.localEditando || !this.localEditando.id) return;

    if (!this.localEditando.ciudad || !this.localEditando.direccion || this.localEditando.aforo <= 0) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    this.localesService.actualizar(this.localEditando.id, this.localEditando).subscribe({
      next: (response) => {
        console.log('Local actualizado:', response);
        this.cargarLocalUsuario();
        this.cerrarFormularioEditar();
      },
      error: (error) => {
        console.error('Error al actualizar local:', error);
        alert('Error al actualizar el local. Verifica la conexión con el servidor.');
      }
    });
  }

  eliminarLocal(): void {
    if (!this.localEditando || !this.localEditando.id) return;
    
    if (!confirm(`¿Estás seguro de que deseas eliminar el local en ${this.localEditando.ciudad}?`)) {
      return;
    }

    this.localesService.eliminar(this.localEditando.id).subscribe({
      next: (response) => {
        console.log('Local eliminado:', response);
        this.localUsuario = null;
        this.cerrarFormularioEditar();
      },
      error: (error) => {
        console.error('Error al eliminar local:', error);
        alert('Error al eliminar el local. Verifica la conexión con el servidor.');
      }
    });
  }

  /**
   * Obtiene la ruta de la foto del restaurante
   */
  obtenerRutaFoto(nombreFoto: string): string {
    if (!nombreFoto) return '/FNaF_RESTAURANTES/freddy_pizza_1983.jpg'; // Imagen por defecto
    return `/FNaF_RESTAURANTES/${nombreFoto}`;
  }

  /**
   * Maneja errores de carga de imágenes
   */
  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = '/FNaF_RESTAURANTES/freddy_pizza_1983.jpg';
  }

  /**
   * Maneja la selección de archivos de imagen
   */
  onFileSelected(event: any, esNuevo: boolean = true): void {
    const file = event.target.files[0];
    if (file) {
      const fileName = file.name;
      
      if (esNuevo) {
        this.nuevoLocal.foto = fileName;
      } else if (this.localEditando) {
        this.localEditando.foto = fileName;
      }
    }
  }

  /**
   * Formatea la fecha para mostrar
   */
  formatearFecha(fecha: Date | string): string {
    if (!fecha) return 'N/A';
    const date = fecha instanceof Date ? fecha : new Date(fecha);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  /**
   * Convierte Date a string formato YYYY-MM-DD para inputs
   */
  fechaParaInput(fecha: Date | string): string {
    if (!fecha) return '';
    const date = fecha instanceof Date ? fecha : new Date(fecha);
    return date.toISOString().split('T')[0];
  }

  /**
   * Maneja el cambio de fecha en el formulario de edición
   */
  onFechaChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (this.localEditando && input.value) {
      this.localEditando.fecha_apertura = new Date(input.value);
    }
  }

  /**
   * Maneja el cambio de fecha en el formulario de nuevo local
   */
  onFechaChangeNuevo(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      this.nuevoLocal.fecha_apertura = new Date(input.value);
    }
  }

  /**
   * Cierra la ventana y vuelve a home2
   */
  cerrarVentana(): void {
    this.windowService.closeWindow('locales');
    this.router.navigate(['/home2']);
  }

  /**
   * Minimiza la ventana
   */
  minimizarVentana(): void {
    this.windowService.minimizeWindow('locales');
    this.router.navigate(['/home2']);
  }

  /**
   * Maximiza/restaura la ventana
   */
  toggleMaximizar(): void {
    this.windowService.toggleMaximize('locales');
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
