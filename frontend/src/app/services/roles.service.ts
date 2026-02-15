/**
 * SERVICIO: RolesService
 * Gestiona roles de usuario
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Rol } from '../models/rol.model';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  private apiUrl = 'http://localhost:3000/api/roles';

  constructor(private http: HttpClient) {}

  obtenerTodos(): Observable<Rol[]> {
    return this.http.get<ApiResponse<Rol[]>>(this.apiUrl).pipe(
      map(response => response.data || [])
    );
  }

  obtenerPorId(id: number): Observable<Rol> {
    return this.http.get<ApiResponse<Rol>>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data)
    );
  }

  crear(rol: any): Observable<Rol> {
    return this.http.post<ApiResponse<Rol>>(this.apiUrl, rol).pipe(
      map(response => response.data)
    );
  }

  actualizar(id: number, rol: any): Observable<Rol> {
    return this.http.put<ApiResponse<Rol>>(`${this.apiUrl}/${id}`, rol).pipe(
      map(response => response.data)
    );
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }
}
