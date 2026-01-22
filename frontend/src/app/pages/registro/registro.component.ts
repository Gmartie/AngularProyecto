/**
 * COMPONENTE: RegistroComponent
 * 
 * Formulario para crear nuevas cuentas de usuario
 * Valida email, contraseña y asigna rol "Usuario Registrado"
 */

import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent {
  usuario = signal('');
  email = signal('');
  password = signal('');
  confirmPassword = signal('');
  cargando = signal(false);
  error = signal('');
  exito = signal(false);

  constructor(private readonly authService: AuthService, private readonly router: Router) {}

  registrarse(): void {
    if (!this.usuario() || !this.email() || !this.password() || !this.confirmPassword()) {
      this.error.set('Por favor completa todos los campos');
      return;
    }

    if (this.password() !== this.confirmPassword()) {
      this.error.set('Las contraseñas no coinciden');
      return;
    }

    if (this.password().length < 6) {
      this.error.set('La contraseña debe tener mínimo 6 caracteres');
      return;
    }

    this.cargando.set(true);
    this.error.set('');

    this.authService.register(this.usuario(), this.email(), this.password()).subscribe({
      next: () => {
        this.exito.set(true);
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al registrar');
        this.cargando.set(false);
      }
    });
  }
}
