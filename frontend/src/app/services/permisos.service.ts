/**
 * SERVICIO: PermisosService
 * 
 * Gestiona los permisos de usuario según su id_rol
 * Centraliza la lógica de permisos para ser usada en todos los componentes
 * 
 * ROLES:
 * 1 - Propietario: Editar local, VER animatronicos, CRUD tipos
 * 2 - Técnico: Ver local, CRUD tipos, CRUD animatrónicos
 * 3 - Guardia de seguridad: Solo VER locales y animatrónicos
 * 4 - Empleado: Solo VER locales y animatrónicos
 * 5 - Cocinero: Solo VER locales y animatrónicos
 * 6 - Administrador Master: CRUD COMPLETO en TODO (locales, animatrónicos, tipos) + Panel admin
 */

import { Injectable } from '@angular/core';
import { AuthService, UsuarioAutenticado } from './auth.service';

export interface Permisos {
  ver: boolean;
  crear: boolean;
  editar: boolean;
  eliminar: boolean;
}

export interface TodosLosPermisos {
  animatronicos: Permisos;
  locales: Permisos;
  tipos: Permisos;
}

@Injectable({
  providedIn: 'root'
})

export class PermisosService {

  constructor(private authService: AuthService) {}

  /**
   * Obtiene todos los permisos del usuario actual
   */
  obtenerPermisos(): TodosLosPermisos {
    const usuario = this.authService.obtenerUsuario();
    const idRol = usuario?.id_rol || 0;

    return {
      animatronicos: this.getPermisosAnimatronicos(idRol),
      locales: this.getPermisosLocales(idRol),
      tipos: this.getPermisosTipos(idRol)
    };
  }

  /**
   * Permisos específicos para ANIMATRÓNICOS
   * - Propietario (1): Solo VER
   * - Técnico (2): CRUD completo
   * - Guardia/Empleado/Cocinero (3,4,5): Solo VER
   * - Administrador (6): CRUD completo
   */
  private getPermisosAnimatronicos(idRol: number): Permisos {
    const puedeVer = [1, 2, 3, 4, 5, 6].includes(idRol);
    const puedeEditar = [2, 6].includes(idRol);

    return {
      ver: puedeVer,
      crear: puedeEditar,
      editar: puedeEditar,
      eliminar: puedeEditar
    };
  }

  /**
   * Permisos específicos para LOCALES
   * - Propietario (1): Ver y Editar
   * - Técnico (2): Solo VER
   * - Guardia/Empleado/Cocinero (3,4,5): Solo VER
   * - Administrador (6): CRUD completo
   */
  private getPermisosLocales(idRol: number): Permisos {
    const puedeVer = [1, 2, 3, 4, 5, 6].includes(idRol);
    const puedeEditar = [1, 6].includes(idRol);
    const puedeCrearEliminar = [6].includes(idRol);

    return {
      ver: puedeVer,
      crear: puedeCrearEliminar,
      editar: puedeEditar,
      eliminar: puedeCrearEliminar
    };
  }

  /**
   * Permisos específicos para TIPOS
   * - Propietario (1): CRUD completo
   * - Técnico (2): CRUD completo
   * - Administrador (6): CRUD completo
   */
  private getPermisosTipos(idRol: number): Permisos {
    const puedeGestionar = [1, 2, 6].includes(idRol);

    return {
      ver: puedeGestionar,
      crear: puedeGestionar,
      editar: puedeGestionar,
      eliminar: puedeGestionar
    };
  }

  /**
   * Métodos auxiliares para verificar permisos específicos
   */
  
  puedeVerAnimatronicos(): boolean {
    return this.obtenerPermisos().animatronicos.ver;
  }

  puedeEditarAnimatronicos(): boolean {
    return this.obtenerPermisos().animatronicos.editar;
  }

  puedeCrearAnimatronicos(): boolean {
    return this.obtenerPermisos().animatronicos.crear;
  }

  puedeEliminarAnimatronicos(): boolean {
    return this.obtenerPermisos().animatronicos.eliminar;
  }

  puedeVerLocales(): boolean {
    return this.obtenerPermisos().locales.ver;
  }

  puedeEditarLocales(): boolean {
    return this.obtenerPermisos().locales.editar;
  }

  puedeVerTipos(): boolean {
    return this.obtenerPermisos().tipos.ver;
  }

  puedeEditarTipos(): boolean {
    return this.obtenerPermisos().tipos.editar;
  }

  puedeCrearTipos(): boolean {
    return this.obtenerPermisos().tipos.crear;
  }

  puedeEliminarTipos(): boolean {
    return this.obtenerPermisos().tipos.eliminar;
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  tieneRol(idRol: number): boolean {
    const usuario = this.authService.obtenerUsuario();
    return usuario?.id_rol === idRol;
  }

  /**
   * Obtiene el nombre del rol actual
   */
  obtenerNombreRol(): string {
    const usuario = this.authService.obtenerUsuario();
    const idRol = usuario?.id_rol || 0;

    const roles: { [key: number]: string } = {
      1: 'Propietario',
      2: 'Técnico',
      3: 'Guardia de Seguridad',
      4: 'Empleado',
      5: 'Cocinero',
      6: 'Administrador'
    };

    return roles[idRol] || 'Sin rol';
  }
}