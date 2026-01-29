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

  /**
   * Signal con el usuario autenticado actual.
   * Puede ser null si no hay sesión iniciada.
   */
  usuario = signal<UsuarioAutenticado | null>(null);

  constructor(private readonly authService: AuthService) {
    // Convertimos el Observable del servicio a Signal
    this.authService.usuario$.subscribe((usuario: UsuarioAutenticado | null) => {
      this.usuario.set(usuario);
    });
  }

  ngOnInit(): void {
    console.log('Panel Admin cargado');
  }

  /**
   * Helpers opcionales para usar en la plantilla
   */
  esAdmin(): boolean {
    return this.usuario()?.id_rol === 1;
  }

  esTecnico(): boolean {
    return this.usuario()?.id_rol === 2;
  }

  esGuardia(): boolean {
    return this.usuario()?.id_rol === 3;
  }

  nombreRol(): string {
    const rol = this.usuario()?.id_rol;
    switch (rol) {
      case 1: return 'Administrador';
      case 2: return 'Técnico';
      case 3: return 'Guardia de seguridad';
      default: return 'Desconocido';
    }
  }
}
