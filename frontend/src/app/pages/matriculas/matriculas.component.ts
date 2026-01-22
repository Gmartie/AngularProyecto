/**
 * COMPONENTE: MatriculasComponent
 * 
 * Gestión de matrículas de alumnos
 * Vincula alumnos con módulos
 * Solo accesible por administradores
 */

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatriculaService } from '../../services/matricula.service';
import { AlumnoService } from '../../services/alumno.service';
import { ModuloService } from '../../services/modulo.service';
import { AuthService } from '../../services/auth.service';

interface Matricula {
  id: number;
  alumno_id: number;
  modulo_id: number;
  alumno_nombre: string;
  modulo_nombre: string;
  fecha_matricula: string;
  calificacion: number | null;
  estado: string;
}

interface Alumno {
  id: number;
  nombre: string;
  email: string;
  movil: string;
}

interface Modulo {
  id: number;
  codigo: string;
  nombre: string;
  horasSemanales: number;
  curso: string;
}

@Component({
  selector: 'app-matriculas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './matriculas.component.html',
  styleUrls: ['./matriculas.component.css']
})
export class MatriculasComponent implements OnInit {
  matriculas = signal<Matricula[]>([]);
  alumnos = signal<Alumno[]>([]);
  modulos = signal<Modulo[]>([]);
  
  cargando = signal(false);
  error = signal<string | null>(null);
  puedeLeer = signal(false);
  puedoCrear = signal(false);
  
  formularioAbierto = signal(false);
  selectedAlumno = signal<number | null>(null);
  selectedModulo = signal<number | null>(null);
  
  filtroAlumno = signal('');
  filtroModulo = signal('');

  constructor(
    private readonly matriculaService: MatriculaService,
    private readonly alumnoService: AlumnoService,
    private readonly moduloService: ModuloService,
    private readonly authService: AuthService
  ) {
    this.verificarPermisos();
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  verificarPermisos(): void {
    const tienePermiso = this.authService.tieneRol('Administrador') || this.authService.tieneRol('Jefe Departamento');
    this.puedeLeer.set(tienePermiso);
    this.puedoCrear.set(tienePermiso);
  }

  cargarDatos(): void {
    if (!this.puedeLeer()) return;

    this.cargando.set(true);
    this.error.set(null);

    // Cargar matrículas
    this.matriculaService.obtenerTodas().subscribe({
      next: (response: any) => {
        const matriculas = response.data || response;
        this.matriculas.set(Array.isArray(matriculas) ? matriculas : []);
      },
      error: (err: any) => {
        console.error('❌ Error cargando matrículas:', err);
        this.error.set('Error al cargar matrículas: ' + (err.error?.message || err.message));
        this.cargando.set(false);
      }
    });

    // Cargar alumnos
    this.alumnoService.obtenerTodos().subscribe({
      next: (response: any) => {
        const alumnos = response.data || response;
        this.alumnos.set(Array.isArray(alumnos) ? alumnos : []);
      },
      error: (err: any) => {
        console.error('❌ Error cargando alumnos:', err);
      }
    });

    // Cargar módulos
    this.moduloService.obtenerTodos().subscribe({
      next: (response: any) => {
        const modulos = response.data || response;
        this.modulos.set(Array.isArray(modulos) ? modulos : []);
        this.cargando.set(false);
      },
      error: (err: any) => {
        console.error('❌ Error cargando módulos:', err);
        this.cargando.set(false);
      }
    });
  }

  abrirFormulario(): void {
    this.formularioAbierto.set(true);
    this.selectedAlumno.set(null);
    this.selectedModulo.set(null);
  }

  cerrarFormulario(): void {
    this.formularioAbierto.set(false);
    this.selectedAlumno.set(null);
    this.selectedModulo.set(null);
  }

  crearMatricula(): void {
    const alumno = this.selectedAlumno();
    const modulo = this.selectedModulo();
    
    if (!alumno || !modulo) {
      this.error.set('Debe seleccionar un alumno y un módulo');
      return;
    }

    this.matriculaService.crear(alumno, modulo).subscribe({
      next: () => {
        console.log('✅ Matrícula creada correctamente');
        this.cerrarFormulario();
        this.cargarDatos();
      },
      error: (err: any) => {
        console.error('❌ Error creando matrícula:', err);
        this.error.set('Error: ' + (err.error?.message || err.message || 'No se pudo crear la matrícula'));
      }
    });
  }

  eliminarMatricula(id: number): void {
    if (!confirm('¿Está seguro de que desea eliminar esta matrícula?')) {
      return;
    }

    this.matriculaService.eliminar(id).subscribe({
      next: () => {
        console.log('✅ Matrícula eliminada correctamente');
        this.cargarDatos();
      },
      error: (err: any) => {
        console.error('❌ Error eliminando matrícula:', err);
        this.error.set('Error al eliminar: ' + (err.error?.message || err.message));
      }
    });
  }

  obtenerNombreAlumno(alumnoId: number): string {
    const alumno = this.alumnos().find(a => a.id === alumnoId);
    return alumno ? alumno.nombre : `Alumno ${alumnoId}`;
  }

  obtenerNombreModulo(moduloId: number): string {
    const modulo = this.modulos().find(m => m.id === moduloId);
    return modulo ? modulo.nombre : `Módulo ${moduloId}`;
  }
}
