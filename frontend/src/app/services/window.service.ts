/**
 * SERVICIO: WindowService
 * 
 * Gestiona el estado de las ventanas abiertas en el escritorio
 * Las ventanas se muestran ENCIMA del escritorio home2
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router, NavigationExtras } from '@angular/router';
import { Location } from '@angular/common';

export interface Window {
  id: string;
  title: string;
  icon: string;
  route: string;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

@Injectable({
  providedIn: 'root'
})
export class WindowService {
  private windows = new BehaviorSubject<Window[]>([]);
  public windows$ = this.windows.asObservable();
  
  private currentZIndex = 100;
  private isNavigating = false;

  constructor(
    private router: Router,
    private location: Location
  ) {}

  /**
   * Abre una nueva ventana
   */
  openWindow(id: string, title: string, icon: string, route: string): void {
    const existingWindows = this.windows.value;
    
    // Verificar si la ventana ya está abierta
    const existingWindow = existingWindows.find(w => w.id === id);
    
    if (existingWindow) {
      // Si ya existe, traerla al frente
      this.focusWindow(id);
      this.navigateToRoute(route);
      return;
    }

    // Crear nueva ventana
    const newWindow: Window = {
      id,
      title,
      icon,
      route,
      isMinimized: false,
      isMaximized: false,
      zIndex: ++this.currentZIndex
    };

    this.windows.next([...existingWindows, newWindow]);
    
    // Navegar a la ruta del programa
    this.navigateToRoute(route);
  }

  /**
   * Cierra una ventana y vuelve a home2
   */
  closeWindow(id: string): void {
    const existingWindows = this.windows.value;
    const filteredWindows = existingWindows.filter(w => w.id !== id);
    
    this.windows.next(filteredWindows);
    
    // Si no quedan ventanas abiertas, volver al escritorio
    if (filteredWindows.length === 0) {
      this.router.navigate(['/home2']);
    } else {
      // Navegar a la ventana que queda arriba
      const topWindow = this.getTopWindow(filteredWindows);
      if (topWindow && !topWindow.isMinimized) {
        this.navigateToRoute(topWindow.route);
      } else {
        this.router.navigate(['/home2']);
      }
    }
  }

  /**
   * Minimiza una ventana (vuelve a home2 visualmente)
   */
  minimizeWindow(id: string): void {
    const existingWindows = this.windows.value;
    const updatedWindows = existingWindows.map(w => 
      w.id === id ? { ...w, isMinimized: true } : w
    );
    
    this.windows.next(updatedWindows);
    
    // Navegar a home2 para mostrar el escritorio
    this.router.navigate(['/home2']);
  }

  /**
   * Restaura una ventana minimizada
   */
  restoreWindow(id: string): void {
    const existingWindows = this.windows.value;
    const updatedWindows = existingWindows.map(w => 
      w.id === id ? { ...w, isMinimized: false, zIndex: ++this.currentZIndex } : w
    );
    
    this.windows.next(updatedWindows);
    
    const window = updatedWindows.find(w => w.id === id);
    if (window) {
      this.navigateToRoute(window.route);
    }
  }

  /**
   * Maximiza/Restaura una ventana
   */
  toggleMaximize(id: string): void {
    const existingWindows = this.windows.value;
    const updatedWindows = existingWindows.map(w => 
      w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
    );
    
    this.windows.next(updatedWindows);
  }

  /**
   * Trae una ventana al frente
   */
  focusWindow(id: string): void {
    const existingWindows = this.windows.value;
    const updatedWindows = existingWindows.map(w => 
      w.id === id ? { ...w, zIndex: ++this.currentZIndex, isMinimized: false } : w
    );
    
    this.windows.next(updatedWindows);
  }

  /**
   * Obtiene todas las ventanas
   */
  getWindows(): Window[] {
    return this.windows.value;
  }

  /**
   * Obtiene una ventana por ID
   */
  getWindow(id: string): Window | undefined {
    return this.windows.value.find(w => w.id === id);
  }

  /**
   * Verifica si hay ventanas abiertas
   */
  hasOpenWindows(): boolean {
    return this.windows.value.length > 0;
  }

  /**
   * Obtiene la ventana con mayor z-index (la de arriba)
   */
  private getTopWindow(windows: Window[]): Window | undefined {
    if (windows.length === 0) return undefined;
    return windows.reduce((prev, current) => 
      (prev.zIndex > current.zIndex) ? prev : current
    );
  }

  /**
   * Cierra todas las ventanas
   */
  closeAllWindows(): void {
    this.windows.next([]);
    this.router.navigate(['/home2']);
  }

  /**
   * Navega a una ruta sin perder el contexto de home2
   */
  private navigateToRoute(route: string): void {
    if (this.isNavigating) return;
    
    this.isNavigating = true;
    this.router.navigate([route], {
      skipLocationChange: false
    }).finally(() => {
      this.isNavigating = false;
    });
  }

  /**
   * Verifica si una ventana está activa
   */
  isWindowActive(id: string): boolean {
    const window = this.getWindow(id);
    return window ? !window.isMinimized : false;
  }
}
