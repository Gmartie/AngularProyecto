
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WindowService } from '../../services/window.service';
import { AuthService, UsuarioAutenticado } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario.service';
import { RolesService } from '../../services/roles.service';
import { Usuario } from '../../models/usuario.model';
import { Subscription, Observable } from 'rxjs';
import { TaskbarComponent } from '../../components/taskbar/taskbar.component';
import { Window } from '../../services/window.service'; interface UsuarioVista {
    id: number;
    usuario: string;
    correo: string;
    id_rol: number;
    id_local: number;
    rol_nombre?: string;
    pass?: string;
}
interface Rol {
    id: number;
    rol: string;
}
@Component({
    selector: 'app-usuario',
    standalone: true,
    imports: [CommonModule, FormsModule, TaskbarComponent],
    templateUrl: './usuario.component.html',
    styleUrls: ['./usuario.component.css']
})
export class UsuarioComponent implements OnInit, OnDestroy {
    usuarios: UsuarioVista[] = [];
    roles: Rol[] = [];
    usuarioEditando: UsuarioVista | null = null;
    mostrarFormularioEditar: boolean = false; isMinimized: boolean = false;
    isMaximized: boolean = false;
    private windowSubscription?: Subscription; usuarioActual: UsuarioAutenticado | null = null;
    ventanasAbiertas$!: Observable<Window[]>;
    constructor(
        private windowService: WindowService,
        private router: Router,
        private authService: AuthService,
        private usuarioService: UsuarioService,
        private rolesService: RolesService
    ) { }
    ngOnInit(): void {
        this.ventanasAbiertas$ = this.windowService.windows$;
        this.usuarioActual = this.authService.obtenerUsuario();
        this.authService.usuario$.subscribe(usuario => {
            this.usuarioActual = usuario;
        });
        this.cargarDatos();
        this.windowSubscription = this.windowService.windows$.subscribe(windows => {
            const thisWindow = windows.find(w => w.id === 'usuario');
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
        this.cargarUsuarios();
        this.cargarRoles();
    }
    cargarUsuarios(): void {
        this.usuarioService.obtenerTodos().subscribe({
            next: (usuarios: Usuario[]) => {
                this.usuarios = usuarios.map(u => ({
                    id: u.id,
                    usuario: u.usuario,
                    correo: u.correo,
                    id_rol: u.id_rol,
                    id_local: (u as any).id_local || 0, rol_nombre: undefined
                }));
            },
            error: (error) => {
                this.usuarios = [];
            }
        });
    }
    cargarRoles(): void {
        this.rolesService.obtenerTodos().subscribe({
            next: (roles) => {
                this.roles = roles;
            },
            error: (error) => {
                this.roles = [];
            }
        });
    }
    obtenerNombreRol(id_rol: number): string {
        const rol = this.roles.find(r => r.id === id_rol);
        return rol ? rol.rol : 'Desconocido';
    }
    abrirFormularioEditar(usuario: UsuarioVista): void {
        this.usuarioEditando = { ...usuario };
        this.mostrarFormularioEditar = true;
    }
    cerrarFormularioEditar(): void {
        this.mostrarFormularioEditar = false;
        this.usuarioEditando = null;
    }
    actualizarUsuario(): void {
        if (!this.usuarioEditando) return;
        const usuarioParaActualizar: Partial<Usuario> = {
            usuario: this.usuarioEditando.usuario,
            correo: this.usuarioEditando.correo,
            id_rol: this.usuarioEditando.id_rol,
        };
        const usuarioConLocal = {
            ...usuarioParaActualizar,
            id_local: this.usuarioEditando.id_local
        };
        this.usuarioService.actualizar(this.usuarioEditando.id, usuarioConLocal as any).subscribe({
            next: (response) => {
                this.cargarUsuarios();
                this.cerrarFormularioEditar();
                alert('Usuario actualizado exitosamente');
            },
            error: (error) => {
                alert('Error al actualizar el usuario');
            }
        });
    }
    eliminarUsuario(): void {
        if (!this.usuarioEditando) return;
        if (!confirm(`¿Estás seguro de eliminar al usuario "${this.usuarioEditando.usuario}"?`)) {
            return;
        }
        this.usuarioService.eliminar(this.usuarioEditando.id).subscribe({
            next: () => {
                this.cargarUsuarios();
                this.cerrarFormularioEditar();
                alert('Usuario eliminado exitosamente');
            },
            error: (error) => {
                alert('Error al eliminar el usuario');
            }
        });
    }
    cerrarVentana(): void {
        this.windowService.closeWindow('usuario');
        this.router.navigate(['/home2']);
    }
    minimizarVentana(): void {
        this.windowService.minimizeWindow('usuario');
        this.router.navigate(['/home2']);
    }
    toggleMaximizar(): void {
        this.windowService.toggleMaximize('usuario');
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
        const idRol = this.usuarioActual?.id_rol ?? 0;
        return mapaRoles[idRol] || "/FNAF_Rol_Icons/employee_icon.png";
    }
    getHoraActual(): string {
        const ahora = new Date();
        return ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    }
}
