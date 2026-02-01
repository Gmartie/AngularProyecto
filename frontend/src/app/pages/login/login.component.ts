/**
 * COMPONENTE: LoginComponent
 * 
 * Formulario de inicio de sesión
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  usuario = '';
  pass = '';
  error = '';
  cargando = false;

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    if (!this.usuario || !this.pass) {
      this.error = 'Por favor completa todos los campos';
      return;
    }

    this.cargando = true;
    this.error = '';

    this.auth.login(this.usuario, this.pass).subscribe({
      next: (res: any) => {
        console.log('Login exitoso:', res);
        this.cargando = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Error en login:', err);
        this.error = err.error?.message || 'Credenciales incorrectas';
        this.cargando = false;
      }
    });
  }

  irRegistro() {
    this.router.navigate(['/registro']);
  }
}