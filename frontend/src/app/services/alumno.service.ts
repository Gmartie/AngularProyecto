/**
 * SERVICIO: AlumnoService
 * 
 * Gestiona operaciones CRUD de alumnos
 * Comunica con API backend para obtener/actualizar datos
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Alumno, Matricula } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AlumnoService {
  private apiUrl = 'http://localhost:3000/api/alumnos';
  private matriculaUrl = 'http://localhost:3000/api/matriculas';

  constructor(private http: HttpClient) { }

  // ALUMNOS
  obtenerTodos(): Observable<Alumno[]> {
    return this.http.get<Alumno[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<Alumno> {
    return this.http.get<Alumno>(`${this.apiUrl}/${id}`);
  }

  crear(alumno: Partial<Alumno>): Observable<Alumno> {
    return this.http.post<Alumno>(this.apiUrl, alumno);
  }

  /**
   * Crear alumno junto con su usuario para que pueda iniciar sesión
   * Envía nombre, email, móvil y contraseña
   * El backend crea el usuario con rol "Alumno"
   * 
   * @param alumnoConPassword - Datos del alumno incluyendo password
   * @returns Observable con el alumno creado
   */
  crearConUsuario(alumnoConPassword: any): Observable<Alumno> {
    return this.http.post<Alumno>(`${this.apiUrl}/con-usuario`, alumnoConPassword);
  }

  actualizar(id: number, alumno: Partial<Alumno>): Observable<Alumno> {
    return this.http.put<Alumno>(`${this.apiUrl}/${id}`, alumno);
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  obtenerMisMatriculas(): Observable<Matricula[]> {
    return this.http.get<Matricula[]>(`${this.matriculaUrl}/mis-matriculas`);
  }

  // MATRÍCULAS
  obtenerMatriculas(): Observable<Matricula[]> {
    return this.http.get<Matricula[]>(this.matriculaUrl);
  }

  matricularseEnModulo(moduloId: number): Observable<Matricula> {
    return this.http.post<Matricula>(`${this.matriculaUrl}/crear`, { moduloId });
  }

  cancelarMatricula(matriculaId: number): Observable<any> {
    return this.http.delete(`${this.matriculaUrl}/${matriculaId}`);
  }

  cambiarEstadoMatricula(matriculaId: number, estado: 'Activa' | 'Finalizada' | 'Cancelada'): Observable<Matricula> {
    return this.http.patch<Matricula>(`${this.matriculaUrl}/${matriculaId}`, { estado });
  }
}
