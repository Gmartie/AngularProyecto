/**
 * SERVICIO: UsuarioService
 * Gestiona usuarios del sistema
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Usuario } from '../models/usuario.model';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private apiUrl = 'http://localhost:3000/api/usuarios';

  constructor(private http: HttpClient) {}

  obtenerTodos(): Observable<Usuario[]> {
    return this.http.get<ApiResponse<Usuario[]>>(this.apiUrl).pipe(
      map(response => response.data || [])
    );
  }

  obtenerPorId(id: number): Observable<Usuario> {
    return this.http.get<ApiResponse<Usuario>>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data)
    );
  }

  crear(usuario: Usuario): Observable<Usuario> {
    return this.http.post<ApiResponse<Usuario>>(this.apiUrl, usuario).pipe(
      map(response => response.data)
    );
  }

  actualizar(id: number, usuario: any): Observable<Usuario> {
    return this.http.put<ApiResponse<Usuario>>(`${this.apiUrl}/${id}`, usuario).pipe(
      map(response => response.data)
    );
  }

  login(usuario: string, pass: string) {
    return this.http.post<any>(`${this.apiUrl}/api/auth/login`, {
      usuario,
      password: pass
    });
  }

  register(usuario: string, email: string, password: string) {
    return this.http.post(`${this.apiUrl}/api/auth/register`, {
      usuario,
      email,
      password
    });
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
