import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WindowService } from '../../services/window.service';
import { Subscription } from 'rxjs';

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
  idLocalUsuario: number = 1; // Obtener del servicio de autenticación
  
  // Control de ventana
  isMinimized: boolean = false;
  isMaximized: boolean = false;
  private windowSubscription?: Subscription;
  
  // Rutas de imágenes configurables
  RUTA_FOTOS: string;
  RUTA_PLANOS: string;
  PLACEHOLDER: string;
  
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
    private router: Router
    // private animatronicosService: AnimatronicosService,
    // private authService: AuthService
  ) {
    // Configurar rutas de imágenes
    // En desarrollo con proxy: usa rutas relativas sin barra inicial
    // En producción: el backend sirve todo, así que usa la barra inicial
    const usarProxy = window.location.port === '4200'; // Puerto de Angular dev server
    
    if (usarProxy) {
      this.RUTA_FOTOS = 'public/FNaF_Profile/';
      this.RUTA_PLANOS = 'public/FNaF_Blueprints/';
      this.PLACEHOLDER = 'public/placeholder.png';
    } else {
      this.RUTA_FOTOS = '/public/FNaF_Profile/';
      this.RUTA_PLANOS = '/public/FNaF_Blueprints/';
      this.PLACEHOLDER = '/public/placeholder.png';
    }
  }

  ngOnInit(): void {
    // TODO: Obtener id_local del usuario autenticado
    // this.idLocalUsuario = this.authService.getUsuarioActual().id_local;
    
    // Suscribirse al estado de la ventana
    this.windowSubscription = this.windowService.windows$.subscribe(windows => {
      const thisWindow = windows.find(w => w.id === 'animatronicos');
      if (thisWindow) {
        this.isMinimized = thisWindow.isMinimized;
        this.isMaximized = thisWindow.isMaximized;
      }
    });
    
    this.cargarTiposAnimatronicos();
    this.cargarAnimatronicos();
  }

  ngOnDestroy(): void {
    if (this.windowSubscription) {
      this.windowSubscription.unsubscribe();
    }
  }

  cargarTiposAnimatronicos(): void {
    // TODO: Llamar al servicio real
    // this.animatronicosService.obtenerTiposPorLocal(this.idLocalUsuario).subscribe(
    //   data => this.tiposAnimatronicos = data
    // );

    // Datos de ejemplo
    this.tiposAnimatronicos = [
      { id: 1, nombre: 'Clásicos', id_local: 1 },
      { id: 2, nombre: 'Unwithered', id_local: 2 },
      { id: 3, nombre: 'Toys', id_local: 2 },
      { id: 4, nombre: 'Funtime', id_local: 3 }
    ];
  }

  cargarAnimatronicos(): void {
    // TODO: Llamar al servicio real
    // this.animatronicosService.obtenerPorLocal(this.idLocalUsuario).subscribe(
    //   data => this.animatronicos = data
    // );

    // Datos de ejemplo
    this.animatronicos = [
      {
        id: 1,
        nombre: 'Freddy Fazbear',
        reconocimiento: true,
        num_piezas: 120,
        id_gama: 1,
        nombre_gama: 'Clásicos',
        planos: 'freddy_clasico_planos.png',
        foto: 'freddy_clasico.jpg'
      },
      {
        id: 2,
        nombre: 'Bonnie',
        reconocimiento: true,
        num_piezas: 115,
        id_gama: 1,
        nombre_gama: 'Clásicos',
        planos: 'bonnie_clasico_planos.png',
        foto: 'bonnie_clasico.jpg'
      }
    ];
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
    // Validaciones
    if (!this.nuevoAnimatronico.nombre || this.nuevoAnimatronico.num_piezas <= 0) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    // TODO: Llamar al servicio real
    // this.animatronicosService.crear(this.nuevoAnimatronico).subscribe(
    //   response => {
    //     this.cargarAnimatronicos();
    //     this.cerrarFormularioNuevo();
    //   }
    // );

    // Simulación
    const nuevoId = Math.max(...this.animatronicos.map(a => a.id || 0), 0) + 1;
    this.nuevoAnimatronico.id = nuevoId;
    this.nuevoAnimatronico.nombre_gama = this.tiposAnimatronicos.find(t => t.id === this.nuevoAnimatronico.id_gama)?.nombre;
    this.animatronicos.push({...this.nuevoAnimatronico});
    this.cerrarFormularioNuevo();
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

    // Validaciones
    if (!this.animatronicoEditando.nombre || this.animatronicoEditando.num_piezas <= 0) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    // TODO: Llamar al servicio real
    // this.animatronicosService.actualizar(this.animatronicoEditando).subscribe(
    //   response => {
    //     this.cargarAnimatronicos();
    //     this.cerrarFormularioEditar();
    //   }
    // );

    // Simulación
    const index = this.animatronicos.findIndex(a => a.id === this.animatronicoEditando!.id);
    if (index !== -1) {
      this.animatronicoEditando.nombre_gama = this.tiposAnimatronicos.find(t => t.id === this.animatronicoEditando!.id_gama)?.nombre;
      this.animatronicos[index] = {...this.animatronicoEditando};
    }
    this.cerrarFormularioEditar();
  }

  eliminarAnimatronico(): void {
    if (!this.animatronicoEditando) return;
    
    if (!confirm(`¿Estás seguro de que deseas eliminar a ${this.animatronicoEditando.nombre}?`)) {
      return;
    }

    // TODO: Llamar al servicio real
    // this.animatronicosService.eliminar(this.animatronicoEditando.id).subscribe(
    //   response => {
    //     this.cargarAnimatronicos();
    //     this.cerrarFormularioEditar();
    //   }
    // );

    // Simulación
    this.animatronicos = this.animatronicos.filter(a => a.id !== this.animatronicoEditando!.id);
    this.cerrarFormularioEditar();
  }

  obtenerNombreGama(id_gama: number): string {
    return this.tiposAnimatronicos.find(t => t.id === id_gama)?.nombre || 'Desconocido';
  }

  /**
   * Obtiene la ruta completa de la foto del animatrónico
   */
  obtenerRutaFoto(nombreFoto: string): string {
    if (!nombreFoto) return this.PLACEHOLDER;
    return this.RUTA_FOTOS + nombreFoto;
  }

  /**
   * Obtiene la ruta completa de los planos del animatrónico
   */
  obtenerRutaPlanos(nombrePlanos: string): string {
    if (!nombrePlanos) return this.PLACEHOLDER;
    return this.RUTA_PLANOS + nombrePlanos;
  }

  /**
   * Maneja errores de carga de imágenes
   */
  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = this.PLACEHOLDER;
  }

  /**
   * Maneja la selección de archivos de imagen
   */
  onFileSelected(event: any, tipo: 'foto' | 'planos', esNuevo: boolean = true): void {
    const file = event.target.files[0];
    if (file) {
      const fileName = file.name;
      
      // TODO: Implementar la subida real del archivo al servidor
      // const formData = new FormData();
      // formData.append('file', file);
      // this.animatronicosService.subirImagen(formData, tipo).subscribe(
      //   response => {
      //     // Usar el nombre del archivo devuelto por el servidor
      //   }
      // );
      
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
}
