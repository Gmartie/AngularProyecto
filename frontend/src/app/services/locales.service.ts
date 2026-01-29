/**
 * SERVICIO: LocalesService
 *
 * Gestiona operaciones CRUD de locales
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Local } from '../models/local.model';

@Injectable({
  providedIn: 'root'
})
export class LocalesService {

  private apiUrl = 'http://localhost:3000/api/locales';

  constructor(private http: HttpClient) {}

  obtenerTodos(): Observable<Local[]> {
    return this.http.get<Local[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<Local> {
    return this.http.get<Local>(`${this.apiUrl}/${id}`);
  }

  crear(local: Local): Observable<Local> {
    return this.http.post<Local>(this.apiUrl, local);
  }

  actualizar(id: number, local: Local): Observable<Local> {
    return this.http.put<Local>(`${this.apiUrl}/${id}`, local);
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
