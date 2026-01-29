/**
 * COMPONENTE: NavbarComponent
 * 
 * Barra de navegación de la aplicación
 * Muestra menú dinámico según roles del usuario
 * Gestiona login/logout y navegación general
 */

import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UsuarioAutenticado } from '../../services/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  usuario: UsuarioAutenticado | null = null;
  menuAbierto = false;
  submenuAbierto = false;
  asignarRolCargando = false;
  
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.authService.usuario$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(usuario => {
      this.usuario = usuario;
    });
  }

 tieneRol(nombreRol: string): boolean {
  const rol = Number(this.usuario?.id_rol);

  const mapa: any = {
    1: 'Administrador',
    2: 'Técnico',
    3: 'Guardia de seguridad'
  };

  return mapa[rol] === nombreRol;
}

obtenerRolTexto(): string {
  if (!this.usuario) return '';

  switch (this.usuario.id_rol) {
    case 1: return 'Administrador';
    case 2: return 'Técnico';
    case 3: return 'Guardia de seguridad';
    default: return 'Desconocido';
  }
}


  async asignarRolAdmin(): Promise<void> {
    if (!this.usuario) return;
    
    this.asignarRolCargando = true;
    try {
      const response = await fetch('http://localhost:3000/api/auth/assign-admin-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuario: this.usuario.usuario })
      });

      if (response.ok) {
        alert('Rol Administrador asignado. Por favor, recarga la página.');
        // Recarga la página para obtener los nuevos roles
        window.location.reload();
      } else {
        const error = await response.json();
        alert('Error: ' + error.message);
      }
    } catch (error) {
      alert('Error al asignar rol');
    } finally {
      this.asignarRolCargando = false;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['']);
    this.menuAbierto = false;
    this.submenuAbierto = false;
  }

  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
    console.log('Menú toggled. Ahora está:', this.menuAbierto ? 'ABIERTO' : 'CERRADO');
  }

  toggleSubmenu(): void {
    this.submenuAbierto = !this.submenuAbierto;
    console.log('Submenu toggled. Ahora está:', this.submenuAbierto ? 'ABIERTO' : 'CERRADO');
  }
}
