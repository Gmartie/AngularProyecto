import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WindowService } from '../../services/window.service';
import { AuthService, UsuarioAutenticado } from '../../services/auth.service';
import { TiposAnimatronicosService } from '../../services/tiposanimatronicos.service';
import { LocalesService } from '../../services/locales.service';
import { PermisosService } from '../../services/permisos.service';
import { TipoAnimatronico } from '../../models/tiposanimatronicos.model';
import { Local } from '../../models/local.model';
import { Subscription, Observable } from 'rxjs';
import { Window } from '../../services/window.service';

@Component({
  selector: 'app-tipos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tipos.component.html',
  styleUrls: ['./tipos.component.css']
})
export class TiposComponent implements OnInit, OnDestroy {

  tipos: TipoAnimatronico[] = [];
  locales: Local[] = [];
  tipoEditando: TipoAnimatronico | null = null;
  mostrarFormularioNuevo: boolean = false;
  mostrarFormularioEditar: boolean = false;

  puedeEditar:   boolean = false;
  puedeCrear:    boolean = false;
  puedeEliminar: boolean = false;
  esAdmin:       boolean = false;

  isMinimized: boolean = false;
  isMaximized: boolean = false;
  private windowSubscription?: Subscription;

  usuario: UsuarioAutenticado | null = null;
  ventanasAbiertas$!: Observable<Window[]>;

  nuevoTipo: Partial<TipoAnimatronico> = { nombre: '' };

  iconoNuevoFile:    File | null   = null;
  iconoNuevoPreview: string | null = null;
  iconoEditFile:     File | null   = null;
  iconoEditPreview:  string | null = null;

  // Diagnóstico visible
  debugInfo:  string  = '';
  errorCarga: string  = '';
  cargando:   boolean = false;

  constructor(
    private windowService: WindowService,
    private router: Router,
    private authService: AuthService,
    private tiposService: TiposAnimatronicosService,
    private localesService: LocalesService,
    public  permisosService: PermisosService
  ) {}

  ngOnInit(): void {
    this.ventanasAbiertas$ = this.windowService.windows$;

    this.authService.usuario$.subscribe(usuario => {
      this.usuario = usuario;
      if (usuario) {
        this.esAdmin       = usuario.id_rol === 6;
        this.puedeEditar   = this.permisosService.puedeEditarTipos();
        this.puedeCrear    = this.permisosService.puedeCrearTipos();
        this.puedeEliminar = this.permisosService.puedeEliminarTipos();
        this.cargarLocales();
        this.cargarTipos(usuario);
      }
    });

    this.windowSubscription = this.windowService.windows$.subscribe(windows => {
      const w = windows.find(w => w.id === 'tipos');
      if (w) { this.isMinimized = w.isMinimized; this.isMaximized = w.isMaximized; }
    });
  }

  ngOnDestroy(): void { this.windowSubscription?.unsubscribe(); }

  cargarLocales(): void {
    this.localesService.obtenerTodos().subscribe({
      next: (l) => { this.locales = l; },
      error: () => { this.locales = []; }
    });
  }

  cargarTipos(usuario: UsuarioAutenticado = this.usuario!): void {
    // Admin ve todos; el resto solo los tipos con animatrónicos en su local
    const idLocal = (usuario.id_rol === 6) ? undefined : (usuario.id_local ?? undefined);
    const urlInfo = idLocal !== undefined
      ? `filtrando por local ${idLocal}`
      : `mostrando todos (admin)`;

    this.debugInfo  = `${usuario.usuario} | rol=${usuario.id_rol} | local=${usuario.id_local} | ${urlInfo}`;
    this.errorCarga = '';
    this.cargando   = true;

    this.tiposService.obtenerTodos(idLocal).subscribe({
      next: (tipos) => {
        this.cargando = false;
        this.tipos    = tipos;
        this.debugInfo += ` | ✅ ${tipos.length} tipos`;
      },
      error: (err) => {
        this.cargando   = false;
        this.tipos      = [];
        this.errorCarga = `HTTP ${err?.status}: ${err?.error?.message || err?.message}`;
      }
    });
  }

  private readonly backendUrl = 'http://localhost:3000';

  obtenerIcono(tipo: TipoAnimatronico): string {
    if (tipo.icono) {
      // Iconos subidos al backend → servidos por Express en puerto 3000
      return `${this.backendUrl}${tipo.icono}`;
    }
    // Iconos estáticos del frontend → Angular en puerto 4200
    const n = tipo.nombre.toLowerCase();
    if (n.includes('unwithered') || n.includes('withered')) return '/Icons/w_freddy_icon.png';
    if (n.includes('toy'))     return '/Icons/t_freddy_icon.png';
    if (n.includes('funtime')) return '/Icons/f_freddy_icon.png';
    return '/Icons/freddy_icon.png';
  }

  // ── NUEVO ────────────────────────────────────────

  abrirFormularioNuevo(): void {
    if (!this.puedeCrear) { alert('Sin permisos.'); return; }
    this.nuevoTipo         = { nombre: '' };
    this.iconoNuevoFile    = null;
    this.iconoNuevoPreview = null;
    this.mostrarFormularioNuevo = true;
  }

  cerrarFormularioNuevo(): void {
    this.mostrarFormularioNuevo = false;
    this.iconoNuevoFile    = null;
    this.iconoNuevoPreview = null;
  }

  onIconoNuevoSeleccionado(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Máximo 5MB.'); return; }
    this.iconoNuevoFile = file;
    const reader = new FileReader();
    reader.onload = (e) => { this.iconoNuevoPreview = e.target?.result as string; };
    reader.readAsDataURL(file);
  }

  quitarIconoNuevo(): void { this.iconoNuevoFile = null; this.iconoNuevoPreview = null; }

  guardarNuevo(): void {
    if (!this.nuevoTipo.nombre?.trim()) { alert('El nombre es obligatorio'); return; }

    this.tiposService.crear(this.nuevoTipo as TipoAnimatronico, this.iconoNuevoFile || undefined).subscribe({
      next: () => { this.cargarTipos(); this.cerrarFormularioNuevo(); },
      error: (err) => {
        const msg = err?.error?.errors?.map((e: any) => e.msg).join(', ')
                 || err?.error?.message || err.message;
        alert('Error al guardar: ' + msg);
      }
    });
  }

  // ── EDITAR ───────────────────────────────────────

  abrirFormularioEditar(tipo: TipoAnimatronico): void {
    if (!this.puedeEditar) { alert('Sin permisos.'); return; }
    this.tipoEditando     = { ...tipo };
    this.iconoEditFile    = null;
    this.iconoEditPreview = tipo.icono || null;
    this.mostrarFormularioEditar = true;
  }

  cerrarFormularioEditar(): void {
    this.mostrarFormularioEditar = false;
    this.tipoEditando     = null;
    this.iconoEditFile    = null;
    this.iconoEditPreview = null;
  }

  onIconoEditSeleccionado(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Máximo 5MB.'); return; }
    this.iconoEditFile = file;
    const reader = new FileReader();
    reader.onload = (e) => { this.iconoEditPreview = e.target?.result as string; };
    reader.readAsDataURL(file);
  }

  quitarIconoEdit(): void {
    this.iconoEditFile    = null;
    this.iconoEditPreview = this.tipoEditando?.icono || null;
  }

  actualizarTipo(): void {
    if (!this.tipoEditando?.id)     return;
    if (!this.tipoEditando.nombre?.trim()) { alert('El nombre es obligatorio'); return; }

    this.tiposService.actualizar(this.tipoEditando.id, this.tipoEditando, this.iconoEditFile || undefined).subscribe({
      next: () => { this.cargarTipos(); this.cerrarFormularioEditar(); },
      error: (err) => alert('Error al actualizar: ' + (err?.error?.message || err.message))
    });
  }

  eliminarTipo(): void {
    if (!this.tipoEditando?.id)  return;
    if (!this.puedeEliminar)    { alert('Sin permisos.'); return; }
    if (!confirm(`¿Eliminar "${this.tipoEditando.nombre}"?`)) return;

    this.tiposService.eliminar(this.tipoEditando.id).subscribe({
      next: () => { this.cargarTipos(); this.cerrarFormularioEditar(); },
      error: () => alert('Error al eliminar.')
    });
  }

  // ── VENTANA ──────────────────────────────────────

  cerrarVentana():    void { this.windowService.closeWindow('tipos');    this.router.navigate(['/home2']); }
  minimizarVentana(): void { this.windowService.minimizeWindow('tipos'); this.router.navigate(['/home2']); }
  toggleMaximizar():  void { this.windowService.toggleMaximize('tipos'); }

  restaurarVentana(windowId: string): void {
    this.windowService.restoreWindow(windowId);
    const w = this.windowService.getWindow(windowId);
    if (w?.route) this.router.navigate([w.route]);
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
    return new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }
}