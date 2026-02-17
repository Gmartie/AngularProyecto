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

@Injectable({ providedIn: 'root' })
export class TiposAnimatronicosService {

  private apiUrl = 'http://localhost:3000/api/tipos-animatronicos';

  constructor(private http: HttpClient) {}

  obtenerTodos(idLocal?: number): Observable<TipoAnimatronico[]> {
    const url = (idLocal !== undefined && idLocal !== null)
      ? `${this.apiUrl}?id_local=${idLocal}`
      : this.apiUrl;
    console.log('🌐 GET tipos URL:', url);
    return this.http.get<ApiResponse<TipoAnimatronico[]>>(url).pipe(
      map(response => response.data || [])
    );
  }

  obtenerPorId(id: number): Observable<TipoAnimatronico> {
    return this.http.get<ApiResponse<TipoAnimatronico>>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data)
    );
  }

  /** Crea un tipo. Si se proporciona icono, usa FormData. */
  crear(tipo: TipoAnimatronico, iconoFile?: File): Observable<TipoAnimatronico> {
    if (iconoFile) {
      const formData = new FormData();
      formData.append('nombre', tipo.nombre);
      formData.append('icono', iconoFile, iconoFile.name);
      return this.http.post<ApiResponse<TipoAnimatronico>>(this.apiUrl, formData).pipe(
        map(response => response.data)
      );
    }
    return this.http.post<ApiResponse<TipoAnimatronico>>(this.apiUrl, tipo).pipe(
      map(response => response.data)
    );
  }

  /** Actualiza un tipo. Si se proporciona icono, usa FormData. */
  actualizar(id: number, tipo: Partial<TipoAnimatronico>, iconoFile?: File): Observable<TipoAnimatronico> {
    if (iconoFile) {
      const formData = new FormData();
      if (tipo.nombre !== undefined) formData.append('nombre', tipo.nombre);
      formData.append('icono', iconoFile, iconoFile.name);
      return this.http.put<ApiResponse<TipoAnimatronico>>(`${this.apiUrl}/${id}`, formData).pipe(
        map(response => response.data)
      );
    }
    return this.http.put<ApiResponse<TipoAnimatronico>>(`${this.apiUrl}/${id}`, tipo).pipe(
      map(response => response.data)
    );
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }
}
