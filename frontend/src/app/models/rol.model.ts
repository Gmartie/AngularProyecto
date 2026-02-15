/**
 * MODELO: Rol
 * Define los roles del sistema
 */

export interface Rol {
  id: number;
  rol: string;

  usuarios?: {
    id: number;
    usuario: string;
    correo: string;
  }[];
}
