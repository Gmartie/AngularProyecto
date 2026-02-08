import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WindowService } from '../../services/window.service';
import { AuthService, UsuarioAutenticado } from '../../services/auth.service';
import { AnimatronicosService } from '../../services/animatronicos.service';
import { Subscription, Observable } from 'rxjs';
import { Window } from '../../services/window.service';

interface Animatronico {
  id?: number;
  nombre: string;
  reconocimiento: boolean;
  num_piezas: number;
  id_gama: number;
  nombre_gama?: string;
  planos: string;
  foto: string;
}

interface TipoAnimatronico {
  id: number;
  nombre: string;
  id_local: number;
}

@Component({
  selector: 'app-animatronicos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './animatronicos.component.html',
  styleUrls: ['./animatronicos.component.css']
})
export class AnimatronicosComponent implements OnInit, OnDestroy {
  
  animatronicos: Animatronico[] = [];
  tiposAnimatronicos: TipoAnimatronico[] = [];
  animatronicoEditando: Animatronico | null = null;
  mostrarFormularioNuevo: boolean = false;
  mostrarFormularioEditar: boolean = false;
  
  // Control de ventana
  isMinimized: boolean = false;
  isMaximized: boolean = false;
  private windowSubscription?: Subscription;
  
  // Usuario y ventanas
  usuario: UsuarioAutenticado | null = null;
  ventanasAbiertas$!: Observable<Window[]>;
  
  nuevoAnimatronico: Animatronico = {
    nombre: '',
    reconocimiento: true,
    num_piezas: 0,
    id_gama: 1,
    planos: '',
    foto: ''
  };

  constructor(
    private windowService: WindowService,
    private router: Router,
    private authService: AuthService,
    private animatronicosService: AnimatronicosService
  ) {}

  ngOnInit(): void {
    // Obtener ventanas abiertas para la taskbar
    this.ventanasAbiertas$ = this.windowService.windows$;
    
    // Obtener usuario autenticado
    this.authService.usuario$.subscribe(usuario => {
      this.usuario = usuario;
      if (usuario) {
        this.cargarTiposAnimatronicos();
        this.cargarAnimatronicos();
      }
    });
    
    // Suscribirse al estado de la ventana
    this.windowSubscription = this.windowService.windows$.subscribe(windows => {
      const thisWindow = windows.find(w => w.id === 'animatronicos');
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

  cargarTiposAnimatronicos(): void {
    // ⭐ CAMBIO: Ahora usa obtenerTipos() sin parámetros
    this.animatronicosService.obtenerTipos().subscribe({
      next: (tipos) => {
        this.tiposAnimatronicos = tipos;
      },
      error: (error) => {
        console.error('Error al cargar tipos de animatrónicos:', error);
        this.tiposAnimatronicos = [];
      }
    });
  }

  cargarAnimatronicos(): void {
    // ⭐ CAMBIO: Ahora usa obtenerTodos() sin parámetros
    // El backend filtra automáticamente por id_local del usuario autenticado
    this.animatronicosService.obtenerTodos().subscribe({
      next: (animatronicos) => {
        this.animatronicos = animatronicos;
        console.log('Animatrónicos cargados:', animatronicos);
      },
      error: (error) => {
        console.error('Error al cargar animatrónicos:', error);
        this.animatronicos = [];
      }
    });
  }

  abrirFormularioNuevo(): void {
    this.mostrarFormularioNuevo = true;
    this.nuevoAnimatronico = {
      nombre: '',
      reconocimiento: true,
      num_piezas: 0,
      id_gama: this.tiposAnimatronicos.length > 0 ? this.tiposAnimatronicos[0].id : 1,
      planos: '',
      foto: ''
    };
  }

  cerrarFormularioNuevo(): void {
    this.mostrarFormularioNuevo = false;
  }

  guardarNuevo(): void {
    if (!this.nuevoAnimatronico.nombre || this.nuevoAnimatronico.num_piezas <= 0) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    this.animatronicosService.crear(this.nuevoAnimatronico).subscribe({
      next: (response) => {
        console.log('Animatrónico creado:', response);
        this.cargarAnimatronicos();
        this.cerrarFormularioNuevo();
      },
      error: (error) => {
        console.error('Error al crear animatrónico:', error);
        alert('Error al guardar el animatrónico. Verifica la conexión con el servidor.');
      }
    });
  }

  abrirFormularioEditar(animatronico: Animatronico): void {
    this.animatronicoEditando = {...animatronico};
    this.mostrarFormularioEditar = true;
  }

  cerrarFormularioEditar(): void {
    this.mostrarFormularioEditar = false;
    this.animatronicoEditando = null;
  }

  actualizarAnimatronico(): void {
    if (!this.animatronicoEditando) return;

    if (!this.animatronicoEditando.nombre || this.animatronicoEditando.num_piezas <= 0) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    this.animatronicosService.actualizar(this.animatronicoEditando).subscribe({
      next: (response) => {
        console.log('Animatrónico actualizado:', response);
        this.cargarAnimatronicos();
        this.cerrarFormularioEditar();
      },
      error: (error) => {
        console.error('Error al actualizar animatrónico:', error);
        alert('Error al actualizar el animatrónico. Verifica la conexión con el servidor.');
      }
    });
  }

  eliminarAnimatronico(): void {
    if (!this.animatronicoEditando) return;
    
    if (!confirm(`¿Estás seguro de que deseas eliminar a ${this.animatronicoEditando.nombre}?`)) {
      return;
    }

    if (this.animatronicoEditando.id) {
      this.animatronicosService.eliminar(this.animatronicoEditando.id).subscribe({
        next: (response) => {
          console.log('Animatrónico eliminado:', response);
          this.cargarAnimatronicos();
          this.cerrarFormularioEditar();
        },
        error: (error) => {
          console.error('Error al eliminar animatrónico:', error);
          alert('Error al eliminar el animatrónico. Verifica la conexión con el servidor.');
        }
      });
    }
  }

  obtenerNombreGama(id_gama: number): string {
    return this.tiposAnimatronicos.find(t => t.id === id_gama)?.nombre || 'Desconocido';
  }

  /**
   * ⭐ CAMBIO: Ahora usa rutas absolutas con /FNaF_Profile/
   */
  obtenerRutaFoto(nombreFoto: string): string {
    if (!nombreFoto) return '/FNaF_Profile/freddy_clasico.jpg'; // Imagen por defecto
    return `/FNaF_Profile/${nombreFoto}`;
  }

  /**
   * ⭐ CAMBIO: Ahora usa rutas absolutas con /FNAF_Blueprints/
   */
  obtenerRutaPlanos(nombrePlanos: string): string {
    if (!nombrePlanos) return '/FNAF_Blueprints/freddy_clasico_planos.png'; // Planos por defecto
    return `/FNAF_Blueprints/${nombrePlanos}`;
  }

  /**
   * Maneja errores de carga de imágenes
   */
  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    // Si falla la imagen, usar la de Freddy clásico como fallback
    if (target.src.includes('FNaF_Profile')) {
      target.src = '/FNaF_Profile/freddy_clasico.jpg';
    } else {
      target.src = '/FNAF_Blueprints/freddy_clasico_planos.png';
    }
  }

  /**
   * Maneja la selección de archivos de imagen
   */
  onFileSelected(event: any, tipo: 'foto' | 'planos', esNuevo: boolean = true): void {
    const file = event.target.files[0];
    if (file) {
      const fileName = file.name;
      
      if (esNuevo) {
        if (tipo === 'foto') {
          this.nuevoAnimatronico.foto = fileName;
        } else {
          this.nuevoAnimatronico.planos = fileName;
        }
      } else if (this.animatronicoEditando) {
        if (tipo === 'foto') {
          this.animatronicoEditando.foto = fileName;
        } else {
          this.animatronicoEditando.planos = fileName;
        }
      }
    }
  }

  /**
   * Cierra la ventana y vuelve a home2
   */
  cerrarVentana(): void {
    this.windowService.closeWindow('animatronicos');
    this.router.navigate(['/home2']);
  }

  /**
   * Minimiza la ventana
   */
  minimizarVentana(): void {
    this.windowService.minimizeWindow('animatronicos');
    this.router.navigate(['/home2']);
  }

  /**
   * Maximiza/restaura la ventana
   */
  toggleMaximizar(): void {
    this.windowService.toggleMaximize('animatronicos');
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
