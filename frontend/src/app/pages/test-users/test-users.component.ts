/**
 * COMPONENTE: TestUsersComponent
 * 
 * Herramienta para crear usuarios de prueba
 * Facilita testing con diferentes roles
 * Útil en desarrollo y demostraciones
 */

import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-test-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './test-users.component.html',
  styleUrls: ['./test-users.component.css']
})
export class TestUsersComponent {
  cargando = signal(false);
  mensajes = signal<{ tipo: string; texto: string }[]>([]);

  testUsers = [
    {
      nombre: 'Profesor',
      usuario: 'profesor1',
      email: 'profesor1@example.com',
      password: 'profesor123',
      rol: 'Profesor'
    },
    {
      nombre: 'Tutor',
      usuario: 'tutor1',
      email: 'tutor1@example.com',
      password: 'tutor123',
      rol: 'Tutor'
    },
    {
      nombre: 'Alumno',
      usuario: 'alumno1',
      email: 'alumno1@example.com',
      password: 'alumno123',
      rol: 'Alumno'
    }
  ];

  constructor(private readonly http: HttpClient) {}

  crearUsuario(testUser: any): void {
    this.cargando.set(true);
    this.http.post('http://localhost:3000/api/auth/create-test-user', {
      usuario: testUser.usuario,
      email: testUser.email,
      password: testUser.password,
      rol: testUser.rol
    }).subscribe({
      next: (response: any) => {
        this.cargando.set(false);
        this.mensajes.update(msgs => [
          {
            tipo: 'success',
            texto: `✅ Usuario ${testUser.usuario} creado con rol ${testUser.rol}`
          },
          ...msgs
        ]);
      },
      error: (error: any) => {
        this.cargando.set(false);
        this.mensajes.update(msgs => [
          {
            tipo: 'error',
            texto: `❌ Error: ${error.error?.message || error.message}`
          },
          ...msgs
        ]);
      }
    });
  }

  crearTodos(): void {
    this.cargando.set(true);
    this.mensajes.set([]);
    
    let creados = 0;
    let errores = 0;

    this.testUsers.forEach(testUser => {
      this.http.post('http://localhost:3000/api/auth/create-test-user', {
        usuario: testUser.usuario,
        email: testUser.email,
        password: testUser.password,
        rol: testUser.rol
      }).subscribe({
        next: (response: any) => {
          creados++;
          this.mensajes.update(msgs => [
            {
              tipo: 'success',
              texto: `✅ ${testUser.usuario} (${testUser.rol})`
            },
            ...msgs
          ]);
          if (creados + errores === this.testUsers.length) {
            this.cargando.set(false);
          }
        },
        error: (error: any) => {
          errores++;
          this.mensajes.update(msgs => [
            {
              tipo: 'error',
              texto: `❌ ${testUser.usuario}: ${error.error?.message || error.message}`
            },
            ...msgs
          ]);
          if (creados + errores === this.testUsers.length) {
            this.cargando.set(false);
          }
        }
      });
    });
  }

  limpiarMensajes(): void {
    this.mensajes.set([]);
  }
}
