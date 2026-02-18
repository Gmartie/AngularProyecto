

export interface Rol {
  id: number;
  rol: string;

  usuarios?: {
    id: number;
    usuario: string;
    correo: string;
  }[];
}
