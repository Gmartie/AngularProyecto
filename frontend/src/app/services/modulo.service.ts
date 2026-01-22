/**
 * SERVICIO: ModuloService
 * 
 * Gestiona operaciones CRUD de módulos
 * Comunica con API backend
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Modulo } from '../models/modulo.model';

@Injectable({
  providedIn: 'root'
})
export class ModuloService {
  private apiUrl = 'http://localhost:3000/api/modulos';

  constructor(private http: HttpClient) { }

  obtenerTodos(curso?: string): Observable<Modulo[]> {
    const url = curso ? `${this.apiUrl}?curso=${curso}` : this.apiUrl;
    return this.http.get<Modulo[]>(url);
  }

  obtenerPorId(id: number): Observable<Modulo> {
    return this.http.get<Modulo>(`${this.apiUrl}/${id}`);
  }

  crear(modulo: Modulo): Observable<Modulo> {
    return this.http.post<Modulo>(this.apiUrl, modulo);
  }

  actualizar(id: number, modulo: Modulo): Observable<Modulo> {
    return this.http.put<Modulo>(`${this.apiUrl}/${id}`, modulo);
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
