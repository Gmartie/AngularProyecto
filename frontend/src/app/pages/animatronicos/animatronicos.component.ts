/**
 * COMPONENTE: AnimatronicosComponent - VERSIÓN CON CONTROL DE PERMISOS
 * 
 * Gestión de animatrónicos con permisos según rol:
 * - id_rol = 1 (Propietario): Solo VER
 * - id_rol = 2 (Técnico): CRUD completo
 * - id_rol = 3,4,5 (Guardia/Empleado/Cocinero): Solo VER
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WindowService } from '../../services/window.service';
import { AuthService, UsuarioAutenticado } from '../../services/auth.service';
import { AnimatronicosService } from '../../services/animatronicos.service';
import { PermisosService } from '../../services/permisos.service';  // NUEVO
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
  
  // Archivos para subir
  fotoNuevoFile: File | null = null;
  planosNuevoFile: File | null = null;
  fotoEditFile: File | null = null;
  planosEditFile: File | null = null;
  
  // NUEVO: Variables de control de permisos
  puedeEditar: boolean = false;
  puedeCrear: boolean = false;
  puedeEliminar: boolean = false;
  soloLectura: boolean = false;
  
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
    private animatronicosService: AnimatronicosService,
    public permisosService: PermisosService  // NUEVO
  ) {}

  ngOnInit(): void {
    // Obtener ventanas abiertas para la taskbar
    this.ventanasAbiertas$ = this.windowService.windows$;
    
    // Obtener usuario autenticado
    this.authService.usuario$.subscribe(usuario => {
      this.usuario = usuario;
      if (usuario) {
        // NUEVO: Configurar permisos
        this.configurarPermisos();
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

  /**
   * NUEVO: Configura los permisos del usuario actual
   */
  private configurarPermisos(): void {
    this.puedeEditar = this.permisosService.puedeEditarAnimatronicos();
    this.puedeCrear = this.permisosService.puedeCrearAnimatronicos();
    this.puedeEliminar = this.permisosService.puedeEliminarAnimatronicos();
    
    // Si no puede editar ni crear ni eliminar, está en modo solo lectura
    this.soloLectura = !this.puedeEditar && !this.puedeCrear && !this.puedeEliminar;
    
    console.log('Permisos configurados:', {
      puedeEditar: this.puedeEditar,
      puedeCrear: this.puedeCrear,
      puedeEliminar: this.puedeEliminar,
      soloLectura: this.soloLectura,
      rol: this.permisosService.obtenerNombreRol()
    });
  }

  cargarTiposAnimatronicos(): void {
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
    // NUEVO: Verificar permisos antes de abrir formulario
    if (!this.puedeCrear) {
      alert('No tienes permisos para crear nuevos animatrónicos.');
      return;
    }
    
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

    // Crear FormData para enviar archivos
    const formData = new FormData();
    formData.append('nombre', this.nuevoAnimatronico.nombre);
    formData.append('reconocimiento', this.nuevoAnimatronico.reconocimiento.toString());
    formData.append('num_piezas', this.nuevoAnimatronico.num_piezas.toString());
    
    // Agregar archivos si fueron seleccionados
    if (this.fotoNuevoFile) {
      formData.append('foto', this.fotoNuevoFile);
    }
    if (this.planosNuevoFile) {
      formData.append('planos', this.planosNuevoFile);
    }

    this.animatronicosService.crearConArchivos(formData).subscribe({
      next: (response) => {
        console.log('Animatrónico creado:', response);
        this.cargarAnimatronicos();
        this.cerrarFormularioNuevo();
        // Limpiar archivos
        this.fotoNuevoFile = null;
        this.planosNuevoFile = null;
      },
      error: (error) => {
        console.error('Error al crear animatrónico:', error);
        alert('Error al guardar el animatrónico. Verifica la conexión con el servidor.');
      }
    });
  }

  abrirFormularioEditar(animatronico: Animatronico): void {
    // NUEVO: Verificar permisos antes de abrir formulario
    if (!this.puedeEditar) {
      alert('No tienes permisos para editar animatrónicos.');
      return;
    }
    
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

    // Crear FormData para enviar archivos
    const formData = new FormData();
    formData.append('nombre', this.animatronicoEditando.nombre);
    formData.append('reconocimiento', this.animatronicoEditando.reconocimiento.toString());
    formData.append('num_piezas', this.animatronicoEditando.num_piezas.toString());
    
    // Solo agregar archivos si fueron seleccionados nuevos
    if (this.fotoEditFile) {
      formData.append('foto', this.fotoEditFile);
    } else if (this.animatronicoEditando.foto) {
      formData.append('foto', this.animatronicoEditando.foto);
    }
    
    if (this.planosEditFile) {
      formData.append('planos', this.planosEditFile);
    } else if (this.animatronicoEditando.planos) {
      formData.append('planos', this.animatronicoEditando.planos);
    }

    this.animatronicosService.actualizarConArchivos(this.animatronicoEditando.id!, formData).subscribe({
      next: (response) => {
        console.log('Animatrónico actualizado:', response);
        this.cargarAnimatronicos();
        this.cerrarFormularioEditar();
        // Limpiar archivos
        this.fotoEditFile = null;
        this.planosEditFile = null;
      },
      error: (error) => {
        console.error('Error al actualizar animatrónico:', error);
        alert('Error al actualizar el animatrónico. Verifica la conexión con el servidor.');
      }
    });
  }

  eliminarAnimatronico(): void {
    if (!this.animatronicoEditando) return;
    
    // NUEVO: Verificar permisos antes de eliminar
    if (!this.puedeEliminar) {
      alert('No tienes permisos para eliminar animatrónicos.');
      return;
    }
    
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

  obtenerRutaFoto(nombreFoto: string): string {
  if (!nombreFoto) return 'http://localhost:3000/FNaF_Profile/freddy_clasico.jpg';
  return `http://localhost:3000/FNaF_Profile/${nombreFoto}`;
}

obtenerRutaPlanos(nombrePlanos: string): string {
  if (!nombrePlanos) return 'http://localhost:3000/FNAF_Blueprints/freddy_clasico_planos.png';
  return `http://localhost:3000/FNAF_Blueprints/${nombrePlanos}`;
}

onImageError(event: Event): void {
  const target = event.target as HTMLImageElement;
  if (target.src.includes('FNaF_Profile')) {
    target.src = 'http://localhost:3000/FNaF_Profile/freddy_clasico.jpg';
  } else {
    target.src = 'http://localhost:3000/FNAF_Blueprints/freddy_clasico_planos.png';
  }
}


  onFileSelected(event: any, tipo: 'foto' | 'planos', esNuevo: boolean = true): void {
    const file = event.target.files[0];
    if (file) {
      if (esNuevo) {
        if (tipo === 'foto') {
          this.nuevoAnimatronico.foto = file.name;
          this.fotoNuevoFile = file;
        } else {
          this.nuevoAnimatronico.planos = file.name;
          this.planosNuevoFile = file;
        }
      } else if (this.animatronicoEditando) {
        if (tipo === 'foto') {
          this.animatronicoEditando.foto = file.name;
          this.fotoEditFile = file;
        } else {
          this.animatronicoEditando.planos = file.name;
          this.planosEditFile = file;
        }
      }
    }
  }

  cerrarVentana(): void {
    this.windowService.closeWindow('animatronicos');
    this.router.navigate(['/home2']);
  }

  minimizarVentana(): void {
    this.windowService.minimizeWindow('animatronicos');
    this.router.navigate(['/home2']);
  }

  toggleMaximizar(): void {
    this.windowService.toggleMaximize('animatronicos');
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