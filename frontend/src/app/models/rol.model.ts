/**
 * MODELO: Rol
 *
 * Define los roles del sistema
 */

export interface Rol {
  id: number;
  rol: 'Administrador' | 'Técnico' | 'Empleado' | 'Propietario';

  // Datos relacionados (opcional)
  usuarios?: {
    id: number;
    usuario: string;
    correo: string;
  }[];
}
