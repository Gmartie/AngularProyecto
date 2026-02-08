import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, BehaviorSubject } from 'rxjs';

export interface VentanaAbierta {
  id: string;
  title: string;
  icon: string;
  isMinimized: boolean;
}

export interface Usuario {
  id: number;
  usuario: string;
  nombre?: string;
  email?: string;
}

@Component({
  selector: 'app-desktop-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './desktop-bar.component.html',
  styleUrls: ['./desktop-bar.component.css']
})
export class DesktopBarComponent implements OnInit, OnDestroy {
  
  @Input() usuario: Usuario | null = null;
  @Input() set ventanasAbiertas(ventanas: VentanaAbierta[]) {
    this.ventanasAbiertasSubject.next(ventanas);
  }
  
  @Output() onRestaurarVentana = new EventEmitter<string>();
  @Output() onCerrarSesion = new EventEmitter<void>();
  
  horaActual: string = '';
  private intervaloHora: any;
  
  // Observable para las ventanas abiertas
  private ventanasAbiertasSubject = new BehaviorSubject<VentanaAbierta[]>([]);
  ventanasAbiertas$: Observable<VentanaAbierta[]> = this.ventanasAbiertasSubject.asObservable();

  ngOnInit(): void {
    this.actualizarHora();
    // Actualizar hora cada segundo para mayor precisión
    this.intervaloHora = setInterval(() => {
      this.actualizarHora();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.intervaloHora) {
      clearInterval(this.intervaloHora);
    }
  }

  private actualizarHora(): void {
    this.horaActual = new Date().toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  }

  restaurarVentana(windowId: string): void {
    this.onRestaurarVentana.emit(windowId);
  }

  cerrarSesion(): void {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      this.onCerrarSesion.emit();
    }
  }

  // Método auxiliar para obtener la hora actual (usado en el template)
  getHoraActual(): string {
    return this.horaActual;
  }
}
