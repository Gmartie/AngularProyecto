

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WindowService } from '../../services/window.service';
import { AuthService, UsuarioAutenticado } from '../../services/auth.service';
import { RolesService } from '../../services/roles.service';
import { Subscription, Observable } from 'rxjs';
import { Window } from '../../services/window.service';
import { TaskbarComponent } from '../../components/taskbar/taskbar.component';

interface RolVista {
  id: number;
  rol: string;
}

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, TaskbarComponent],
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

    // Obtener usuario actual sincrónicamente
    this.usuario = this.authService.obtenerUsuario();

    // Suscribirse para cambios futuros
    this.authService.usuario$.subscribe(usuario => {
      this.usuario = usuario;
    });
    this.cargarRoles();

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
        this.roles = Array.isArray(roles) ? roles : [];
      },
      error: (error) => {
        this.roles = [];
      }
    });
  }

  obtenerIconoRol(nombreRol: string): string {
    const iconos: { [key: string]: string } = {
      'Administrador': '/FNAF_Rol_Icons/admin_icon.png',
      'Propietario':   '/FNAF_Rol_Icons/owner_icon.png',
      'Técnico':       '/FNAF_Rol_Icons/tech_icon.png',
      'Guardia de seguridad': '/FNAF_Rol_Icons/guard_icon.png',
      'Empleado':      '/FNAF_Rol_Icons/employee_icon.png',
      'Cocinero':      '/FNAF_Rol_Icons/chef_icon.png'
    };
    return iconos[nombreRol] || '/FNAF_Rol_Icons/employee_icon.png';
  }

  obtenerIconoRolUsuario(): string {
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