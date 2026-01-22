/**
 * COMPONENTE: AlumnosComponent
 * 
 * Descripción: Gestiona la visualización, creación, edición y eliminación de alumnos.
 * Solo los administradores y jefes de departamento pueden acceder a este componente.
 * 
 * Funcionalidades:
 * - Cargar lista de alumnos desde la BD
 * - Filtrar alumnos por nombre, email o teléfono
 * - Crear nuevos alumnos
 * - Editar información de alumnos existentes
 * - Eliminar alumnos
 * - Verificar permisos de usuario
 */

import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Alumno } from '../../models';
import { AlumnoService, AuthService } from '../../services';

@Component({
  selector: 'app-alumnos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './alumnos.component.html',
  styleUrl: './alumnos.component.css'
})
export class AlumnosComponent implements OnInit {
  
  // ════════════════════════════════════════════════════════════════════════════
  // SIGNALS: FUNDAMENTOS
  // ════════════════════════════════════════════════════════════════════════════
  //
  // ¿QUÉ SON LOS SIGNALS?
  // ────────────────────
  // Los signals son una forma MODERNA de gestionar estado en Angular 17+
  // Son variables reactivas que notifican automáticamente cuando cambian
  //
  // COMPARACIÓN:
  //   ❌ ANTIGUO (observables con RxJS):
  //      - Código más complejo
  //      - Necesita subscriptions
  //      - Gestión manual de unsubscribe
  //      - Operadores complejos (map, filter, etc.)
  //
  //   ✅ NUEVO (signals):
  //      - Sintaxis simple y directa
  //      - Sin necesidad de subscriptions en el componente
  //      - Sin memory leaks si usas bien
  //      - La template se actualiza automáticamente
  //
  // VENTAJAS DE SIGNALS:
  // ────────────────────
  // 1. REACTIVIDAD AUTOMÁTICA
  //    Cuando cambias un signal, Angular detecta el cambio y re-renderiza
  //    automáticamente solo la parte afectada de la template
  //
  // 2. RENDIMIENTO
  //    Los signals son GRANULARES - solo actualizan lo que cambió
  //    No necesita re-renderizar todo el componente
  //
  // 3. SINTAXIS SIMPLE
  //    signal() crea un signal
  //    miSignal() lee el valor
  //    miSignal.set(nuevoValor) actualiza el valor
  //    miSignal.update(fn) actualiza basado en valor anterior
  //
  // TIPOS DE VALORES EN SIGNALS:
  // ────────────────────────────
  // signal<T>(valorInicial) → Almacena un valor de tipo T
  // Ejemplos:
  //   signal<string>('hola')          → Signal con string
  //   signal<number>(0)               → Signal con número
  //   signal<boolean>(false)          → Signal con boolean
  //   signal<Alumno[]>([])            → Signal con array de alumnos
  //   signal<Partial<Alumno>>({})     → Signal con objeto parcial
  //
  // ════════════════════════════════════════════════════════════════════════════
  // SIGNALS DEL COMPONENTE
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * alumnos - Array de todos los alumnos cargados desde la BD
   * 
   * TIPO: signal<Alumno[]>
   * VALOR INICIAL: [] (array vacío)
   * 
   * PROPÓSITO:
   *   - Almacenar la lista completa de alumnos que cargamos del servidor
   *   - Sirve como "fuente de datos" para filtrar y mostrar
   * 
   * ¿CUÁNDO CAMBIA?
   *   - Al cargar alumnos: this.alumnos.set(alumnosDelServidor)
   *   - Después de crear: se recarga con cargarAlumnos()
   *   - Después de editar: se recarga con cargarAlumnos()
   *   - Después de eliminar: se recarga con cargarAlumnos()
   * 
   * FLUJO DE DATOS:
   *   Servidor BD → alumnoService.obtenerTodos() → alumnos signal → Template
   * 
   * EJEMPLO:
   *   // En cargarAlumnos():
   *   this.alumnos.set(Array.isArray(alumnos) ? alumnos : []);
   *   // Ahora this.alumnos() devuelve la lista
   */
  alumnos = signal<Alumno[]>([]);
  
  /**
   * busqueda - Término de búsqueda ingresado por el usuario
   * 
   * TIPO: signal<string>
   * VALOR INICIAL: '' (string vacío)
   * 
   * PROPÓSITO:
   *   - Almacenar lo que el usuario escribe en el input de búsqueda
   *   - Se usa en alumnoFiltrado (computed) para filtrar alumnos
   * 
   * ¿CUÁNDO CAMBIA?
   *   - Cada vez que el usuario escribe en el input
   *   - En el template: (ngModelChange)="busqueda.set($event)"
   * 
   * RELACIÓN CON OTROS SIGNALS:
   *   busqueda signal → alumnoFiltrado computed → Template muestra resultados
   * 
   * EJEMPLO EN TEMPLATE:
   *   <input [(ngModel)]="busqueda()" />  // Lee y escribe el valor
   *   // Cuando cambia → alumnoFiltrado se recalcula automáticamente
   */
  busqueda = signal('');
  
  /**
   * mostrarModal - Controla si el modal de crear/editar está visible
   * 
   * TIPO: signal<boolean>
   * VALOR INICIAL: false (modal oculto)
   * 
   * PROPÓSITO:
   *   - Mostrar/ocultar el modal de formulario
   *   - Angular renderiza el modal condicionalmente: @if (mostrarModal())
   * 
   * ¿CUÁNDO CAMBIA?
   *   - abrirModalCrear() → this.mostrarModal.set(true)
   *   - abrirModalEditar() → this.mostrarModal.set(true)
   *   - cerrarFormulario() → this.mostrarModal.set(false)
   *   - guardar() → this.mostrarModal.set(false) (después de guardar)
   * 
   * EJEMPLO EN TEMPLATE:
   *   @if (mostrarModal()) {
   *     <div class="modal">
   *       <!-- Formulario para crear/editar -->
   *     </div>
   *   }
   */
  mostrarModal = signal(false);
  
  /**
   * editando - Indica si estamos editando o creando nuevo alumno
   * 
   * TIPO: signal<boolean>
   * VALOR INICIAL: false (modo crear)
   * 
   * PROPÓSITO:
   *   - Saber si el usuario está editando un alumno existente o creando uno nuevo
   *   - Se usa para cambiar el comportamiento del guardar():
   *     - Si editando() = true → actualizar alumno
   *     - Si editando() = false → crear nuevo alumno
   * 
   * LÓGICA EN guardar():
   *   if (!editando()) {
   *     // Crear nuevo alumno con usuario
   *     this.crearConUsuario();
   *   } else {
   *     // Actualizar alumno existente
   *     this.actualizar();
   *   }
   * 
   * ¿CUÁNDO CAMBIA?
   *   - abrirModalCrear() → this.editando.set(false)
   *   - abrirModalEditar() → this.editando.set(true)
   */
  editando = signal(false);
  
  /**
   * alumnoActual - El alumno que se está editando o el nuevo que se crea
   * 
   * TIPO: signal<Partial<Alumno>>
   * VALOR INICIAL: {} (objeto vacío)
   * 
   * PROPÓSITO:
   *   - Almacenar temporalmente los datos del alumno que el usuario está creando/editando
   *   - Sirve como modelo para el formulario en el modal
   * 
   * PROPIEDADES DEL ALUMNO:
   *   {
   *     id?: number;
   *     nombre?: string;
   *     email?: string;
   *     movil?: string;
   *     // ... otras propiedades
   *   }
   * 
   * ¿CUÁNDO SE ACTUALIZA?
   *   - abrirModalCrear() → this.alumnoActual.set({}) (vacío para nuevo)
   *   - abrirModalEditar(alumno) → this.alumnoActual.set(alumno) (copia del alumno)
   *   - En el formulario: [(ngModel)]="alumnoActual().nombre" (vinculación bidireccional)
   * 
   * VINCULACIÓN BIDIRECCIONAL (Two-way binding):
   *   <input [(ngModel)]="alumnoActual().nombre" />
   *   // Cuando el usuario escribe → alumnoActual() se actualiza automáticamente
   *   // Cuando se asigna alumnoActual → el input muestra el nuevo valor
   * 
   * EJEMPLO:
   *   abrirModalEditar(alumno: Alumno) {
   *     this.editando.set(true);
   *     this.alumnoActual.set(alumno);  // ← Copia el alumno al modal
   *     this.mostrarModal.set(true);
   *   }
   */
  alumnoActual = signal<Partial<Alumno>>({});
  
  /**
   * passwordAlumno - Contraseña temporal para crear usuario del alumno
   * 
   * TIPO: signal<string>
   * VALOR INICIAL: '' (vacía)
   * 
   * PROPÓSITO:
   *   - SOLO se usa cuando CREAMOS un nuevo alumno
   *   - Almacena la contraseña que el usuario quiere asignar al nuevo usuario
   *   - Se envía al servidor para crear el usuario junto con el alumno
   * 
   * ¿CUÁNDO SE USA?
   *   - Aparece en el formulario SOLO cuando editando() = false (creando)
   *   - En guardar() → si (!editando()) se envía passwordAlumno al servidor
   * 
   * ¿CUÁNDO NO SE USA?
   *   - Al editar un alumno existente (mostrarModal y editando son independientes)
   *   - No se puede cambiar contraseña desde aquí (seguridad)
   * 
   * FLUJO:
   *   Usuario escribe: <input [(ngModel)]="passwordAlumno()" />
   *   Usuario confirma: <input [(ngModel)]="confirmPassword()" />
   *   Validación: passwordAlumno() === confirmPassword()
   *   Si OK → Se envía al servidor en crearConUsuario()
   */
  passwordAlumno = signal('');
  
  /**
   * confirmPassword - Confirmación de la contraseña
   * 
   * TIPO: signal<string>
   * VALOR INICIAL: '' (vacía)
   * 
   * PROPÓSITO:
   *   - SOLO se usa cuando CREAMOS un nuevo alumno
   *   - El usuario debe escribir la contraseña DOS veces para evitar errores
   *   - Se valida que passwordAlumno() === confirmPassword()
   * 
   * VALIDACIÓN EN TEMPLATE:
   *   @if (passwordAlumno() !== confirmPassword()) {
   *     <p class="error">Las contraseñas no coinciden</p>
   *   }
   * 
   * VALIDACIÓN EN COMPONENTE:
   *   guardar() {
   *     if (this.passwordAlumno() !== this.confirmPassword()) {
   *       this.error.set('Las contraseñas no coinciden');
   *       return;
   *     }
   *     // Continuar con la creación
   *   }
   */
  confirmPassword = signal('');
  
  /**
   * cargando - Indica si se está haciendo una petición al servidor
   * 
   * TIPO: signal<boolean>
   * VALOR INICIAL: false
   * 
   * PROPÓSITO:
   *   - Mostrar spinner de carga mientras se procesa una petición
   *   - Deshabilitar botones para evitar clicks múltiples
   *   - Mejorar UX mostrando que algo está pasando
   * 
   * ¿CUÁNDO CAMBIA?
   *   - Antes de cualquier petición: this.cargando.set(true)
   *   - Después de respuesta: this.cargando.set(false)
   * 
   * EJEMPLO EN COMPONENTE:
   *   cargarAlumnos() {
   *     this.cargando.set(true);  // ← Muestra spinner
   *     this.alumnoService.obtenerTodos().subscribe({
   *       next: () => {
   *         this.alumnos.set(...);
   *         this.cargando.set(false);  // ← Oculta spinner
   *       }
   *     });
   *   }
   * 
   * EJEMPLO EN TEMPLATE:
   *   @if (cargando()) {
   *     <div class="spinner">Cargando...</div>
   *   }
   *   @if (!cargando() && alumnos().length > 0) {
   *     <table><!-- Mostrar tabla --></table>
   *   }
   */
  cargando = signal(false);
  
  /**
   * error - Mensaje de error si algo falla
   * 
   * TIPO: signal<string>
   * VALOR INICIAL: '' (vacío)
   * 
   * PROPÓSITO:
   *   - Almacenar mensaje de error para mostrar al usuario
   *   - Se limpia después de operaciones exitosas
   *   - Se muestra en un div rojo en la template
   * 
   * ¿CUÁNDO SE ASIGNA?
   *   - Si hay error en la validación: this.error.set('Nombre es requerido')
   *   - Si la petición falla: this.error.set('Error: ' + err.message)
   *   - Si las contraseñas no coinciden: this.error.set('Las contraseñas no coinciden')
   * 
   * ¿CUÁNDO SE LIMPIA?
   *   - Al abrir el modal: this.error.set('')
   *   - Después de una operación exitosa: this.error.set('')
   * 
   * EJEMPLO EN TEMPLATE:
   *   @if (error()) {
   *     <div class="alert-error">{{ error() }}</div>
   *   }
   */
  error = signal('');
  
  /**
   * exito - Mensaje de éxito después de una operación
   * 
   * TIPO: signal<string>
   * VALOR INICIAL: '' (vacío)
   * 
   * PROPÓSITO:
   *   - Mostrar mensaje de éxito temporal al usuario
   *   - Confirma que la operación se completó correctamente
   * 
   * ¿CUÁNDO SE ASIGNA?
   *   - Después de crear alumno exitosamente
   *   - Después de editar alumno exitosamente
   *   - Después de eliminar alumno exitosamente
   * 
   * EJEMPLO:
   *   next: () => {
   *     this.exito.set('✅ Alumno guardado exitosamente');
   *     this.cargarAlumnos();
   *   }
   * 
   * EJEMPLO EN TEMPLATE:
   *   @if (exito()) {
   *     <div class="alert-success">{{ exito() }}</div>
   *   }
   */
  exito = signal('');

  /**
   * puedeLeer, puedeCrear, puedeEditar, puedeEliminar
   * ─────────────────────────────────────────────────────
   * 
   * GRUPO DE SIGNALS DE PERMISOS
   * 
   * TIPO: signal<boolean>
   * VALOR INICIAL: false
   * 
   * PROPÓSITO:
   *   - Almacenar los permisos del usuario actual
   *   - Mostrar/ocultar botones en la template según permisos
   *   - Validar que el usuario pueda realizar cada acción
   * 
   * ¿QUIÉN PUEDE QUÉ?
   *   - Administrador:
   *     ✓ Leer alumnos
   *     ✓ Crear alumnos
   *     ✓ Editar alumnos
   *     ✓ Eliminar alumnos
   *   
   *   - Jefe de Departamento:
   *     ✓ Leer alumnos
   *     ✓ Crear alumnos
   *     ✓ Editar alumnos
   *     ✓ Eliminar alumnos
   *   
   *   - Otros roles:
   *     ✗ No ven nada
   * 
   * ¿CUÁNDO SE ASIGNAN?
   *   - En ngOnInit() → verificarPermisos() se ejecuta
   *   - Se valida usando: authService.tieneRol('Administrador')
   * 
   * EJEMPLO EN COMPONENTE:
   *   verificarPermisos() {
   *     const tienePermiso = 
   *       this.authService.tieneRol('Administrador') ||
   *       this.authService.tieneRol('Jefe Departamento');
   *     
   *     this.puedeLeer.set(tienePermiso);
   *     this.puedeCrear.set(tienePermiso);
   *     this.puedeEditar.set(tienePermiso);
   *     this.puedeEliminar.set(tienePermiso);
   *   }
   * 
   * EJEMPLO EN TEMPLATE:
   *   @if (puedeCrear()) {
   *     <button (click)="abrirModalCrear()">+ Nuevo Alumno</button>
   *   }
   *   
   *   @for (alumno of alumnos(); track alumno.id) {
   *     <tr>
   *       <td>{{ alumno.nombre }}</td>
   *       @if (puedeEditar()) {
   *         <button (click)="abrirModalEditar(alumno)">Editar</button>
   *       }
   *       @if (puedeEliminar()) {
   *         <button (click)="eliminar(alumno.id)">Eliminar</button>
   *       }
   *     </tr>
   *   }
   */
  puedeLeer = signal(false);
  puedeCrear = signal(false);
  puedeEditar = signal(false);
  puedeEliminar = signal(false);

  /**
   * alumnoFiltrado - SIGNAL COMPUTED (Derivado)
   * ───────────────────────────────────────────
   * 
   * TIPO: computed(() => Alumno[])
   * 
   * ¿QUÉ ES UN COMPUTED?
   * ────────────────────
   * Un computed es un "signal derivado"
   * No almacena su propio valor, lo CALCULA basado en otros signals
   * Se actualiza automáticamente cuando sus signals dependientes cambian
   * 
   * EN ESTE CASO:
   *   alumnoFiltrado DEPENDE DE:
   *   - busqueda signal (lo que escribe el usuario)
   *   - alumnos signal (la lista completa)
   * 
   * FLUJO:
   *   1. Usuario escribe en búsqueda → busqueda signal cambia
   *   2. Angular detecta que busqueda cambió
   *   3. Recalcula alumnoFiltrado automáticamente
   *   4. Template se actualiza con resultados filtrados
   * 
   * PROPÓSITO:
   *   - Mostrar SOLO los alumnos que coinciden con la búsqueda
   *   - Sin necesidad de hacer peticiones al servidor
   *   - Filtrado EN MEMORIA (instantáneo)
   * 
   * ALGORITMO DE FILTRADO:
   *   - Si busqueda está vacía → devuelve todos los alumnos
   *   - Si busqueda tiene texto → filtra por:
   *     * Nombre (case-insensitive)
   *     * Email (case-insensitive)
   *     * Teléfono (búsqueda exacta)
   * 
   * OPTIMIZACIÓN:
   *   - SOLO se recalcula cuando busqueda() o alumnos() cambian
   *   - NO se recalcula cuando otros signals cambian
   *   - Esto mejora el rendimiento significativamente
   * 
   * EJEMPLO EN TEMPLATE:
   *   // En lugar de usar alumnos() directamente:
   *   @for (alumno of alumnoFiltrado(); track alumno.id) {
   *     <tr>{{ alumno.nombre }}</tr>
   *   }
   * 
   * VENTAJA VS OBSERVABLE/PIPE:
   *   ❌ ANTIGUO con observables:
   *      filteredAlumnos$ = this.busqueda$.pipe(
   *        debounceTime(300),
   *        switchMap(term => this.service.filtrar(term))
   *      )
   *   
   *   ✅ NUEVO con signals:
   *      alumnoFiltrado = computed(() => {
   *        // Lógica simple y directa
   *      })
   */
  alumnoFiltrado = computed(() => {
    const termino = this.busqueda().toLowerCase();
    if (!termino.trim()) {
      return [...this.alumnos()];
    }
    return this.alumnos().filter(a =>
      a.nombre.toLowerCase().includes(termino) ||
      a.email.toLowerCase().includes(termino) ||
      a.movil?.includes(termino)
    );
  });

  constructor(
    private readonly alumnoService: AlumnoService,
    private readonly authService: AuthService
  ) {}

  /**
   * Ciclo de vida OnInit
   * Se ejecuta al inicializar el componente
   * - Verifica permisos del usuario
   * - Carga la lista de alumnos desde la BD
   */
  ngOnInit(): void {
    this.verificarPermisos();
    this.cargarAlumnos();
  }

  /**
   * Verifica los permisos del usuario actual
   * Los administradores y jefes de departamento pueden leer, crear, editar y eliminar alumnos
   */
  verificarPermisos(): void {
    // Verificamos si es admin O jefe de departamento
    const tienePermiso = this.authService.tieneRol('Administrador') || this.authService.tieneRol('Jefe Departamento');
    
    this.puedeLeer.set(tienePermiso);
    this.puedeCrear.set(tienePermiso);
    this.puedeEditar.set(tienePermiso);
    this.puedeEliminar.set(tienePermiso);

    if (!tienePermiso) {
      this.error.set('No tienes permisos para ver alumnos');
    }
  }

  /**
   * Carga todos los alumnos desde la base de datos
   * Actualiza la lista y aplica filtro inicial
   */
  cargarAlumnos(): void {
    if (!this.puedeLeer()) return;

    this.cargando.set(true);
    this.alumnoService.obtenerTodos().subscribe({
      next: (response: any) => {
        console.log('📋 Respuesta de alumnos:', response);
        
        // El backend devuelve { success, message, data: [...] }
        const alumnos = response.data || response;
        
        console.log('📋 Alumnos obtenidos:', alumnos);
        this.alumnos.set(Array.isArray(alumnos) ? alumnos : []);
        this.cargando.set(false);
      },
      error: (err: any) => {
        console.error('❌ Error al cargar alumnos:', err);
        this.error.set('Error al cargar alumnos: ' + (err.error?.message || err.message));
        this.cargando.set(false);
      }
    });
  }


  /**
   * Abre el modal para crear un nuevo alumno
   */
  abrirModalCrear(): void {
    if (!this.puedeCrear()) {
      this.error.set('No tienes permisos para crear alumnos');
      return;
    }
    this.editando.set(false);
    this.alumnoActual.set({});
    this.passwordAlumno.set('');
    this.confirmPassword.set('');
    this.mostrarModal.set(true);
    this.error.set('');
  }

  /**
   * Abre el modal para editar un alumno existente
   * @param alumno - Alumno a editar
   */
  abrirModalEditar(alumno: Alumno): void {
    if (!this.puedeEditar()) {
      this.error.set('No tienes permisos para editar alumnos');
      return;
    }
    this.editando.set(true);
    this.alumnoActual.set({ ...alumno });
    this.mostrarModal.set(true);
    this.error.set('');
  }

  /**
   * Cierra el modal y limpia los datos del alumno actual
   */
  cerrarModal(): void {
    this.mostrarModal.set(false);
    this.alumnoActual.set({});
    this.passwordAlumno.set('');
    this.confirmPassword.set('');
    this.exito.set('');
  }

  /**
   * Guarda los cambios de un alumno (crear o actualizar)
   * Valida que los campos requeridos estén completos
   */
  guardar(): void {
    const alumnoActual = this.alumnoActual();
    
    if (!alumnoActual.nombre || !alumnoActual.email) {
      this.error.set('Nombre y email son requeridos');
      return;
    }

    this.cargando.set(true);
    
    // Si es nuevo alumno (creación)
    if (!this.editando()) {
      // Validaciones para nueva creación
      if (!this.passwordAlumno() || !this.confirmPassword()) {
        this.error.set('Contraseña es requerida para crear un alumno');
        this.cargando.set(false);
        return;
      }

      if (this.passwordAlumno() !== this.confirmPassword()) {
        this.error.set('Las contraseñas no coinciden');
        this.cargando.set(false);
        return;
      }

      if (this.passwordAlumno().length < 6) {
        this.error.set('La contraseña debe tener al menos 6 caracteres');
        this.cargando.set(false);
        return;
      }

      // Crear alumno CON usuario
      const alumnoConUsuario = {
        ...alumnoActual,
        password: this.passwordAlumno()
      };

      this.alumnoService.crearConUsuario(alumnoConUsuario).subscribe({
        next: () => {
          this.exito.set('Alumno creado correctamente. El usuario puede ahora iniciar sesión.');
          this.cargarAlumnos();
          this.cerrarModal();
          this.cargando.set(false);
        },
        error: (err) => {
          this.error.set('Error al crear: ' + (err.error?.message || err.message));
          this.cargando.set(false);
        }
      });
    } else if (alumnoActual.id) {
      // Si es edición de alumno existente
      this.alumnoService.actualizar(alumnoActual.id, alumnoActual).subscribe({
        next: () => {
          this.exito.set('Alumno actualizado correctamente');
          this.cargarAlumnos();
          this.cerrarModal();
          this.cargando.set(false);
        },
        error: (err) => {
          this.error.set('Error al actualizar: ' + err.message);
          this.cargando.set(false);
        }
      });
    } else {
      this.error.set('Error: No se pudo identificar al alumno');
      this.cargando.set(false);
    }
  }

  /**
   * Elimina un alumno existente
   * Pide confirmación antes de proceder
   * @param alumno - Alumno a eliminar
   */
  eliminar(alumno: Alumno): void {
    if (!this.puedeEliminar()) {
      this.error.set('No tienes permisos para eliminar alumnos');
      return;
    }

    if (!confirm(`¿Eliminar alumno ${alumno.nombre}?`)) return;

    this.cargando.set(true);
    this.alumnoService.eliminar(alumno.id).subscribe({
      next: () => {
        this.exito.set('Alumno eliminado correctamente');
        this.cargarAlumnos();
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set('Error al eliminar: ' + err.message);
        this.cargando.set(false);
      }
    });
  }

  updateAlumnoNombre(nombre: string): void {
    this.alumnoActual.update(a => ({ ...a, nombre }));
  }

  updateAlumnoEmail(email: string): void {
    this.alumnoActual.update(a => ({ ...a, email }));
  }

  updateAlumnoMovil(movil: string): void {
    this.alumnoActual.update(a => ({ ...a, movil }));
  }
}
