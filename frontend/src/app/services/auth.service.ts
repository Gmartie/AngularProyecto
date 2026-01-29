import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface UsuarioAutenticado {
  id: number;
  usuario: string;
  correo: string;
  id_rol: number;
  token: string;
  roles?: { nombre: string }[];
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
    return this.http.post<any>(`${this.API_URL}/login`, { usuario, pass }).pipe(
      tap((resp: any) => {
        const user: UsuarioAutenticado = {
          ...resp.usuario,
          token: resp.token
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
        this.usuarioSubject.next(user);
      })
    );
  }

  register(usuario: string, correo: string, pass: string) {
    return this.http.post(`${this.API_URL}/registro`, {
      usuario,
      correo,
      pass
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

