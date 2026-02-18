
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
obtenerPermisos(): TodosLosPermisos {
const usuario = this.authService.obtenerUsuario();
const idRol = usuario?.id_rol || 0;
return {
animatronicos: this.getPermisosAnimatronicos(idRol),
locales: this.getPermisosLocales(idRol),
tipos: this.getPermisosTipos(idRol)
};
}
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
private getPermisosTipos(idRol: number): Permisos {
// 6 - Administrador: CRUD completo
// 1 - Propietario: ver + editar (sin crear ni eliminar)
// 2 - Técnico: solo ver
// 3,4,5: solo ver
return {
ver: [1, 2, 3, 4, 5, 6].includes(idRol),
crear: [6].includes(idRol),
editar: [1, 6].includes(idRol),
eliminar: [6].includes(idRol)
};
}
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
tieneRol(idRol: number): boolean {
const usuario = this.authService.obtenerUsuario();
return usuario?.id_rol === idRol;
}
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