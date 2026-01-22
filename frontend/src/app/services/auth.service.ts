/**
 * SERVICIO: AuthService
 * 
 * Gestiona autenticación de usuarios
 * Maneja login, registro, logout
 * Almacena token y estado de autenticación en localStorage
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthResponse, UsuarioAutenticado } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private usuarioSubject = new BehaviorSubject<UsuarioAutenticado | null>(null);
  public usuario$ = this.usuarioSubject.asObservable();

  constructor(private http: HttpClient) {
    this.cargarUsuario();
  }

  login(usuario: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { usuario, password }).pipe(
      tap(response => {
        console.log('🔍 Respuesta del login recibida:', response);
        
        // El backend devuelve { success, message, data: { token, usuario } }
        const loginData = response.data || response;
        
        console.log('🔍 loginData:', loginData);
        console.log('🔍 loginData.usuario:', loginData.usuario);
        console.log('🔍 loginData.usuario.roles:', loginData.usuario.roles);
        
        const usuarioAuth: UsuarioAutenticado = {
          ...loginData.usuario,
          token: loginData.token
        };
        
        console.log('🔍 Usuario autenticado a guardar:', usuarioAuth);
        console.log('🔍 Roles en usuarioAuth:', usuarioAuth.roles);
        
        localStorage.setItem('usuario', JSON.stringify(usuarioAuth));
        localStorage.setItem('token', loginData.token);
        
        console.log('🔍 Usuario guardado en localStorage:', usuarioAuth);
        
        this.usuarioSubject.next(usuarioAuth);
        
        console.log('🔍 BehaviorSubject emitido con:', usuarioAuth);
        console.log('🔍 BehaviorSubject.value ahora es:', this.usuarioSubject.value);
      })
    );
  }

  register(usuario: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { usuario, email, password });
  }

  logout(): void {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    this.usuarioSubject.next(null);
  }

  obtenerUsuario(): UsuarioAutenticado | null {
    return this.usuarioSubject.value;
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  estaAutenticado(): boolean {
    return this.obtenerToken() !== null;
  }

  tieneRol(rol: string): boolean {
    const usuario = this.obtenerUsuario();
    if (!usuario || !usuario.roles) return false;
    return usuario.roles.some(r => r.nombre === rol);
  }

  tienePermiso(nombrePermiso: string): boolean {
    const usuario = this.obtenerUsuario();
    if (!usuario || !usuario.permisos) return false;
    return usuario.permisos.includes(nombrePermiso);
  }

  // Métodos helper para roles comunes
  esAdmin(): boolean {
    return this.tieneRol('Administrador');
  }

  esTutor(): boolean {
    return this.tieneRol('Tutor');
  }

  esProfesor(): boolean {
    return this.tieneRol('Profesor');
  }

  esAlumno(): boolean {
    return this.tieneRol('Alumno');
  }

  esUsuarioRegistrado(): boolean {
    return this.tieneRol('Usuario Registrado');
  }

  esInvitado(): boolean {
    return this.tieneRol('Invitado');
  }

  private cargarUsuario(): void {
    const usuarioGuardado = localStorage.getItem('usuario');
    console.log('Cargando usuario del localStorage:', usuarioGuardado);
    if (usuarioGuardado) {
      try {
        const usuario = JSON.parse(usuarioGuardado);
        console.log('Usuario cargado correctamente:', usuario);
        this.usuarioSubject.next(usuario);
      } catch (e) {
        console.error('Error al cargar usuario guardado', e);
        localStorage.removeItem('usuario');
      }
    } else {
      console.log('No hay usuario guardado en localStorage');
    }
  }
}
