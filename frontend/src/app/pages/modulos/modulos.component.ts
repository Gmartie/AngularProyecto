/**
 * COMPONENTE: ModulosComponent
 * 
 * Gestión de módulos del ciclo formativo
 * Permite crear, editar y eliminar módulos
 * Solo accesible por administradores y tutores
 */

import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModuloService } from '../../services/modulo.service';
import { ProfesorService } from '../../services/profesor.service';
import { AuthService } from '../../services/auth.service';
import { Modulo } from '../../models/modulo.model';
import { Profesor } from '../../models';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-modulos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modulos.component.html',
  styleUrls: ['./modulos.component.css']
})
export class ModulosComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  modulos = signal<Modulo[]>([]);
  profesores = signal<Profesor[]>([]);
  filtro = signal('');
  cargando = signal(false);
  error = signal('');
  mostrarFormulario = signal(false);
  editando = signal(false);
  moduloActual = signal<Modulo>({
    id: 0,
    codigo: '',
    nombre: '',
    horasSemanales: 0,
    curso: 'Primero'
  });

  modulosFiltrados = computed(() => {
    const filtroLower = this.filtro().toLowerCase();
    if (!filtroLower.trim()) {
      return this.modulos();
    }
    return this.modulos().filter(m =>
      m.nombre.toLowerCase().includes(filtroLower) ||
      m.codigo.toLowerCase().includes(filtroLower)
    );
  });

  private readonly moduloService = inject(ModuloService);
  private readonly profesorService = inject(ProfesorService);
  private readonly authService = inject(AuthService);

  ngOnInit(): void {
    this.cargarModulos();
    this.cargarProfesores();
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
  }

  cargarModulos(): void {
    this.cargando.set(true);
    this.error.set('');
    this.moduloService.obtenerTodos().subscribe({
      next: (response: any) => {
        console.log('📋 Respuesta de módulos:', response);
        
        // El backend devuelve { success, message, data: [...] }
        const modulos = response.data || response;
        
        console.log('📋 Módulos obtenidos:', modulos);
        this.modulos.set(Array.isArray(modulos) ? modulos : []);
        this.cargando.set(false);
      },
      error: (err: any) => {
        console.error('❌ Error completo:', err);
        console.error('❌ err.error:', err.error);
        console.error('❌ err.message:', err.message);
        console.error('❌ err.status:', err.status);
        console.error('❌ err.statusText:', err.statusText);
        
        this.error.set('Error al cargar módulos: ' + (err.error?.message || err.error || err.message || 'Unknown error'));
        this.cargando.set(false);
      }
    });
  }

  cargarProfesores(): void {
    this.profesorService.obtenerTodos().subscribe({
      next: (response: any) => {
        console.log('👨‍🏫 Respuesta de profesores:', response);
        
        // El backend devuelve { success, message, data: [...] }
        const profesores = response.data || response;
        
        console.log('👨‍🏫 Profesores obtenidos:', profesores);
        this.profesores.set(Array.isArray(profesores) ? profesores : []);
      },
      error: (err: any) => {
        console.error('❌ Error al cargar profesores:', err);
      }
    });
  }

  abrirFormularioNuevo(): void {
    this.editando.set(false);
    this.moduloActual.set({
      id: 0,
      codigo: '',
      nombre: '',
      horasSemanales: 0,
      curso: 'Primero'
    });
    this.mostrarFormulario.set(true);
  }

  editar(modulo: Modulo): void {
    this.editando.set(true);
    this.moduloActual.set({ ...modulo });
    this.mostrarFormulario.set(true);
  }

  guardar(): void {
    const actual = this.moduloActual();
    if (!actual.codigo || !actual.nombre) {
      this.error.set('Por favor completa todos los campos');
      return;
    }

    if (this.editando()) {
      this.moduloService.actualizar(actual.id, actual).subscribe({
        next: () => {
          this.cargarModulos();
          this.mostrarFormulario.set(false);
        },
        error: () => {
          this.error.set('Error al actualizar módulo');
        }
      });
    } else {
      this.moduloService.crear(actual).subscribe({
        next: () => {
          this.cargarModulos();
          this.mostrarFormulario.set(false);
        },
        error: () => {
          this.error.set('Error al crear módulo');
        }
      });
    }
  }

  eliminar(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este módulo?')) {
      this.moduloService.eliminar(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.cargarModulos();
          },
          error: () => {
            this.error.set('Error al eliminar módulo');
          }
        });
    }
  }

  cancelar(): void {
    this.mostrarFormulario.set(false);
  }

  puedeEditar(): boolean {
    return this.authService.esAdmin() || this.authService.esTutor() || this.authService.esProfesor();
  }

  puedeCrear(): boolean {
    return this.authService.esAdmin() || this.authService.esTutor();
  }

  puedeEliminar(): boolean {
    return this.authService.esAdmin() || this.authService.esTutor();
  }

  updateModuloProfesor(profesorId: string): void {
    const id = profesorId ? Number.parseInt(profesorId) : undefined;
    this.moduloActual.update(m => ({ ...m, profesorId: id }));
  }

  updateModuloCodigo(codigo: string): void {
    this.moduloActual.update(m => ({ ...m, codigo }));
  }

  updateModuloNombre(nombre: string): void {
    this.moduloActual.update(m => ({ ...m, nombre }));
  }

  updateModuloHoras(horasSemanales: number): void {
    this.moduloActual.update(m => ({ ...m, horasSemanales }));
  }

  updateModuloCurso(curso: string): void {
    this.moduloActual.update(m => ({ ...m, curso: curso as 'Primero' | 'Segundo' }));
  }
}
