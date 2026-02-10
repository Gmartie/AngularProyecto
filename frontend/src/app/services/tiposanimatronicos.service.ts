import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TipoAnimatronico } from '../models/tiposanimatronicos.model';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class TiposAnimatronicosService {

  private apiUrl = 'http://localhost:3000/api/tipos-animatronicos';

  constructor(private http: HttpClient) {}

  obtenerTodos(idLocal?: number): Observable<TipoAnimatronico[]> {
    const url = idLocal ? `${this.apiUrl}?id_local=${idLocal}` : this.apiUrl;
    return this.http.get<ApiResponse<TipoAnimatronico[]>>(url).pipe(
      map(response => {
        console.log('📥 Respuesta del backend:', response);
        const tipos = response.data || [];
        console.log('📋 Tipos extraídos:', tipos);
        return tipos;
      })
    );
  }

  obtenerPorId(id: number): Observable<TipoAnimatronico> {
    return this.http.get<ApiResponse<TipoAnimatronico>>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data)
    );
  }

  crear(tipo: TipoAnimatronico): Observable<TipoAnimatronico> {
    return this.http.post<ApiResponse<TipoAnimatronico>>(this.apiUrl, tipo).pipe(
      map(response => response.data)
    );
  }

  actualizar(id: number, tipo: TipoAnimatronico): Observable<TipoAnimatronico> {
    return this.http.put<ApiResponse<TipoAnimatronico>>(`${this.apiUrl}/${id}`, tipo).pipe(
      map(response => response.data)
    );
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }
}