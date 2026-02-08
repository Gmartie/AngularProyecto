import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface UsuarioAutenticado {
  id: number;
  usuario: string;
  correo: string;  // Campo de la BD original
  id_rol: number;  // Campo de la BD original
  id_local?: number;  // CORRECCIÓN: Campo para el local del usuario
  token: string;
  roles?: { id: number; nombre: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly API_URL = 'http://localhost:3000';
  private readonly STORAGE_KEY = 'usuario';

  private usuarioSubject = new BehaviorSubject<UsuarioAutenticado | null>(null);
  public usuario$ = this.usuarioSubject.asObservable();

  constructor(private http: HttpClient) {
    const guardado = localStorage.getItem(this.STORAGE_KEY);
    if (guardado) {
      this.usuarioSubject.next(JSON.parse(guardado));
    }
  }

  login(usuario: string, pass: string) {
    return this.http.post<any>(`${this.API_URL}/api/auth/login`, { 
      usuario, 
      password: pass  // El backend espera 'password' pero validará contra 'pass' en la BD
    }).pipe(
      tap((resp: any) => {
        console.log('Respuesta completa del login:', resp);
        
        // La respuesta viene en formato: { success: true, data: { token, usuario: {...} }, message: "..." }
        const userData = resp.data || resp;
        
        const user: UsuarioAutenticado = {
          id: userData.usuario?.id,
          usuario: userData.usuario?.usuario,
          correo: userData.usuario?.correo,
          id_rol: userData.usuario?.id_rol,
          id_local: userData.usuario?.id_local,  // CORRECCIÓN: Incluir id_local
          token: userData.token,
          roles: userData.usuario?.roles || []
        };
        
        console.log('Usuario procesado:', user);
        
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
        this.usuarioSubject.next(user);
      })
    );
  }

  register(usuario: string, email: string, password: string) {
    return this.http.post(`${this.API_URL}/api/auth/register`, {
      usuario,
      email,     // El backend lo convertirá a 'correo' para la BD
      password   // El backend lo guardará como 'pass' en la BD
    });
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.usuarioSubject.next(null);
  }

  obtenerUsuario(): UsuarioAutenticado | null {
    return this.usuarioSubject.value;
  }

  obtenerToken(): string | null {
    return this.usuarioSubject.value?.token || null;
  }

  estaAutenticado(): boolean {
    return !!this.usuarioSubject.value;
  }

  private user: any = null;
  
  setUser(u: any): void {
    this.user = u;
  }

  getUser(): any {
    return this.user;
  }

}