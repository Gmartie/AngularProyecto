import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private user: any = null;

  constructor(private http: HttpClient) {}

  setUser(u: any): void {
    this.user = u;
  }

  getUser(): any {
    return this.user;
  }

  obtenerUsuario(): any {
    return this.user ? { ...this.user } : null;
  }

  login(user: string, pass: string) {
    return this.http.post('http://localhost:3000/login', { user, pass });
  }

  logout(): void {
    this.user = null;
  }

  estaAutenticado(): boolean {
    return !!this.user;
  }
}
