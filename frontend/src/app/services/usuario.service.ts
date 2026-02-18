
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Usuario } from '../models/usuario.model';
@Injectable({
providedIn: 'root'
})
export class UsuarioService {
private apiUrl = 'http://localhost:3000/api/usuarios';
constructor(private http: HttpClient) {}
obtenerTodos(): Observable<Usuario[]> {
return this.http.get<any>(this.apiUrl).pipe(
map(response => {
console.log('UsuarioService.obtenerTodos respuesta:', response);
return response.data || response || [];
}),
catchError(error => {
console.error('UsuarioService.obtenerTodos error:', error);
return of([]);
})
);
}
obtenerPorId(id: number): Observable<Usuario> {
return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
map(response => response.data || response)
);
}
crear(usuario: any): Observable<Usuario> {
return this.http.post<any>(this.apiUrl, usuario).pipe(
map(response => response.data || response)
);
}
actualizar(id: number, usuario: any): Observable<Usuario> {
return this.http.put<any>(`${this.apiUrl}/${id}`, usuario).pipe(
map(response => response.data || response)
);
}
eliminar(id: number): Observable<any> {
return this.http.delete<any>(`${this.apiUrl}/${id}`);
}
}
