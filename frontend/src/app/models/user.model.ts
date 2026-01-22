/**
 * MODELOS: Estructuras de Usuario
 * 
 * Define interfaces para usuarios, roles y permisos del sistema
 * Incluye tipos para respuestas de autenticación
 */

// Usuario base del sistema
export interface Usuario {
  id: number;
  usuario: string;
  email: string;
  password?: string;
  fechaRegistro?: Date;
  activo: boolean;
}

// Profesor con relación a usuario
export interface Profesor {
  id: number;
  usuarioId: number;
  nombre: string;
  titulacion?: string;
  cargo: 'Jefe de Departamento' | 'Tutor' | 'Profesor';
  // Datos del usuario asociado
  usuario?: string;
  email?: string;
}

// Alumno con relación a usuario
export interface Alumno {
  id: number;
  usuarioId: number;
  nombre: string;
  email: string;
  movil?: string;
}

// Rol del sistema (6 roles posibles)
export interface Rol {
  id: number;
  nombre: 'Administrador' | 'Tutor' | 'Profesor' | 'Alumno' | 'Usuario Registrado' | 'Jefe Departamento';
  descripcion?: string;
  permisos?: Permiso[];
}

// Permisos específicos del sistema (20 permisos)
export interface Permiso {
  id: number;
  nombre: string; // crear_modulo, leer_modulo, etc.
  recurso: string; // modulos, alumnos, profesores, matriculas, perfil, dashboard, contenido, sistema
  accion: string; // crear, leer, actualizar, eliminar, administrar
  descripcion?: string;
}

// Respuesta de autenticación
export interface AuthResponse {
  token: string;
  usuario: UsuarioAutenticado;
}

// Usuario autenticado con toda su información
export interface UsuarioAutenticado {
  id: number;
  usuario: string;
  email: string;
  activo: boolean;
  roles: Rol[];
  permisos?: string[]; // Nombres de permisos
  profesor?: Profesor;
  alumno?: Alumno;
  token?: string;
}
