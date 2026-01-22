/**
 * COMPONENTE: LoginComponent
 * 
 * Permite a usuarios registrados autenticarse en el sistema
 * Valida credenciales y genera token JWT para sesión
 */

import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  usuario = signal('');
  password = signal('');
  cargando = signal(false);
  error = signal('');

  constructor(private authService: AuthService, private router: Router) {}

  iniciarSesion(): void {
    if (!this.usuario() || !this.password()) {
      this.error.set('Por favor completa todos los campos');
      return;
    }

    this.cargando.set(true);
    this.error.set('');

    this.authService.login(this.usuario(), this.password()).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al iniciar sesión');
        this.cargando.set(false);
      }
    });
  }
}
