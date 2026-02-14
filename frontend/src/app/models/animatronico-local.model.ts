/**
 * MODELO: AnimatronicoLocal
 *
 * Define la estructura de la relación entre animatrónicos y locales
 */

export interface AnimatronicoLocal {
  id_animatronico: number;
  id_local: number;
  fecha_instalacion: string;
  estado: string;
  
  // Datos relacionados (opcionales, vienen del JOIN)
  animatronico_nombre?: string;
  animatronico_foto?: string;
  animatronico_gama?: string;
  local_ciudad?: string;
  local_direccion?: string;
}
