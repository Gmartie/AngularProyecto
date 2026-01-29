/**
 * SERVICIO: AnimatronicosService
 *
 * Gestiona operaciones CRUD de animatrónicos
 * Comunica con API backend
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Animatronico } from '../models/animatronico.model';

@Injectable({
  providedIn: 'root'
})
export class AnimatronicosService {

  private apiUrl = 'http://localhost:3000/api/animatronicos';

  constructor(private http: HttpClient) {}

  obtenerTodos(idGama?: number): Observable<Animatronico[]> {
    const url = idGama ? `${this.apiUrl}?id_gama=${idGama}` : this.apiUrl;
    return this.http.get<Animatronico[]>(url);
  }

  obtenerPorId(id: number): Observable<Animatronico> {
    return this.http.get<Animatronico>(`${this.apiUrl}/${id}`);
  }

  crear(animatronico: Animatronico): Observable<Animatronico> {
    return this.http.post<Animatronico>(this.apiUrl, animatronico);
  }

  actualizar(id: number, animatronico: Animatronico): Observable<Animatronico> {
    return this.http.put<Animatronico>(`${this.apiUrl}/${id}`, animatronico);
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
