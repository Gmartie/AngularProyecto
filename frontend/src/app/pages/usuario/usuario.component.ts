/**
 * COMPONENTE: UsuarioComponent
 * Gestión de todos los usuarios del sistema (solo para administradores)
 */

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
import { Window } from '../../services/window.service';

// Interface extendida para la vista (incluye id_local y rol_nombre, excluye pass)
interface UsuarioVista {
  id: number;
  usuario: string;
  correo: string;
  id_rol: number;
  id_local: number;
  rol_nombre?: string;
  pass?: string; // Opcional para actualización
}

interface Rol {
  id: number;
  rol: string;
}

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css']
})
export class UsuarioComponent implements OnInit, OnDestroy {
  
  usuarios: UsuarioVista[] = [];
  roles: Rol[] = [];
  usuarioEditando: UsuarioVista | null = null;
  mostrarFormularioEditar: boolean = false;
  
  // Control de ventana
  isMinimized: boolean = false;
  isMaximized: boolean = false;
  private windowSubscription?: Subscription;
  
  // Usuario y ventanas
  usuarioActual: UsuarioAutenticado | null = null;
  ventanasAbiertas$!: Observable<Window[]>;

  constructor(
    private windowService: WindowService,
    private router: Router,
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private rolesService: RolesService
  ) {}

  ngOnInit(): void {
    this.ventanasAbiertas$ = this.windowService.windows$;
    
    this.authService.usuario$.subscribe(usuario => {
      this.usuarioActual = usuario;
      if (usuario) {
        this.cargarDatos();
      }
    });
    
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
        // Convertir Usuario[] a UsuarioVista[] (añadiendo id_local si no existe)
        this.usuarios = usuarios.map(u => ({
          id: u.id,
          usuario: u.usuario,
          correo: u.correo,
          id_rol: u.id_rol,
          id_local: (u as any).id_local || 0, // El backend debe devolver esto
          rol_nombre: undefined
        }));
        console.log('✅ Usuarios cargados:', this.usuarios);
      },
      error: (error) => {
        console.error('❌ Error al cargar usuarios:', error);
        this.usuarios = [];
      }
    });
  }

  cargarRoles(): void {
    this.rolesService.obtenerTodos().subscribe({
      next: (roles) => {
        this.roles = roles;
        console.log('✅ Roles cargados:', roles);
      },
      error: (error) => {
        console.error('❌ Error al cargar roles:', error);
        this.roles = [];
      }
    });
  }

  obtenerNombreRol(id_rol: number): string {
    const rol = this.roles.find(r => r.id === id_rol);
    return rol ? rol.rol : 'Desconocido';
  }

  abrirFormularioEditar(usuario: UsuarioVista): void {
    this.usuarioEditando = {...usuario};
    this.mostrarFormularioEditar = true;
  }

  cerrarFormularioEditar(): void {
    this.mostrarFormularioEditar = false;
    this.usuarioEditando = null;
  }

  actualizarUsuario(): void {
    if (!this.usuarioEditando) return;

    // Convertir UsuarioVista a Usuario para enviar a la API
    const usuarioParaActualizar: Partial<Usuario> = {
      usuario: this.usuarioEditando.usuario,
      correo: this.usuarioEditando.correo,
      id_rol: this.usuarioEditando.id_rol,
      // No incluimos pass a menos que se haya especificado
    };

    // Añadir id_local si el backend lo acepta (como campo extra)
    const usuarioConLocal = {
      ...usuarioParaActualizar,
      id_local: this.usuarioEditando.id_local
    };

    this.usuarioService.actualizar(this.usuarioEditando.id, usuarioConLocal as any).subscribe({
      next: (response) => {
        console.log('✅ Usuario actualizado:', response);
        this.cargarUsuarios();
        this.cerrarFormularioEditar();
        alert('Usuario actualizado exitosamente');
      },
      error: (error) => {
        console.error('❌ Error al actualizar usuario:', error);
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
        console.log('✅ Usuario eliminado');
        this.cargarUsuarios();
        this.cerrarFormularioEditar();
        alert('Usuario eliminado exitosamente');
      },
      error: (error) => {
        console.error('❌ Error al eliminar usuario:', error);
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

  getHoraActual(): string {
    const ahora = new Date();
    return ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }
}
