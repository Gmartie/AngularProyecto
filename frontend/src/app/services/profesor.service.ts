/**
 * SERVICIO: ProfesorService
 * 
 * Gestiona operaciones CRUD de profesores
 * Permite filtrar por cargo (Jefe, Tutor, Profesor)
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Profesor } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ProfesorService {
  private apiUrl = 'http://localhost:3000/api/profesores';

  constructor(private http: HttpClient) { }

  obtenerTodos(): Observable<Profesor[]> {
    return this.http.get<Profesor[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<Profesor> {
    return this.http.get<Profesor>(`${this.apiUrl}/${id}`);
  }

  obtenerPorCargo(cargo: 'Jefe de Departamento' | 'Tutor' | 'Profesor'): Observable<Profesor[]> {
    return this.http.get<Profesor[]>(`${this.apiUrl}/cargo/${cargo}`);
  }

  obtenerJefes(): Observable<Profesor[]> {
    return this.obtenerPorCargo('Jefe de Departamento');
  }

  obtenerTutores(): Observable<Profesor[]> {
    return this.obtenerPorCargo('Tutor');
  }

  crear(profesor: Partial<Profesor>): Observable<Profesor> {
    return this.http.post<Profesor>(this.apiUrl, profesor);
  }

  actualizar(id: number, profesor: Partial<Profesor>): Observable<Profesor> {
    return this.http.put<Profesor>(`${this.apiUrl}/${id}`, profesor);
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  obtenerModulos(profesorId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${profesorId}/modulos`);
  }
}
