
import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { AuthService, UsuarioAutenticado } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario.service';
import { WindowService, Window } from '../../services/window.service';
@Component({
    selector: 'app-perfil',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './perfil.component.html',
    styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit, OnDestroy {
    usuario = signal<UsuarioAutenticado | null>(null);
    editando = signal(false);
    cargando = signal(false);
    exito = signal(false);
    error = signal('');
    formulario = signal({
        usuario: '',
        correo: '',
        password: '',
        confirmPassword: ''
    }); isMinimized: boolean = false;
    isMaximized: boolean = false;
    private windowSubscription?: Subscription; ventanasAbiertas$!: Observable<Window[]>;
    constructor(
        private readonly authService: AuthService,
        private readonly usuarioService: UsuarioService,
        private readonly windowService: WindowService,
        private readonly router: Router
    ) { }
    ngOnInit(): void {
        this.ventanasAbiertas$ = this.windowService.windows$;
        this.windowSubscription = this.windowService.windows$.subscribe(windows => {
            const perfilWindow = windows.find(w => w.id === 'perfil');
            if (perfilWindow) {
                this.isMinimized = perfilWindow.isMinimized;
                this.isMaximized = perfilWindow.isMaximized;
            }
        });
        const usuarioData = this.authService.obtenerUsuario();
        this.usuario.set(usuarioData);
        if (usuarioData) {
            this.formulario.update(f => ({ ...f, usuario: usuarioData.usuario, correo: usuarioData.correo }));
        }
    }
    ngOnDestroy(): void {
        if (this.windowSubscription) {
            this.windowSubscription.unsubscribe();
        }
    }
    toggleEditar(): void {
        this.editando.update(e => !e);
        this.error.set('');
        this.exito.set(false);
    }
    updateUsuario(valor: string): void {
        this.formulario.update(f => ({ ...f, usuario: valor }));
    }
    updateCorreo(valor: string) {
        this.formulario.update(f => ({ ...f, correo: valor }));
    }
    nombreRol(): string {
        const usuario = this.usuario();
        if (!usuario) return 'Sin rol';
        if (usuario.roles && usuario.roles.length > 0) {
            return usuario.roles[0].nombre;
        }
        switch (usuario.id_rol) {
            case 1: return 'Administrador';
            case 2: return 'Técnico';
            case 3: return 'Guardia de seguridad';
            default: return 'Desconocido';
        }
    }
    guardarCambios(): void {
        const form = this.formulario();
        if (!form.usuario || form.usuario.trim().length < 3) {
            this.error.set('El nombre de usuario debe tener al menos 3 caracteres');
            return;
        }
        if (!form.correo) {
            this.error.set('El correo es obligatorio');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.correo)) {
            this.error.set('El formato del correo no es válido');
            return;
        }
        if (form.password && form.password !== form.confirmPassword) {
            this.error.set('Las contraseñas no coinciden');
            return;
        }
        if (form.password && form.password.length < 6) {
            this.error.set('La contraseña debe tener mínimo 6 caracteres');
            return;
        }
        this.cargando.set(true);
        this.error.set('');
        setTimeout(() => {
            const usuarioActual = this.usuario();
            if (usuarioActual) {
                this.usuario.set({ ...usuarioActual, usuario: form.usuario, correo: form.correo });
            }
            this.exito.set(true);
            this.editando.set(false);
            this.cargando.set(false);
            setTimeout(() => this.exito.set(false), 3000);
        }, 1000);
    }
    cancelar(): void {
        this.editando.set(false);
        const usuarioActual = this.usuario();
        if (usuarioActual) {
            this.formulario.set({
                usuario: usuarioActual.usuario,
                correo: usuarioActual.correo,
                password: '',
                confirmPassword: ''
            });
        }
        this.error.set('');
    }
    updatePassword(value: string): void {
        this.formulario.update(f => ({ ...f, password: value }));
    }
    updateConfirmPassword(value: string): void {
        this.formulario.update(f => ({ ...f, confirmPassword: value }));
    }
    cerrarVentana(): void {
        this.windowService.closeWindow('perfil');
        this.router.navigate(['/home2']);
    }
    minimizarVentana(): void {
        this.windowService.minimizeWindow('perfil');
        this.router.navigate(['/home2']);
    }
    toggleMaximizar(): void {
        this.windowService.toggleMaximize('perfil');
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
    obtenerIconoRol(): string {
        const mapaRoles: { [key: number]: string } = {
            1: '/FNAF_Rol_Icons/owner_icon.png',
            2: '/FNAF_Rol_Icons/tech_icon.png',
            3: '/FNAF_Rol_Icons/guard_icon.png',
            4: '/FNAF_Rol_Icons/employee_icon.png',
            5: '/FNAF_Rol_Icons/chef_icon.png',
            6: '/FNAF_Rol_Icons/admin_icon.png'
        };
        const idRol = this.usuario()?.id_rol ?? 0;
        return mapaRoles[idRol] || '/FNAF_Rol_Icons/employee_icon.png';
    }
}