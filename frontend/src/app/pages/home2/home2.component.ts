/**
 * COMPONENTE: Home2Component
 * 
 * Dashboard principal estilo Windows 95/98
 * Pantalla de inicio después del login con iconos de programas
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, UsuarioAutenticado } from '../../services/auth.service';

interface ProgramaIcono {
  id: string;
  nombre: string;
  icono: string;
  ruta: string;
  descripcion: string;
  rolesPermitidos?: string[];
}

@Component({
  selector: 'app-home2',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home2.component.html',
  styleUrls: ['./home2.component.css']
})
export class Home2Component implements OnInit {
  usuario: UsuarioAutenticado | null = null;
  
  // Programas disponibles estilo Windows 95
  programas: ProgramaIcono[] = [
    {
      id: 'animatronicos',
      nombre: 'Animatrónicos',
      icono: '🤖',
      ruta: '/animatronicos',
      descripcion: 'Gestión de Animatrónicos'
    },
    {
      id: 'locales',
      nombre: 'Locales',
      icono: '🏢',
      ruta: '/locales',
      descripcion: 'Control de Locales'
    },
    {
      id: 'tipos',
      nombre: 'Tipos',
      icono: '📋',
      ruta: '/tipos',
      descripcion: 'Tipos de Animatrónicos'
    },
    {
      id: 'perfil',
      nombre: 'Mi Perfil',
      icono: '👤',
      ruta: '/perfil',
      descripcion: 'Perfil de Operador'
    },
    {
      id: 'admin',
      nombre: 'Control Central',
      icono: '⚙️',
      ruta: '/admin',
      descripcion: 'Sistema Maestro',
      rolesPermitidos: ['Administrador']
    }
  ];

  programasFiltrados: ProgramaIcono[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.usuario$.subscribe(usuario => {
      this.usuario = usuario;
      this.filtrarProgramas();
    });
  }

  filtrarProgramas(): void {
    if (!this.usuario) {
      this.programasFiltrados = [];
      return;
    }

    this.programasFiltrados = this.programas.filter(programa => {
      // Si el programa no tiene roles específicos, está disponible para todos
      if (!programa.rolesPermitidos || programa.rolesPermitidos.length === 0) {
        return true;
      }

      // Verificar si el usuario tiene alguno de los roles permitidos
      return programa.rolesPermitidos.some(rolRequerido => 
        this.tieneRol(rolRequerido)
      );
    });
  }

  tieneRol(nombreRol: string): boolean {
    if (!this.usuario?.roles) return false;
    return this.usuario.roles.some(rol => rol.nombre === nombreRol);
  }

  abrirPrograma(programa: ProgramaIcono): void {
    this.router.navigate([programa.ruta]);
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}
