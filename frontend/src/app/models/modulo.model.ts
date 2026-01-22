/**
 * MODELO: Estructura de Módulo
 * 
 * Define la interfaz para módulos del ciclo formativo
 */

// Módulo o asignatura
export interface Modulo {
  id: number;
  codigo: string;
  nombre: string;
  horasSemanales: number;
  curso: 'Primero' | 'Segundo';
  profesorId?: number;
  // Datos del profesor asignado (opcional)
  profesor?: {
    id: number;
    nombre: string;
    cargo: 'Jefe de Departamento' | 'Tutor' | 'Profesor';
  };
}

// Matrícula de alumno en un módulo
export interface Matricula {
  id: number;
  alumnoId: number;
  moduloId: number;
  fechaMatricula?: Date;
  estado: 'Activa' | 'Finalizada' | 'Cancelada';
  // Datos relacionados (opcional)
  alumno?: {
    id: number;
    nombre: string;
    email: string;
  };
  modulo?: {
    id: number;
    codigo: string;
    nombre: string;
  };
}
