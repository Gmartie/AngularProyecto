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
    // Nos suscribimos al usuario del AuthService
    this.authService.usuario$.subscribe(u => {
      if (u) {
        this.usuario = {
          id: u.id,
          usuario: u.usuario,
          correo: u.correo,
          id_rol: u.id_rol
        };

        this.nombreRol = this.obtenerNombreRol(u.id_rol);
      } else {
        this.usuario = null;
        this.nombreRol = '';
      }
    });
  }

  private obtenerNombreRol(idRol: number): string {
    switch (idRol) {
      case 1: return 'Administrador';
      case 2: return 'Técnico';
      case 3: return 'Empleado';
      default: return 'Desconocido';
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
