/**
 * SERVICIO: LocalesService
 *
 * Gestiona operaciones CRUD de locales
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Local } from '../models/local.model';

@Injectable({
  providedIn: 'root'
})
export class LocalesService {

  private apiUrl = 'http://localhost:3000/api/locales';

  constructor(private http: HttpClient) {}

  obtenerTodos(): Observable<Local[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => {
        console.log('Respuesta obtenerTodos:', response);
        // El backend devuelve { success: true, data: [...] }
        return response.data || response;
      })
    );
  }

  obtenerPorId(id: number): Observable<Local> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => {
        console.log('Respuesta obtenerPorId:', response);
        // El backend devuelve { success: true, data: {...} }
        return response.data || response;
      })
    );
  }

  crear(local: Local): Observable<Local> {
    return this.http.post<any>(this.apiUrl, local).pipe(
      map(response => {
        console.log('Respuesta crear:', response);
        return response.data || response;
      })
    );
  }

  actualizar(id: number, local: Local): Observable<Local> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, local).pipe(
      map(response => {
        console.log('Respuesta actualizar:', response);
        return response.data || response;
      })
    );
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => {
        console.log('Respuesta eliminar:', response);
        return response.data || response;
      })
    );
  }
}
