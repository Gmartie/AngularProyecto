/**
 * COMPONENTE: ProfesoresComponent
 * 
 * Gestión de profesores del ciclo
 * Permite administradores y jefes gestionar profesores
 * Incluye búsqueda, creación, edición y eliminación
 */

import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Profesor } from '../../models';
import { ProfesorService, AuthService } from '../../services';

@Component({
  selector: 'app-profesores',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profesores.component.html',
  styleUrl: './profesores.component.css'
})
export class ProfesoresComponent implements OnInit {
  profesores = signal<Profesor[]>([]);
  busqueda = signal('');
  mostrarModal = signal(false);
  editando = signal(false);
  profesorActual = signal<Partial<Profesor>>({});
  cargando = signal(false);
  error = signal('');
  exito = signal('');

  // Permisos
  puedeLeer = signal(false);
  puedeCrear = signal(false);
  puedeEditar = signal(false);
  puedeEliminar = signal(false);

  // Computed
  profesorFiltrado = computed(() => {
    const busquedaVal = this.busqueda().toLowerCase().trim();
    const profesoresVal = this.profesores();
    
    if (!busquedaVal) {
      return profesoresVal;
    }
    
    return profesoresVal.filter(p =>
      p.nombre.toLowerCase().includes(busquedaVal) ||
      p.email?.toLowerCase().includes(busquedaVal) ||
      p.usuario?.toLowerCase().includes(busquedaVal)
    );
  });

  cargos = signal((['Jefe de Departamento', 'Tutor', 'Profesor'] as const).slice());

  constructor(
    private readonly profesorService: ProfesorService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.verificarPermisos();
    this.cargarProfesores();
  }

  verificarPermisos(): void {
    const tieneRolAdmin = this.authService.tieneRol('Administrador');
    const tieneRolJefe = this.authService.tieneRol('Jefe Departamento');
    const tieneRolProfesor = this.authService.tieneRol('Profesor');
    
    const usuario = this.authService.obtenerUsuario();
    console.log('🔐 Verificando permisos para profesores');
    console.log('   Usuario:', usuario?.usuario);
    console.log('   Roles completos:', usuario?.roles);
    console.log('   tieneRolAdmin:', tieneRolAdmin);
    console.log('   tieneRolJefe:', tieneRolJefe);
    console.log('   tieneRolProfesor:', tieneRolProfesor);
    
    // Administrador y Jefe Departamento: pueden leer, crear, editar y eliminar profesores
    if (tieneRolAdmin || tieneRolJefe) {
      this.puedeLeer.set(true);
      this.puedeCrear.set(true);
      this.puedeEditar.set(true);
      this.puedeEliminar.set(true);
      console.log('✅ Permisos completos asignados (Admin/Jefe)');
    } 
    // Profesor: solo puede ver
    else if (tieneRolProfesor) {
      this.puedeLeer.set(true);
      this.puedeCrear.set(false);
      this.puedeEditar.set(false);
      this.puedeEliminar.set(false);
      console.log('👁️  Solo lectura asignada (Profesor)');
    }
    // Otros roles: sin permisos
    else {
      this.error.set('No tienes permisos para ver profesores');
      console.log('❌ Sin permisos');
    }
  }

  cargarProfesores(): void {
    if (!this.puedeLeer()) return;

    this.cargando.set(true);
    this.profesorService.obtenerTodos().subscribe({
      next: (response: any) => {
        console.log('📋 Respuesta de profesores:', response);
        
        // El backend devuelve { success, message, data: [...] }
        const profesores = response.data || response;
        
        console.log('📋 Profesores obtenidos:', profesores);
        this.profesores.set(Array.isArray(profesores) ? profesores : []);
        this.cargando.set(false);
      },
      error: (err: any) => {
        console.error('❌ Error al cargar profesores:', err);
        this.error.set('Error al cargar profesores: ' + (err.error?.message || err.message));
        this.cargando.set(false);
      }
    });
  }

  abrirModalCrear(): void {
    if (!this.puedeCrear()) {
      this.error.set('No tienes permisos para crear profesores');
      return;
    }
    this.editando.set(false);
    this.profesorActual.set({ cargo: 'Profesor' });
    this.mostrarModal.set(true);
    this.error.set('');
  }

  abrirModalEditar(profesor: Profesor): void {
    if (!this.puedeEditar()) {
      this.error.set('No tienes permisos para editar profesores');
      return;
    }
    this.editando.set(true);
    this.profesorActual.set({ ...profesor });
    this.mostrarModal.set(true);
    this.error.set('');
  }

  cerrarModal(): void {
    this.mostrarModal.set(false);
    this.profesorActual.set({});
    this.exito.set('');
  }

  guardar(): void {
    const actual = this.profesorActual();
    if (!actual.nombre || !actual.email || !actual.cargo) {
      this.error.set('Nombre, email y cargo son requeridos');
      return;
    }

    // Validar formato del email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(actual.email)) {
      this.error.set('El email no es válido');
      return;
    }

    this.cargando.set(true);
    if (this.editando() && actual.id) {
      this.profesorService.actualizar(actual.id, actual).subscribe({
        next: () => {
          this.exito.set('Profesor actualizado correctamente');
          this.cargarProfesores();
          this.cerrarModal();
          this.cargando.set(false);
        },
        error: (err) => {
          const mensajeError = err.error?.message || err.message || 'Error desconocido';
          this.error.set('Error al actualizar: ' + mensajeError);
          this.cargando.set(false);
        }
      });
    } else {
      this.profesorService.crear(actual).subscribe({
        next: () => {
          this.exito.set('Profesor creado correctamente');
          this.cargarProfesores();
          this.cerrarModal();
          this.cargando.set(false);
        },
        error: (err) => {
          const mensajeError = err.error?.message || err.message || 'Error desconocido';
          this.error.set('Error al crear: ' + mensajeError);
          this.cargando.set(false);
        }
      });
    }
  }

  eliminar(profesor: Profesor): void {
    if (!this.puedeEliminar()) {
      this.error.set('No tienes permisos para eliminar profesores');
      return;
    }

    if (!confirm(`¿Eliminar profesor ${profesor.nombre}?`)) return;

    this.cargando.set(true);
    this.profesorService.eliminar(profesor.id).subscribe({
      next: () => {
        this.exito.set('Profesor eliminado correctamente');
        this.cargarProfesores();
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set('Error al eliminar: ' + err.message);
        this.cargando.set(false);
      }
    });
  }

  obtenerBadgeCargo(cargo: string): string {
    switch (cargo) {
      case 'Jefe de Departamento':
        return '👔';
      case 'Tutor':
        return '📋';
      case 'Profesor':
        return '👨‍🏫';
      default:
        return '';
    }
  }

  updateProfesorNombre(nombre: string): void {
    this.profesorActual.update(p => ({ ...p, nombre }));
  }

  updateProfesorEmail(email: string): void {
    this.profesorActual.update(p => ({ ...p, email }));
  }

  updateProfesorCargo(cargo: 'Jefe de Departamento' | 'Tutor' | 'Profesor'): void {
    this.profesorActual.update(p => ({ ...p, cargo }));
  }

  updateProfesorTitulacion(titulacion: string): void {
    this.profesorActual.update(p => ({ ...p, titulacion }));
  }
}
