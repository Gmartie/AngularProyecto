/**
 * MODELO: TipoAnimatronico
 *
 * Define las gamas o tipos de animatrónicos
 */

export interface TipoAnimatronico {
  id: number;
  nombre: string;
  id_local: number;

  // Datos relacionados (opcional)
  local?: {
    id: number;
    ciudad: string;
    direccion: string;
    abierto: boolean;
  };
}
