/**
 * COMPONENTE: PerfilComponent
 * Página de perfil de usuario autenticado
 */

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, UsuarioAutenticado } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  usuario = signal<UsuarioAutenticado | null>(null);
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

  updateCorreo(valor: string) {
    this.formulario.update(f => ({ ...f, correo: valor }));
  }

  nombreRol(): string {
    const usuario = this.usuario();
    if (!usuario) return 'Sin rol';

    // Si tiene array de roles, usarlo
    if (usuario.roles && usuario.roles.length > 0) {
      return usuario.roles[0].nombre;
    }

    // Sino, usar id_rol
    switch (usuario.id_rol) {
      case 1: return 'Administrador';
      case 2: return 'Técnico';
      case 3: return 'Guardia de seguridad';
      default: return 'Desconocido';
    }
  }

  guardarCambios(): void {
    const form = this.formulario();
    if (!form.correo) {
      this.error.set('El correo es obligatorio');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.correo)) {
      this.error.set('El formato del correo no es válido');
      return;
    }

    if (form.password && form.password !== form.confirmPassword) {
      this.error.set('Las contraseñas no coinciden');
      return;
    }

    if (form.password && form.password.length < 6) {
      this.error.set('La contraseña debe tener mínimo 6 caracteres');
      return;
    }

    this.cargando.set(true);
    this.error.set('');

    // Simular actualización
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

  updatePassword(value: string): void {
    this.formulario.update(f => ({ ...f, password: value }));
  }

  updateConfirmPassword(value: string): void {
    this.formulario.update(f => ({ ...f, confirmPassword: value }));
  }
}