import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { WindowService, Window } from '../../services/window.service';
import { AuthService, UsuarioAutenticado } from '../../services/auth.service';

@Component({
  selector: 'app-taskbar',
  standalone: true,
  imports: [CommonModule, AsyncPipe],
  templateUrl: './taskbar.component.html',
  styleUrls: ['./taskbar.component.css']
})
export class TaskbarComponent implements OnInit, OnDestroy {

  /** ID de la ventana activa en esta página (ej: 'animatronicos', 'locales'…) */
  @Input() windowId: string = '';

  ventanasAbiertas$!: Observable<Window[]>;
  usuario: UsuarioAutenticado | null = null;
  horaActual: string = '';

  private intervaloHora: any;

  constructor(
    private windowService: WindowService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.ventanasAbiertas$ = this.windowService.windows$;
    this.usuario = this.authService.obtenerUsuario();
    this.actualizarHora();
    this.intervaloHora = setInterval(() => this.actualizarHora(), 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.intervaloHora);
  }

  private actualizarHora(): void {
    this.horaActual = new Date().toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  restaurarVentana(windowId: string): void {
    this.windowService.restoreWindow(windowId);
    const win = this.windowService.getWindow(windowId);
    if (win?.route) {
      this.router.navigate([win.route]);
    }
  }

  cerrarSesion(): void {
    this.windowService.closeAllWindows();
    this.authService.logout();
    this.router.navigate(['/home']);
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
}
