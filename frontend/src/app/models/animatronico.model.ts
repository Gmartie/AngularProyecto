

export interface Animatronico {
  id: number;
  nombre: string;
  reconocimiento: boolean;
  num_piezas: number;
  id_gama: number;
  planos: string;
  foto: string;
  nombre_gama?: string;
  fecha_instalacion?: string;
  estado?: string;
  id_local?: number;

  gama?: {
    id: number;
    nombre: string;
  };
}
