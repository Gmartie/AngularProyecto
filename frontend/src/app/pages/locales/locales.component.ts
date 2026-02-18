
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WindowService } from '../../services/window.service';
import { AuthService, UsuarioAutenticado } from '../../services/auth.service';
import { LocalesService } from '../../services/locales.service';
import { PermisosService } from '../../services/permisos.service';
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
    localUsuario: Local | null = null;
    todosLosLocales: Local[] = [];
    esAdministrador: boolean = false;
    localEditando: Local | null = null;
    mostrarFormularioNuevo: boolean = false;
    mostrarFormularioEditar: boolean = false;
    puedeEditar: boolean = false;
    soloLectura: boolean = false;
    isMinimized: boolean = false;
    isMaximized: boolean = false;
    private windowSubscription?: Subscription;
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
        private localesService: LocalesService,
        public permisosService: PermisosService
    ) { }
    ngOnInit(): void {
        this.ventanasAbiertas$ = this.windowService.windows$;
        this.authService.usuario$.subscribe(usuario => {
            this.usuario = usuario;
            if (usuario) {
                this.configurarPermisos();
                this.cargarLocalUsuario();
            } else {
            }
        });
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
    private configurarPermisos(): void {
        this.puedeEditar = this.permisosService.puedeEditarLocales();
        this.soloLectura = !this.puedeEditar;
        this.esAdministrador = this.usuario?.id_rol === 6;
        console.log('Permisos de Locales configurados:', {
            puedeEditar: this.puedeEditar,
            soloLectura: this.soloLectura,
            esAdministrador: this.esAdministrador,
            rol: this.permisosService.obtenerNombreRol()
        });
    }
    cargarLocalUsuario(): void {
        if (this.esAdministrador) {
            this.cargarTodosLosLocales();
            return;
        }
        if (!this.usuario || this.usuario.id_local === undefined || this.usuario.id_local === null || this.usuario.id_local === 0) {
            this.localUsuario = null;
            return;
        }
        this.localesService.obtenerPorId(this.usuario.id_local).subscribe({
            next: (local) => {
                this.localUsuario = local;
            },
            error: (error) => {
                this.localUsuario = null;
            }
        });
    }
    cargarTodosLosLocales(): void {
        this.localesService.obtenerTodos().subscribe({
            next: (locales) => {
                this.todosLosLocales = locales;
            },
            error: (error) => {
                this.todosLosLocales = [];
            }
        });
    }
    abrirFormularioNuevo(): void {
        alert('La creación de nuevos locales está deshabilitada.');
    }
    cerrarFormularioNuevo(): void {
        this.mostrarFormularioNuevo = false;
    }
    guardarNuevo(): void {
        alert('No tienes permisos para crear nuevos locales.');
    } abrirFormularioEditar(local: Local): void {
        if (!this.puedeEditar) {
            alert('No tienes permisos para editar el local.\nSolo el Propietario puede modificar la información del local.');
            return;
        }
        this.localEditando = { ...local };
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
                this.cargarLocalUsuario();
                this.cerrarFormularioEditar();
            },
            error: (error) => {
                alert('Error al actualizar el local. Verifica la conexión con el servidor.');
            }
        });
    }
    eliminarLocal(): void {
        alert('La eliminación de locales está deshabilitada por seguridad.');
    }
    getIconoLocal(): string {
        const idLocal = this.usuario?.id_local;
        switch (idLocal) {
            case 1: return '/Icons/w_restaurant_icon.png';
            case 2: return '/Icons/t_restaurant_icon.png';
            case 3: return '/Icons/f_restaurant_icon.png';
            case 4:
            default: return '/Icons/restaurant_icon.png';
        }
    }
    obtenerRutaFoto(nombreFoto: string): string {
        if (!nombreFoto) return '/FNaF_RESTAURANTES/freddy_pizza_1983.jpg';
        return `/FNaF_RESTAURANTES/${nombreFoto}`;
    }
    onImageError(event: Event): void {
        const target = event.target as HTMLImageElement;
        target.src = '/FNaF_RESTAURANTES/freddy_pizza_1983.jpg';
    }
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
    formatearFecha(fecha: Date | string): string {
        if (!fecha) return 'N/A';
        const date = fecha instanceof Date ? fecha : new Date(fecha);
        return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    }
    fechaParaInput(fecha: Date | string): string {
        if (!fecha) return '';
        const date = fecha instanceof Date ? fecha : new Date(fecha);
        return date.toISOString().split('T')[0];
    }
    onFechaChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (this.localEditando && input.value) {
            this.localEditando.fecha_apertura = new Date(input.value);
        }
    }
    onFechaChangeNuevo(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.value) {
            this.nuevoLocal.fecha_apertura = new Date(input.value);
        }
    }
    cerrarVentana(): void {
        this.windowService.closeWindow('locales');
        this.router.navigate(['/home2']);
    }
    minimizarVentana(): void {
        this.windowService.minimizeWindow('locales');
        this.router.navigate(['/home2']);
    }
    toggleMaximizar(): void {
        this.windowService.toggleMaximize('locales');
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
    obtenerIconoRol(): string {
        const mapaRoles: { [key: number]: string } = {
            1: "/FNAF_Rol_Icons/owner_icon.png",
            2: "/FNAF_Rol_Icons/tech_icon.png",
            3: "/FNAF_Rol_Icons/guard_icon.png",
            4: "/FNAF_Rol_Icons/employee_icon.png",
            5: "/FNAF_Rol_Icons/chef_icon.png",
            6: "/FNAF_Rol_Icons/admin_icon.png"
        };
        const idRol = this.usuario?.id_rol ?? 0;
        return mapaRoles[idRol] || "/FNAF_Rol_Icons/employee_icon.png";
    }
    getHoraActual(): string {
        const ahora = new Date();
        return ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    }
}
