/**
 * MODELO: Usuario
 *
 * Define la estructura de los usuarios del sistema
 */

export interface Usuario {
  id: number;
  usuario: string;
  pass: string;
  correo: string;
  id_rol: number;

  // Datos relacionados (opcional)
  rol?: {
    id: number;
    rol: string;
  };
}
