/**
 * COMPONENTE: PerfilComponent
 * Página de perfil de usuario autenticado
 */

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
    correo: '',
    password: '',
    confirmPassword: ''
  });

  // Control de ventana
  isMinimized: boolean = false;
  isMaximized: boolean = false;
  private windowSubscription?: Subscription;
  
  // Ventanas abiertas
  ventanasAbiertas$!: Observable<Window[]>;

  constructor(
    private readonly authService: AuthService,
    private readonly usuarioService: UsuarioService,
    private readonly windowService: WindowService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    // Obtener ventanas abiertas para la taskbar
    this.ventanasAbiertas$ = this.windowService.windows$;
    
    // Suscribirse al estado de la ventana
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
      this.formulario.update(f => ({ ...f, correo: usuarioData.correo }));
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

  updateCorreo(valor: string) {
    this.formulario.update(f => ({ ...f, correo: valor }));
  }

  nombreRol(): string {
    const usuario = this.usuario();
    if (!usuario) return 'Sin rol';

    // Si tiene array de roles, usarlo
    if (usuario.roles && usuario.roles.length > 0) {
      return usuario.roles[0].nombre;
    }

    // Sino, usar id_rol
    switch (usuario.id_rol) {
      case 1: return 'Administrador';
      case 2: return 'Técnico';
      case 3: return 'Guardia de seguridad';
      default: return 'Desconocido';
    }
  }

  guardarCambios(): void {
    const form = this.formulario();
    if (!form.correo) {
      this.error.set('El correo es obligatorio');
      return;
    }

    // Validar formato de email
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

    // Simular actualización
    setTimeout(() => {
      const usuarioActual = this.usuario();
      if (usuarioActual) {
        this.usuario.set({ ...usuarioActual, correo: form.correo });
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

  /**
   * Cierra la ventana y vuelve a home2
   */
  cerrarVentana(): void {
    this.windowService.closeWindow('perfil');
    this.router.navigate(['/home2']);
  }

  /**
   * Minimiza la ventana
   */
  minimizarVentana(): void {
    this.windowService.minimizeWindow('perfil');
    this.router.navigate(['/home2']);
  }

  /**
   * Maximiza/restaura la ventana
   */
  toggleMaximizar(): void {
    this.windowService.toggleMaximize('perfil');
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