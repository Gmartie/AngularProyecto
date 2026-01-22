/**
 * SERVICIO: MatriculaService
 * 
 * Gestiona operaciones de matrículas
 * Vincula alumnos con módulos
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MatriculaService {
  private apiUrl = 'http://localhost:3000/api/matriculas';

  constructor(private http: HttpClient) { }

  obtenerTodas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/`);
  }

  obtenerPorAlumno(alumnoId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/alumno/${alumnoId}`);
  }

  /**
   * Obtiene matrículas del usuario autenticado
   * Si el usuario es alumno, obtiene sus matrículas activas
   * Si el usuario no es alumno, devuelve array vacío
   */
  obtenerMisMatriculas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/mi-cuenta/matriculas`);
  }

  crear(alumnoId: number, moduloId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/`, {
      alumno_id: alumnoId,
      modulo_id: moduloId
    });
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  crearPrueba(): Observable<any> {
    return this.http.post(`${this.apiUrl}/crear-prueba`, {});
  }
}
