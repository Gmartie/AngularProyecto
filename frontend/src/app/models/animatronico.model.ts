/**
 * MODELO: Animatrónico
 *
 * Define la estructura de un animatrónico
 */

export interface Animatronico {
  id: number;
  nombre: string;
  reconocimiento: boolean;
  num_piezas: number;
  id_gama: number;
  planos: string;
  foto: string;
  
  // ⭐ NUEVO: Campos de la tabla intermedia animatronico_local
  nombre_gama?: string;
  fecha_instalacion?: string;
  estado?: string;
  id_local?: number;

  // Datos relacionados (opcional)
  gama?: {
    id: number;
    nombre: string;
  };
}
