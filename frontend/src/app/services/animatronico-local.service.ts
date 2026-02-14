import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

interface AnimatronicoLocal {
  id_animatronico: number;
  id_local: number;
  fecha_instalacion: string;
  estado: string;
  animatronico_nombre?: string;
  animatronico_foto?: string;
  animatronico_gama?: string;
  local_ciudad?: string;
  local_direccion?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AnimatronicoLocalService {

  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todas las relaciones animatrónico-local
   */
  obtenerTodos(): Observable<AnimatronicoLocal[]> {
    return this.http.get<ApiResponse<AnimatronicoLocal[]>>(`${this.apiUrl}/animatronico-local`)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Obtiene las relaciones de un local específico
   */
  obtenerPorLocal(id_local: number): Observable<AnimatronicoLocal[]> {
    return this.http.get<ApiResponse<AnimatronicoLocal[]>>(`${this.apiUrl}/animatronico-local/local/${id_local}`)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Asigna un animatrónico a un local
   */
  asignar(data: Partial<AnimatronicoLocal>): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/animatronico-local`,
      data
    );
  }

  /**
   * Actualiza el estado de un animatrónico en un local
   */
  actualizarEstado(id_animatronico: number, id_local: number, estado: string): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(
      `${this.apiUrl}/animatronico-local/${id_animatronico}/${id_local}`,
      { estado }
    );
  }

  /**
   * Remueve un animatrónico de un local
   */
  remover(id_animatronico: number, id_local: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.apiUrl}/animatronico-local/${id_animatronico}/${id_local}`
    );
  }
}
