import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

interface Animatronico {
  id?: number;
  nombre: string;
  reconocimiento: boolean;
  num_piezas: number;
  id_gama: number;
  nombre_gama?: string;
  planos: string;
  foto: string;
}

interface TipoAnimatronico {
  id: number;
  nombre: string;
  id_local: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AnimatronicosService {

  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  /**
   * ⭐ CAMBIO: Ahora usa el endpoint /api/animatronicos sin parámetros
   * El backend filtra automáticamente por id_local del token JWT
   */
  obtenerTodos(): Observable<Animatronico[]> {
    return this.http.get<ApiResponse<Animatronico[]>>(`${this.apiUrl}/animatronicos`)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Obtiene un animatrónico por su ID
   */
  obtenerPorId(id: number): Observable<Animatronico> {
    return this.http.get<ApiResponse<Animatronico>>(`${this.apiUrl}/animatronicos/${id}`)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Crea un nuevo animatrónico
   */
  crear(animatronico: Animatronico): Observable<ApiResponse<Animatronico>> {
    return this.http.post<ApiResponse<Animatronico>>(
      `${this.apiUrl}/animatronicos`,
      animatronico
    );
  }

  /**
   * Actualiza un animatrónico existente
   */
  actualizar(animatronico: Animatronico): Observable<ApiResponse<Animatronico>> {
    return this.http.put<ApiResponse<Animatronico>>(
      `${this.apiUrl}/animatronicos/${animatronico.id}`,
      animatronico
    );
  }

  /**
   * Elimina un animatrónico
   */
  eliminar(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/animatronicos/${id}`
    );
  }

  /**
   * Obtiene los tipos de animatrónicos
   */
  obtenerTipos(): Observable<TipoAnimatronico[]> {
    return this.http.get<ApiResponse<TipoAnimatronico[]>>(
      `${this.apiUrl}/tipos-animatronicos`
    ).pipe(
      map(response => response.data)
    );
  }

  /**
   * Sube una imagen (foto o planos) al servidor
   */
  subirImagen(formData: FormData, tipo: 'foto' | 'planos'): Observable<ApiResponse<{ filename: string }>> {
    return this.http.post<ApiResponse<{ filename: string }>> (
      `${this.apiUrl}/animatronicos/upload/${tipo}`,
      formData
    );
  }

  /**
   * Elimina una imagen del servidor
   */
  eliminarImagen(filename: string, tipo: 'foto' | 'planos'): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/animatronicos/imagen/${tipo}/${filename}`
    );
  }
}
