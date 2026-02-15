/**
 * COMPONENTE: RolesComponent
 * Gestión de roles del sistema — CRUD completo estilo Windows 95
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WindowService } from '../../services/window.service';
import { AuthService, UsuarioAutenticado } from '../../services/auth.service';
import { RolesService } from '../../services/roles.service';
import { Subscription, Observable } from 'rxjs';
import { Window } from '../../services/window.service';

interface RolVista {
  id: number;
  rol: string;
}

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css']
})
export class RolesComponent implements OnInit, OnDestroy {

  roles: RolVista[] = [];
  rolEditando: RolVista | null = null;
  mostrarFormularioNuevo: boolean = false;
  mostrarFormularioEditar: boolean = false;

  nuevoRol: Partial<RolVista> = { rol: '' };

  isMinimized: boolean = false;
  isMaximized: boolean = false;
  private windowSubscription?: Subscription;

  usuario: UsuarioAutenticado | null = null;
  ventanasAbiertas$!: Observable<Window[]>;

  constructor(
    private windowService: WindowService,
    private router: Router,
    private authService: AuthService,
    private rolesService: RolesService
  ) {}

  ngOnInit(): void {
    this.ventanasAbiertas$ = this.windowService.windows$;

    this.authService.usuario$.subscribe(usuario => {
      this.usuario = usuario;
      if (usuario) {
        this.cargarRoles();
      }
    });

    this.windowSubscription = this.windowService.windows$.subscribe(windows => {
      const thisWindow = windows.find(w => w.id === 'roles');
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

  cargarRoles(): void {
    this.rolesService.obtenerTodos().subscribe({
      next: (roles: any) => {
        const data = roles?.data || roles;
        this.roles = Array.isArray(data) ? data : [];
      },
      error: (error) => {
        console.error('Error al cargar roles:', error);
        this.roles = [];
      }
    });
  }

  obtenerIconoRol(nombreRol: string): string {
    const iconos: { [key: string]: string } = {
      'Propietario': '👑',
      'Técnico': '🔧',
      'Guardia de seguridad': '🛡️',
      'Empleado': '👤',
      'Cocinero': '👨‍🍳',
      'Administrador': '⚙️'
    };
    return iconos[nombreRol] || '🏷️';
  }

  // ── NUEVO ──────────────────────────────────────

  abrirFormularioNuevo(): void {
    this.nuevoRol = { rol: '' };
    this.mostrarFormularioNuevo = true;
  }

  cerrarFormularioNuevo(): void {
    this.mostrarFormularioNuevo = false;
    this.nuevoRol = { rol: '' };
  }

  guardarNuevo(): void {
    if (!this.nuevoRol.rol?.trim()) {
      alert('El nombre del rol no puede estar vacío');
      return;
    }
    this.rolesService.crear({ rol: this.nuevoRol.rol.trim() } as any).subscribe({
      next: () => {
        this.cargarRoles();
        this.cerrarFormularioNuevo();
        alert('Rol creado exitosamente');
      },
      error: (error) => alert(error.error?.message || 'Error al crear el rol')
    });
  }

  // ── EDITAR ─────────────────────────────────────

  abrirFormularioEditar(rol: RolVista): void {
    this.rolEditando = { ...rol };
    this.mostrarFormularioEditar = true;
  }

  cerrarFormularioEditar(): void {
    this.mostrarFormularioEditar = false;
    this.rolEditando = null;
  }

  actualizarRol(): void {
    if (!this.rolEditando) return;
    if (!this.rolEditando.rol?.trim()) {
      alert('El nombre del rol no puede estar vacío');
      return;
    }
    this.rolesService.actualizar(this.rolEditando.id, { rol: this.rolEditando.rol.trim() } as any).subscribe({
      next: () => {
        this.cargarRoles();
        this.cerrarFormularioEditar();
        alert('Rol actualizado exitosamente');
      },
      error: (error) => alert(error.error?.message || 'Error al actualizar el rol')
    });
  }

  eliminarRol(): void {
    if (!this.rolEditando) return;
    if (!confirm('¿Estás seguro de eliminar el rol "' + this.rolEditando.rol + '"?\n\nEsta acción podría afectar a los usuarios con este rol asignado.')) {
      return;
    }
    this.rolesService.eliminar(this.rolEditando.id).subscribe({
      next: () => {
        this.cargarRoles();
        this.cerrarFormularioEditar();
        alert('Rol eliminado exitosamente');
      },
      error: (error) => alert(error.error?.message || 'Error al eliminar el rol. Puede que tenga usuarios asignados.')
    });
  }

  // ── VENTANA ────────────────────────────────────

  cerrarVentana(): void {
    this.windowService.closeWindow('roles');
    this.router.navigate(['/admin']);
  }

  minimizarVentana(): void {
    this.windowService.minimizeWindow('roles');
    this.router.navigate(['/home2']);
  }

  toggleMaximizar(): void {
    this.windowService.toggleMaximize('roles');
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
    return new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }
}
