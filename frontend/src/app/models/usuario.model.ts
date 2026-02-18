

export interface Usuario {
  id: number;
  usuario: string;
  pass: string;
  correo: string;
  id_rol: number;

  rol?: {
    id: number;
    rol: string;
  };
}
