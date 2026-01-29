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

  // Datos relacionados (opcional)
  gama?: {
    id: number;
    nombre: string;
    id_local: number;
  };
}
