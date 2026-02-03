/**
 * SERVICIO: BackgroundService
 * 
 * Gestiona el cambio dinámico del fondo de la aplicación
 * basado en el estado de autenticación y la ruta actual
 */

import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from './auth.service';

export type BackgroundType = 'web' | 'dashboard' | 'none';

@Injectable({
  providedIn: 'root'
})
export class BackgroundService {
  private backgroundTypeSubject = new BehaviorSubject<BackgroundType>('none');
  public backgroundType$ = this.backgroundTypeSubject.asObservable();

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.initializeBackgroundListener();
  }

  private initializeBackgroundListener(): void {
    // Escuchar cambios de ruta
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateBackground(event.url);
      });

    // Escuchar cambios en el estado de autenticación
    this.authService.usuario$.subscribe(usuario => {
      this.updateBackground(this.router.url, usuario !== null);
    });

    // Inicializar con la ruta actual
    this.updateBackground(this.router.url);
  }

  private updateBackground(url: string, isAuthenticated?: boolean): void {
    // Si no se proporciona isAuthenticated, verificar el estado actual
    if (isAuthenticated === undefined) {
      isAuthenticated = this.authService.estaAutenticado();
    }

    // Rutas que usan WebBackground.jpg (login y registro)
    const authRoutes = ['/login', '/registro'];
    const isAuthRoute = authRoutes.some(route => 
      url === route || url.startsWith(route + '?') || url.startsWith(route + '#')
    );

    // Home2 es el escritorio estilo Windows 95, no necesita fondo específico
    // porque tiene su propio fondo #008080
    const isHome2 = url === '/home2' || url.startsWith('/home2?') || url.startsWith('/home2#');

    if (isAuthRoute) {
      // Login o Registro -> WebBackground.jpg en mosaico
      this.setBackground('web');
    } else if (isHome2) {
      // Home2 tiene su propio fondo, no aplicar ninguno
      this.setBackground('none');
    } else if (isAuthenticated) {
      // Usuario autenticado en otras rutas -> Background.jpg
      this.setBackground('dashboard');
    } else {
      // Otras rutas sin fondo especial
      this.setBackground('none');
    }
  }

  private setBackground(type: BackgroundType): void {
    this.backgroundTypeSubject.next(type);
    this.applyBackgroundToBody(type);
  }

  private applyBackgroundToBody(type: BackgroundType): void {
    const body = document.body;

    // Limpiar clases previas
    body.classList.remove('bg-web', 'bg-dashboard', 'bg-none');

    // Aplicar la nueva clase
    switch (type) {
      case 'web':
        body.classList.add('bg-web');
        break;
      case 'dashboard':
        body.classList.add('bg-dashboard');
        break;
      case 'none':
      default:
        body.classList.add('bg-none');
        break;
    }
  }

  /**
   * Obtiene el tipo de fondo actual
   */
  getCurrentBackgroundType(): BackgroundType {
    return this.backgroundTypeSubject.value;
  }
}
