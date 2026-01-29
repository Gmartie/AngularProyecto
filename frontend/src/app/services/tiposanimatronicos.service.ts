/**
 * SERVICIO: TiposAnimatronicosService
 *
 * Gestiona tipos/gamas de animatrónicos
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TipoAnimatronico } from '../models/tiposanimatronicos.model';
@Injectable({
  providedIn: 'root'
})
export class TiposAnimatronicosService {

  private apiUrl = 'http://localhost:3000/api/tipos-animatronicos';

  constructor(private http: HttpClient) {}

  obtenerTodos(idLocal?: number): Observable<TipoAnimatronico[]> {
    const url = idLocal ? `${this.apiUrl}?id_local=${idLocal}` : this.apiUrl;
    return this.http.get<TipoAnimatronico[]>(url);
  }

  obtenerPorId(id: number): Observable<TipoAnimatronico> {
    return this.http.get<TipoAnimatronico>(`${this.apiUrl}/${id}`);
  }

  crear(tipo: TipoAnimatronico): Observable<TipoAnimatronico> {
    return this.http.post<TipoAnimatronico>(this.apiUrl, tipo);
  }

  actualizar(id: number, tipo: TipoAnimatronico): Observable<TipoAnimatronico> {
    return this.http.put<TipoAnimatronico>(`${this.apiUrl}/${id}`, tipo);
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
