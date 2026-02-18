
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService, UsuarioAutenticado } from '../../services/auth.service';
import { WindowService } from '../../services/window.service';
import { Observable } from 'rxjs';
import { Window } from '../../services/window.service';
import { TaskbarComponent } from '../../components/taskbar/taskbar.component';
interface ProgramaIcono {
    id: string;
    nombre: string;
    icono: string;
    ruta?: string;
    descripcion: string;
    rolesPermitidos?: number[];
    funcional: boolean;
}
@Component({
    selector: 'app-home2',
    standalone: true,
    imports: [CommonModule, RouterModule, TaskbarComponent],
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
    ) { }
    ngOnInit(): void {
        this.ventanasAbiertas$ = this.windowService.windows$;
        this.authService.usuario$.subscribe(usuario => {
            this.usuario = usuario;
            this.filtrarProgramas();
        });
    }
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
    private crearProgramas(): ProgramaIcono[] {
        return [
            {
                id: 'animatronicos',
                nombre: 'Animatrónicos',
                icono: this.getIconoAnimatronicos(),
                ruta: '/animatronicos',
                descripcion: 'Gestión de Animatrónicos',
                rolesPermitidos: [1, 2, 3, 4, 5],
                funcional: true
            },
            {
                id: 'locales',
                nombre: 'Locales',
                icono: this.getIconoLocales(),
                ruta: '/locales',
                descripcion: 'Control de Locales',
                rolesPermitidos: [1, 2, 3, 4, 5],
                funcional: true
            },
            {
                id: 'tipos',
                nombre: 'Tipos',
                icono: '/Icons/springlock_icon.png',
                ruta: '/tipos',
                descripcion: 'Tipos de Animatrónicos',
                rolesPermitidos: [1, 2],
                funcional: true
            },
            {
                id: 'perfil',
                nombre: 'Mi Perfil',
                icono: '/Icons/profile_icon.png',
                ruta: '/perfil',
                descripcion: 'Perfil de Operador',
                rolesPermitidos: [1, 2, 3, 4, 5, 6],
                funcional: true
            },
            {
                id: 'admin',
                nombre: 'Admin',
                icono: '/Icons/computer_icon.png',
                ruta: '/admin',
                descripcion: 'Panel de Administración',
                rolesPermitidos: [6],
                funcional: true
            },
            {
                id: 'animatronico-local',
                nombre: 'Asignaciones',
                icono: '/Icons/delivery_box.png',
                ruta: '/animatronico-local',
                descripcion: 'Gestión de Asignaciones',
                rolesPermitidos: [6],
                funcional: true
            },
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
        const idRol = this.usuario.id_rol;
        this.programasFiltrados = programas.filter(programa => {
            if (!programa.funcional) {
                return true;
            }
            if (!programa.rolesPermitidos || programa.rolesPermitidos.length === 0) {
                return true;
            }
            return programa.rolesPermitidos.includes(idRol);
        });
    }
    tieneRol(idRol: number): boolean {
        return this.usuario?.id_rol === idRol;
    }
    obtenerPermisos() {
        const idRol = this.usuario?.id_rol;
        return {
            animatronicos: {
                ver: [1, 2, 3, 4, 5].includes(idRol || 0),
                crear: [2].includes(idRol || 0),
                editar: [2].includes(idRol || 0),
                eliminar: [2].includes(idRol || 0)
            },
            locales: {
                ver: [1, 2, 3, 4, 5].includes(idRol || 0),
                crear: false,
                editar: [1].includes(idRol || 0),
                eliminar: false
            },
            tipos: {
                ver: [1, 2].includes(idRol || 0),
                crear: [1, 2].includes(idRol || 0),
                editar: [1, 2].includes(idRol || 0),
                eliminar: [1, 2].includes(idRol || 0)
            }
        };
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
            this.router.navigate([programa.ruta]);
        }
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
            1: '/FNAF_Rol_Icons/owner_icon.png',
            2: '/FNAF_Rol_Icons/tech_icon.png',
            3: '/FNAF_Rol_Icons/guard_icon.png',
            4: '/FNAF_Rol_Icons/employee_icon.png',
            5: '/FNAF_Rol_Icons/chef_icon.png',
            6: '/FNAF_Rol_Icons/admin_icon.png'
        };
        const idRol = this.usuario?.id_rol ?? 0;
        return mapaRoles[idRol] || '/FNAF_Rol_Icons/employee_icon.png';
    }
    getHoraActual(): string {
        const ahora = new Date();
        return ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    }
}
