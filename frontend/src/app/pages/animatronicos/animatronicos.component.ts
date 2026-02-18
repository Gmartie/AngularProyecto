
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WindowService } from '../../services/window.service';
import { AuthService, UsuarioAutenticado } from '../../services/auth.service';
import { AnimatronicosService } from '../../services/animatronicos.service';import { PermisosService } from '../../services/permisos.service';
import { Subscription, Observable } from 'rxjs';
import { Window } from '../../services/window.service';
import { TaskbarComponent } from '../../components/taskbar/taskbar.component';
interface Animatronico {
id?: number;
nombre: string;
reconocimiento: boolean;
num_piezas: number;
id_gama: number;
nombre_gama?: string;
planos: string;
foto: string;
}
interface TipoAnimatronico {
id: number;
nombre: string;
}
@Component({
selector: 'app-animatronicos',
standalone: true,
imports: [CommonModule, FormsModule, TaskbarComponent],
templateUrl: './animatronicos.component.html',
styleUrls: ['./animatronicos.component.css']
})
export class AnimatronicosComponent implements OnInit, OnDestroy {
animatronicos: Animatronico[] = [];
tiposAnimatronicos: TipoAnimatronico[] = [];
animatronicoEditando: Animatronico | null = null;
mostrarFormularioNuevo: boolean = false;
mostrarFormularioEditar: boolean = false; fotoNuevoFile: File | null = null;
planosNuevoFile: File | null = null;
fotoEditFile: File | null = null;
planosEditFile: File | null = null; puedeEditar: boolean = false;
puedeCrear: boolean = false;
puedeEliminar: boolean = false;
soloLectura: boolean = false;
esAdmin: boolean = false; isMinimized: boolean = false;
isMaximized: boolean = false;
private windowSubscription?: Subscription; usuario: UsuarioAutenticado | null = null;
ventanasAbiertas$!: Observable<Window[]>;
nuevoAnimatronico: Animatronico = {
nombre: '',
reconocimiento: true,
num_piezas: 0,
id_gama: 1,
planos: '',
foto: ''
};
constructor(
private windowService: WindowService,
private router: Router,
private authService: AuthService,
private animatronicosService: AnimatronicosService,
public permisosService: PermisosService
) {}
ngOnInit(): void {
this.ventanasAbiertas$ = this.windowService.windows$;
this.authService.usuario$.subscribe(usuario => {
this.usuario = usuario;
if (usuario) {
this.configurarPermisos();
this.cargarTiposAnimatronicos();
this.cargarAnimatronicos();
}
});
this.windowSubscription = this.windowService.windows$.subscribe(windows => {
const thisWindow = windows.find(w => w.id === 'animatronicos');
if (thisWindow) {
this.isMinimized = thisWindow.isMinimized;
this.isMaximized = thisWindow.isMaximized;
}
});
}
ngOnDestroy(): void {
if (this.windowSubscription) {
this.windowSubscription.unsubscribe();
}
}
private configurarPermisos(): void {
this.puedeEditar = this.permisosService.puedeEditarAnimatronicos();
this.puedeCrear = this.permisosService.puedeCrearAnimatronicos();
this.puedeEliminar = this.permisosService.puedeEliminarAnimatronicos();
// Si no puede editar ni crear ni eliminar, está en modo solo lectura
this.soloLectura = !this.puedeEditar && !this.puedeCrear && !this.puedeEliminar;
this.esAdmin = this.usuario?.id_rol === 6;
console.log('Permisos configurados:', {
puedeEditar: this.puedeEditar,
puedeCrear: this.puedeCrear,
puedeEliminar: this.puedeEliminar,
soloLectura: this.soloLectura,
rol: this.permisosService.obtenerNombreRol()
});
}
cargarTiposAnimatronicos(): void {
this.animatronicosService.obtenerTipos().subscribe({
next: (tipos) => {
this.tiposAnimatronicos = tipos;
},
error: (error) => {
this.tiposAnimatronicos = [];
}
});
}
cargarAnimatronicos(): void {
this.animatronicosService.obtenerTodos().subscribe({
next: (animatronicos) => {
this.animatronicos = animatronicos;
},
error: (error) => {
this.animatronicos = [];
}
});
}
abrirFormularioNuevo(): void {
if (!this.puedeCrear) {
alert('No tienes permisos para crear nuevos animatrónicos.');
return;
}
this.mostrarFormularioNuevo = true;
this.nuevoAnimatronico = {
nombre: '',
reconocimiento: true,
num_piezas: 0,
id_gama: this.tiposAnimatronicos.length > 0 ? this.tiposAnimatronicos[0].id : 1,
planos: '',
foto: ''
};
}
cerrarFormularioNuevo(): void {
this.mostrarFormularioNuevo = false;
}
guardarNuevo(): void {
if (!this.nuevoAnimatronico.nombre || this.nuevoAnimatronico.num_piezas <= 0) {
alert('Por favor completa todos los campos obligatorios');
return;
}
const formData = new FormData();
formData.append('nombre', this.nuevoAnimatronico.nombre);
formData.append('reconocimiento', this.nuevoAnimatronico.reconocimiento.toString());
formData.append('num_piezas', this.nuevoAnimatronico.num_piezas.toString());
if (this.fotoNuevoFile) {
formData.append('foto', this.fotoNuevoFile);
}
if (this.planosNuevoFile) {
formData.append('planos', this.planosNuevoFile);
}
this.animatronicosService.crearConArchivos(formData).subscribe({
next: (response) => {
this.cargarAnimatronicos();
this.cerrarFormularioNuevo();
this.fotoNuevoFile = null;
this.planosNuevoFile = null;
},
error: (error) => {
alert('Error al guardar el animatrónico. Verifica la conexión con el servidor.');
}
});
}
abrirFormularioEditar(animatronico: Animatronico): void {
if (!this.puedeEditar) {
alert('No tienes permisos para editar animatrónicos.');
return;
}
this.animatronicoEditando = {...animatronico};
this.mostrarFormularioEditar = true;
}
cerrarFormularioEditar(): void {
this.mostrarFormularioEditar = false;
this.animatronicoEditando = null;
}
actualizarAnimatronico(): void {
if (!this.animatronicoEditando) return;
if (!this.animatronicoEditando.nombre || this.animatronicoEditando.num_piezas <= 0) {
alert('Por favor completa todos los campos obligatorios');
return;
}
const formData = new FormData();
formData.append('nombre', this.animatronicoEditando.nombre);
formData.append('reconocimiento', this.animatronicoEditando.reconocimiento.toString());
formData.append('num_piezas', this.animatronicoEditando.num_piezas.toString());
if (this.fotoEditFile) {
formData.append('foto', this.fotoEditFile);
} else if (this.animatronicoEditando.foto) {
formData.append('foto', this.animatronicoEditando.foto);
}
if (this.planosEditFile) {
formData.append('planos', this.planosEditFile);
} else if (this.animatronicoEditando.planos) {
formData.append('planos', this.animatronicoEditando.planos);
}
this.animatronicosService.actualizarConArchivos(this.animatronicoEditando.id!, formData).subscribe({
next: (response) => {
this.cargarAnimatronicos();
this.cerrarFormularioEditar();
this.fotoEditFile = null;
this.planosEditFile = null;
},
error: (error) => {
alert('Error al actualizar el animatrónico. Verifica la conexión con el servidor.');
}
});
}
eliminarAnimatronico(): void {
if (!this.animatronicoEditando) return;
if (!this.puedeEliminar) {
alert('No tienes permisos para eliminar animatrónicos.');
return;
}
if (!confirm(`¿Estás seguro de que deseas eliminar a ${this.animatronicoEditando.nombre}?`)) {
return;
}
if (this.animatronicoEditando.id) {
this.animatronicosService.eliminar(this.animatronicoEditando.id).subscribe({
next: (response) => {
this.cargarAnimatronicos();
this.cerrarFormularioEditar();
},
error: (error) => {
alert('Error al eliminar el animatrónico. Verifica la conexión con el servidor.');
}
});
}
}
obtenerNombreGama(id_gama: number): string {
return this.tiposAnimatronicos.find(t => t.id === id_gama)?.nombre || 'Desconocido';
}
descargarInforme(animatronico: Animatronico): void {
const token = this.authService.obtenerToken();
const id = animatronico.id;
fetch(`http://localhost:3000/api/animatronicos/${id}/informe`, {
headers: { Authorization: `Bearer ${token}` }
})
.then(r => r.json())
.then(resp => {
const data = resp.data || resp;
this.generarPDF(data);
})
.catch(() => alert('Error al obtener los datos del informe'));
}
private generarPDF(data: any): void {
const script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
script.onload = () => {
const { jsPDF } = (window as any).jspdf;
const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
const W = 210;
const margen = 20;
let y = 0;
doc.setFillColor(0, 0, 128); // Azul Windows 95
doc.rect(0, 0, W, 36, 'F');
doc.setTextColor(255, 255, 255);
doc.setFontSize(18);
doc.setFont('helvetica', 'bold');
doc.text('FAZBEAR ENTERTAINMENT', margen, 14);
doc.setFontSize(11);
doc.setFont('helvetica', 'normal');
doc.text('Informe Técnico de Animatrónico', margen, 22);
doc.setFontSize(9);
doc.text(`Generado: ${new Date().toLocaleDateString('es-ES', { day:'2-digit', month:'long', year:'numeric' })}`, margen, 30);
y = 48;
doc.setTextColor(0, 0, 128);
doc.setFontSize(16);
doc.setFont('helvetica', 'bold');
doc.text(data.nombre || '—', margen, y);
y += 4;
doc.setDrawColor(0, 0, 128);
doc.setLineWidth(0.5);
doc.line(margen, y, W - margen, y);
y += 8;
const campos = [
['ID', String(data.id ?? '—')],
['Tipo / Gama', data.nombre_gama || '—'],
['Número de piezas', String(data.num_piezas ?? '—')],
['Reconocimiento facial',data.reconocimiento ? 'Sí' : 'No'],
['Estado actual', data.estado || 'Sin asignar'],
['Local asignado', data.local_ciudad
? `${data.local_ciudad} — ${data.local_direccion}`
: 'Sin local asignado'],
['Fecha de instalación', data.fecha_instalacion
? new Date(data.fecha_instalacion).toLocaleDateString('es-ES')
: '—'],
['Archivo de planos', data.planos || '—'],
];
doc.setFontSize(10);
campos.forEach(([label, valor], i) => {
const bgColor = i % 2 === 0 ? [240, 240, 245] : [255, 255, 255];
doc.setFillColor(...(bgColor as [number,number,number]));
doc.rect(margen, y - 4, W - margen * 2, 9, 'F');
doc.setTextColor(80, 80, 80);
doc.setFont('helvetica', 'bold');
doc.text(label + ':', margen + 2, y + 1);
doc.setTextColor(30, 30, 30);
doc.setFont('helvetica', 'normal');
doc.text(valor, margen + 55, y + 1);
y += 9;
});
y += 6;
const estadoColores: { [k: string]: number[] } = {
'Operativo': [40, 167, 69],
'Fuera de servicio': [220, 53, 69],
'En mantenimiento': [255, 193, 7],
'En reparación': [23, 162, 184],
'Desactivado': [108, 117, 125],
};
const estadoNombre = data.estado || 'Sin asignar';
const color = estadoColores[estadoNombre] || [108, 117, 125];
doc.setFillColor(...(color as [number,number,number]));
doc.roundedRect(margen, y, 60, 10, 2, 2, 'F');
doc.setTextColor(255, 255, 255);
doc.setFontSize(9);
doc.setFont('helvetica', 'bold');
doc.text(`Estado: ${estadoNombre}`, margen + 4, y + 6.5);
y += 20;
doc.setTextColor(0, 0, 128);
doc.setFontSize(11);
doc.setFont('helvetica', 'bold');
doc.text('Notas del sistema', margen, y);
y += 5;
doc.setDrawColor(200, 200, 200);
doc.setLineWidth(0.3);
doc.line(margen, y, W - margen, y);
y += 5;
doc.setTextColor(80, 80, 80);
doc.setFontSize(9);
doc.setFont('helvetica', 'normal');
const notas = [
'Este informe ha sido generado automáticamente por el sistema Fazbear OS v1.87.',
'Los datos reflejan el estado en el momento de la generación.',
data.reconocimiento
? 'Este animatrónico cuenta con sistema de reconocimiento facial activo.'
: 'Este animatrónico NO dispone de reconocimiento facial.',
];
notas.forEach(n => { doc.text(n, margen, y); y += 6; });
const pageH = 297;
doc.setFillColor(220, 220, 220);
doc.rect(0, pageH - 14, W, 14, 'F');
doc.setTextColor(100, 100, 100);
doc.setFontSize(8);
doc.setFont('helvetica', 'normal');
doc.text('© Fazbear Entertainment Inc. — Documento confidencial', margen, pageH - 5);
doc.text(`Ref: ANIMA-${data.id}-${Date.now()}`, W - margen - 50, pageH - 5);
doc.save(`informe_${(data.nombre || 'animatronico').replace(/\s+/g, '_')}.pdf`);
};
if (!document.querySelector('script[src*="jspdf"]')) {
document.head.appendChild(script);
} else {
script.onload?.(new Event('load'));
}
}
obtenerRutaFoto(nombreFoto: string): string {
if (!nombreFoto) return 'http://localhost:3000/FNaF_Profile/freddy_clasico.jpg';
return `http://localhost:3000/FNaF_Profile/${nombreFoto}`;
}
obtenerRutaPlanos(nombrePlanos: string): string {
if (!nombrePlanos) return 'http://localhost:3000/FNAF_Blueprints/freddy_clasico_planos.png';
return `http://localhost:3000/FNAF_Blueprints/${nombrePlanos}`;
}
onImageError(event: Event): void {
const target = event.target as HTMLImageElement;
if (target.src.includes('FNaF_Profile')) {
target.src = 'http://localhost:3000/FNaF_Profile/freddy_clasico.jpg';
} else {
target.src = 'http://localhost:3000/FNAF_Blueprints/freddy_clasico_planos.png';
}
}
onFileSelected(event: any, tipo: 'foto' | 'planos', esNuevo: boolean = true): void {
const file = event.target.files[0];
if (file) {
if (esNuevo) {
if (tipo === 'foto') {
this.nuevoAnimatronico.foto = file.name;
this.fotoNuevoFile = file;
} else {
this.nuevoAnimatronico.planos = file.name;
this.planosNuevoFile = file;
}
} else if (this.animatronicoEditando) {
if (tipo === 'foto') {
this.animatronicoEditando.foto = file.name;
this.fotoEditFile = file;
} else {
this.animatronicoEditando.planos = file.name;
this.planosEditFile = file;
}
}
}
}
cerrarVentana(): void {
this.windowService.closeWindow('animatronicos');
this.router.navigate(['/home2']);
}
minimizarVentana(): void {
this.windowService.minimizeWindow('animatronicos');
this.router.navigate(['/home2']);
}
toggleMaximizar(): void {
this.windowService.toggleMaximize('animatronicos');
}
restaurarVentana(windowId: string): void {
this.windowService.restoreWindow(windowId);
const window = this.windowService.getWindow(windowId);
if (window?.route) {
this.router.navigate([window.route]);
}
}
obtenerIconoRol(): string {
const mapaRoles: { [key: number]: string } = {
1: '/FNAF_Rol_Icons/owner_icon.png',
2: '/FNAF_Rol_Icons/tech_icon.png',
3: '/FNAF_Rol_Icons/guard_icon.png',
4: '/FNAF_Rol_Icons/employee_icon.png',
5: '/FNAF_Rol_Icons/chef_icon.png',
6: '/FNAF_Rol_Icons/admin_icon.png'
};
const idRol = this.usuario?.id_rol ?? 0;
return mapaRoles[idRol] || '/FNAF_Rol_Icons/employee_icon.png';
}
cerrarSesion(): void {
this.windowService.closeAllWindows();
this.authService.logout();
this.router.navigate(['/home']);
}
getHoraActual(): string {
const ahora = new Date();
return ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}
}