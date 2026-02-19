
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Rol } from '../models/rol.model';

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  private apiUrl = 'http://localhost:3000/api/roles';

  constructor(private http: HttpClient) {}

  obtenerTodos(): Observable<Rol[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => {
        console.log('RolesService.obtenerTodos respuesta:', response);
        return response.data || response || [];
      }),
      catchError(error => {
        console.error('RolesService.obtenerTodos error:', error);
        return of([]);
      })
    );
  }

  obtenerPorId(id: number): Observable<Rol> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data || response)
    );
  }

  crear(rol: any): Observable<Rol> {
    return this.http.post<any>(this.apiUrl, rol).pipe(
      map(response => response.data || response)
    );
  }

  actualizar(id: number, rol: any): Observable<Rol> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, rol).pipe(
      map(response => response.data || response)
    );
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
