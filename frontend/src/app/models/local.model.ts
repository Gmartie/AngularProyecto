/**
 * MODELO: Local
 *
 * Define un local de Fazbear Entertainment
 */

export interface Local {
  id: number;
  fecha_apertura: Date;
  aforo: number;
  foto: string;
  ciudad: string;
  direccion: string;
  abierto: boolean;

  // Datos relacionados (opcional)
  tipos_animatronicos?: {
    id: number;
    nombre: string;
  }[];
}
