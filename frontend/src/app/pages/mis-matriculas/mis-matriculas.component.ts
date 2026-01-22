/**
 * COMPONENTE: MisMatriculasComponent
 * 
 * Muestra matrículas activas del usuario autenticado
 * Permite a alumnos ver módulos en los que está matriculado
 */

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { MatriculaService } from '../../services/matricula.service';

@Component({
  selector: 'app-mis-matriculas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-matriculas.component.html',
  styleUrls: ['./mis-matriculas.component.css']
})
export class MisMatriculasComponent implements OnInit {
  /**
   * Array de matrículas del usuario actual
   */
  matriculas = signal<any[]>([]);

  /**
   * Indica si se está cargando datos
   */
  cargando = signal(true);

  /**
   * Mensaje de error si ocurre alguno
   */
  error = signal('');

  /**
   * Constructor inyecta servicios necesarios
   * @param authService - Servicio de autenticación
   * @param matriculaService - Servicio de matrículas
   */
  constructor(
    private readonly authService: AuthService,
    private readonly matriculaService: MatriculaService
  ) {}

  /**
   * Ciclo de vida: OnInit
   * Carga las matrículas cuando el componente se inicializa
   */
  ngOnInit(): void {
    this.cargarMatriculas();
  }

  /**
   * Carga las matrículas del usuario actual desde el backend
   * 
   * Flujo:
   * 1. Verifica que el usuario está autenticado
   * 2. Obtiene sus matrículas activas
   * 3. Maneja errores si existen
   */
  cargarMatriculas(): void {
    this.cargando.set(true);
    this.error.set('');

    // Obtener usuario actual
    const usuarioActual = this.authService.obtenerUsuario();
    
    if (!usuarioActual) {
      this.error.set('No hay usuario autenticado');
      this.cargando.set(false);
      return;
    }

    // Llamar al servicio de matrículas
    this.matriculaService.obtenerMisMatriculas().subscribe({
      next: (respuesta: any) => {
        if (respuesta.success && respuesta.data) {
          this.matriculas.set(respuesta.data);
        } else {
          this.error.set(respuesta.message || 'No se pudieron cargar las matrículas');
        }
        
        this.cargando.set(false);
      },
      error: (error: any) => {
        this.error.set(error?.error?.message || 'Error al cargar matrículas. Intenta más tarde.');
        this.cargando.set(false);
      }
    });
  }

  /**
   * Calcula el número total de horas semanales matriculadas
   * @returns Suma de horas semanales de todos los módulos
   */
  obtenerTotalHoras(): number {
    return this.matriculas().reduce((total: number, matricula: any) => {
      return total + (matricula.horasSemanales || 0);
    }, 0);
  }
}

