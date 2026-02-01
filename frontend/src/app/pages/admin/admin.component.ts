// ============================================
// ARCHIVO 1: admin.component.ts
// ============================================
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService, UsuarioAutenticado } from '../../services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  usuario = signal<UsuarioAutenticado | null>(null);

  constructor(private readonly authService: AuthService) {
    this.authService.usuario$.subscribe((usuario: UsuarioAutenticado | null) => {
      this.usuario.set(usuario);
    });
  }

  ngOnInit(): void {
    console.log('Panel Admin cargado');
  }

  esAdmin(): boolean {
    const usuario = this.usuario();
    if (!usuario) return false;
    
    // Intentar con array de roles primero
    if (usuario.roles && usuario.roles.length > 0) {
      return usuario.roles.some(r => r.nombre === 'Administrador');
    }
    
    // Fallback a id_rol
    return usuario.id_rol === 1;
  }

  esTecnico(): boolean {
    const usuario = this.usuario();
    if (!usuario) return false;
    
    if (usuario.roles && usuario.roles.length > 0) {
      return usuario.roles.some(r => r.nombre === 'Técnico');
    }
    
    return usuario.id_rol === 2;
  }

  esGuardia(): boolean {
    const usuario = this.usuario();
    if (!usuario) return false;
    
    if (usuario.roles && usuario.roles.length > 0) {
      return usuario.roles.some(r => r.nombre === 'Guardia de seguridad');
    }
    
    return usuario.id_rol === 3;
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
}

// ============================================
// ARCHIVO 2: usuario.component.ts
// ============================================
/* 
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

interface UsuarioVista {
  id: number;
  usuario: string;
  correo: string;
  id_rol: number;
}

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuario.component.html'
})
export class UsuarioComponent implements OnInit {
  usuario: UsuarioVista | null = null;
  nombreRol: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.usuario$.subscribe(u => {
      if (u) {
        this.usuario = {
          id: u.id,
          usuario: u.usuario,
          correo: u.correo,
          id_rol: u.id_rol
        };

        this.nombreRol = this.obtenerNombreRol(u);
      } else {
        this.usuario = null;
        this.nombreRol = '';
      }
    });
  }

  private obtenerNombreRol(usuario: any): string {
    // Intentar con array de roles primero
    if (usuario.roles && usuario.roles.length > 0) {
      return usuario.roles[0].nombre;
    }
    
    // Fallback a id_rol
    switch (usuario.id_rol) {
      case 1: return 'Administrador';
      case 2: return 'Técnico';
      case 3: return 'Guardia de seguridad';
      default: return 'Desconocido';
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
*/