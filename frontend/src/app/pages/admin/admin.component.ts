/**
* COMPONENTE: AdminComponent
* Panel de Administración - Solo accesible para rol 6 (Administrador)
*/
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { AuthService, UsuarioAutenticado } from '../../services/auth.service';
import { WindowService, Window } from '../../services/window.service';
import { UsuarioService } from '../../services/usuario.service';
import { RolesService } from '../../services/roles.service';
import { TaskbarComponent } from '../../components/taskbar/taskbar.component';
interface SeccionAdmin {
id: string;
titulo: string;
icono: string;
descripcion: string;
ruta: string;
estadisticas?: {
label: string;
valor: string | number;
};
}
@Component({
selector: 'app-admin',
standalone: true,
imports: [CommonModule, TaskbarComponent],
templateUrl: './admin.component.html',
styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, OnDestroy {
usuario: UsuarioAutenticado | null = null;
ventanasAbiertas$!: Observable<Window[]>; isMinimized: boolean = false;
isMaximized: boolean = false;
private windowSubscription?: Subscription;
secciones: SeccionAdmin[] = [
{
id: 'usuarios',
titulo: 'Gestión de Usuarios',
icono: '/Icons/profile_icon.png',
descripcion: 'Administrar usuarios del sistema',
ruta: '/usuario',
estadisticas: {
label: 'Total usuarios',
valor: 20
}
},
{
id: 'roles',
titulo: 'Gestión de Roles',
icono: '/Icons/springlock_icon.png',
descripcion: 'Configurar roles y permisos',
ruta: '/roles',
estadisticas: {
label: 'Roles activos',
valor: 6
}
},
{
id: 'animatronicos',
titulo: 'Todos los Animatrónicos',
icono: '/Icons/freddy_icon.png',
descripcion: 'Ver todos los animatrónicos del sistema',
ruta: '/animatronicos',
estadisticas: {
label: 'Total animatrónicos',
valor: 18
}
},
{
id: 'locales',
titulo: 'Todos los Locales',
icono: '/Icons/restaurant_icon.png',
descripcion: 'Gestionar todos los locales',
ruta: '/locales',
estadisticas: {
label: 'Locales registrados',
valor: 4
}
},
{
id: 'tipos',
titulo: 'Tipos de Animatrónicos',
icono: '/Icons/files_icon.png',
descripcion: 'Administrar tipos y gamas',
ruta: '/tipos',
estadisticas: {
label: 'Tipos registrados',
valor: 4
}
},
{
id: 'animatronico-local',
titulo: 'Asignación de Animatrónicos',
icono: '/Icons/delivery_box.png',
descripcion: 'Gestionar asignaciones de animatrónicos a locales',
ruta: '/animatronico-local',
estadisticas: {
label: 'Asignaciones activas',
valor: 18
}
}
];
constructor(
private readonly authService: AuthService,
private readonly windowService: WindowService,
private readonly router: Router,
private readonly usuarioService: UsuarioService,
private readonly rolesService: RolesService
) {}
ngOnInit(): void {
this.ventanasAbiertas$ = this.windowService.windows$;
this.windowSubscription = this.windowService.windows$.subscribe(windows => {
const adminWindow = windows.find(w => w.id === 'admin');
if (adminWindow) {
this.isMinimized = adminWindow.isMinimized;
this.isMaximized = adminWindow.isMaximized;
}
});
this.authService.usuario$.subscribe(usuario => {
this.usuario = usuario;
if (usuario && !this.esAdministrador()) {
this.router.navigate(['/home2']);
}
if (usuario && this.esAdministrador()) {
this.cargarEstadisticas();
}
});
}
ngOnDestroy(): void {
if (this.windowSubscription) {
this.windowSubscription.unsubscribe();
}
}
cargarEstadisticas(): void {
this.usuarioService.obtenerTodos().subscribe({
next: (usuarios) => {
const s = this.secciones.find(s => s.id === 'usuarios');
if (s?.estadisticas) s.estadisticas.valor = usuarios.length;
},
error: () => {}
});
this.rolesService.obtenerTodos().subscribe({
next: (roles) => {
const s = this.secciones.find(s => s.id === 'roles');
if (s?.estadisticas) s.estadisticas.valor = roles.length;
},
error: () => {}
});
}
esAdministrador(): boolean {
if (!this.usuario) return false;
if (this.usuario.roles && this.usuario.roles.length > 0) {
return this.usuario.roles.some(r => r.nombre === 'Administrador' || r.id === 6);
}
return this.usuario.id_rol === 6;
}
navegarSeccion(seccion: SeccionAdmin): void {
if (seccion.ruta === '#') {
alert(`La sección "${seccion.titulo}" estará disponible próximamente.`);
return;
}
this.router.navigate([seccion.ruta]);
}
nombreRol(): string {
if (!this.usuario) return 'Sin rol';
if (this.usuario.roles && this.usuario.roles.length > 0) {
return this.usuario.roles[0].nombre;
}
const mapaRoles: { [key: number]: string } = {
1: 'Propietario',
2: 'Técnico',
3: 'Guardia de seguridad',
4: 'Empleado',
5: 'Cocinero',
6: 'Administrador'
};
return mapaRoles[this.usuario.id_rol] || 'Desconocido';
}
cerrarVentana(): void {
this.windowService.closeWindow('admin');
this.router.navigate(['/home2']);
}
minimizarVentana(): void {
this.windowService.minimizeWindow('admin');
this.router.navigate(['/home2']);
}
toggleMaximizar(): void {
this.windowService.toggleMaximize('admin');
}
restaurarVentana(windowId: string): void {
this.windowService.restoreWindow(windowId);
const window = this.windowService.getWindow(windowId);
if (window?.route) {
this.router.navigate([window.route]);
}
}
cerrarSesion(): void {
this.windowService.closeAllWindows();
this.authService.logout();
this.router.navigate(['/home']);
}
obtenerIconoRol(): string {
const mapaRoles: { [key: number]: string } = {
1: "/FNAF_Rol_Icons/owner_icon.png",
2: "/FNAF_Rol_Icons/tech_icon.png",
3: "/FNAF_Rol_Icons/guard_icon.png",
4: "/FNAF_Rol_Icons/employee_icon.png",
5: "/FNAF_Rol_Icons/chef_icon.png",
6: "/FNAF_Rol_Icons/admin_icon.png"
};
const idRol = this.usuario?.id_rol ?? 0;
return mapaRoles[idRol] || "/FNAF_Rol_Icons/employee_icon.png";
}
getHoraActual(): string {
const ahora = new Date();
return ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}
}