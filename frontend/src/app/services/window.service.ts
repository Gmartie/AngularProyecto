import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

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
  private windowsSubject = new BehaviorSubject<Window[]>([]);
  public windows$: Observable<Window[]> = this.windowsSubject.asObservable();

  private nextZIndex = 100;

  constructor() {}

  openWindow(id: string, title: string, icon: string, route: string): void {
    const windows = this.windowsSubject.value;
    const existingWindow = windows.find(w => w.id === id);

    if (existingWindow) {
      this.restoreWindow(id);
      return;
    }

    const newWindow: Window = {
      id,
      title,
      icon,
      route,
      isMinimized: false,
      isMaximized: false,
      zIndex: this.nextZIndex++
    };

    this.windowsSubject.next([...windows, newWindow]);
  }

  closeWindow(id: string): void {
    this.windowsSubject.next(
      this.windowsSubject.value.filter(w => w.id !== id)
    );
  }

  minimizeWindow(id: string): void {
    this.windowsSubject.next(
      this.windowsSubject.value.map(w =>
        w.id === id ? { ...w, isMinimized: true } : w
      )
    );
  }

  toggleMaximize(id: string): void {
    this.windowsSubject.next(
      this.windowsSubject.value.map(w =>
        w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
      )
    );
  }

  restoreWindow(id: string): void {
    this.windowsSubject.next(
      this.windowsSubject.value.map(w =>
        w.id === id
          ? { ...w, isMinimized: false, zIndex: this.nextZIndex++ }
          : w
      )
    );
  }

  bringToFront(id: string): void {
    this.windowsSubject.next(
      this.windowsSubject.value.map(w =>
        w.id === id ? { ...w, zIndex: this.nextZIndex++ } : w
      )
    );
  }

  closeAllWindows(): void {
    this.windowsSubject.next([]);
  }

  getWindow(id: string): Window | undefined {
    return this.windowsSubject.value.find(w => w.id === id);
  }

  isWindowOpen(id: string): boolean {
    return this.windowsSubject.value.some(w => w.id === id);
  }
}
