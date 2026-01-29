/**
 * COMPONENTE: PerfilComponent
 * 
 * Página de perfil de usuario autenticado
 * Permite visualizar y editar información personal
 * Gestiona cambios de correo y contraseña
 */

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  usuario = signal<Usuario | null>(null);
  editando = signal(false);
  cargando = signal(false);
  exito = signal(false);
  error = signal('');

  formulario = signal({
    correo: '',
    password: '',
    confirmPassword: ''
  });

  constructor(
    private readonly authService: AuthService,
    private readonly usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    const usuarioData = this.authService.obtenerUsuario();
    this.usuario.set(usuarioData);
    if (usuarioData) {
      this.formulario.update(f => ({ ...f, correo: usuarioData.correo }));
    }
  }

  toggleEditar(): void {
    this.editando.update(e => !e);
    this.error.set('');
    this.exito.set(false);
  }

  guardarCambios(): void {
    const form = this.formulario();
    if (!form.correo) {
      this.error.set('El correo es obligatorio');
      return;
    }

    if (form.password && form.password !== form.confirmPassword) {
      this.error.set('Las contraseñas no coinciden');
      return;
    }

    this.cargando.set(true);
    this.error.set('');

    // Simular actualización (en producción se haría con un service)
    setTimeout(() => {
      const usuarioActual = this.usuario();
      if (usuarioActual) {
        this.usuario.set({ ...usuarioActual, correo: form.correo });
      }
      this.exito.set(true);
      this.editando.set(false);
      this.cargando.set(false);
      setTimeout(() => this.exito.set(false), 3000);
    }, 1000);
  }

  cancelar(): void {
    this.editando.set(false);
    const usuarioActual = this.usuario();
    if (usuarioActual) {
      this.formulario.set({
        correo: usuarioActual.correo,
        password: '',
        confirmPassword: ''
      });
    }
    this.error.set('');
  }

  updatecorreo(value: string): void {
    this.formulario.update(f => ({ ...f, correo: value }));
  }

  updatePassword(value: string): void {
    this.formulario.update(f => ({ ...f, password: value }));
  }

  updateConfirmPassword(value: string): void {
    this.formulario.update(f => ({ ...f, confirmPassword: value }));
  }
}
