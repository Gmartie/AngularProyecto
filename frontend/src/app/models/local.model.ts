
export interface Local {
  id: number;
  fecha_apertura: Date;
  aforo: number;
  foto: string;
  ciudad: string;
  direccion: string;
  abierto: boolean;

  tipos_animatronicos?: {
    id: number;
    nombre: string;
  }[];
}
