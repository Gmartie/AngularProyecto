import { Component, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AuthService } from './services/auth.service';
import { BackgroundService } from './services/background.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend';
  mostrarHelpy = signal(true);
  mostrarMensaje = signal(true); // Por defecto muestra el mensaje
  
  constructor(
    private router: Router,
    private authService: AuthService,
    private backgroundService: BackgroundService // Inyectar el servicio de fondo
  ) {
    // Verificar ruta inicial
    this.verificarRuta(this.router.url);

    // Escuchar cambios de ruta
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.verificarRuta(event.url);
      });

    // Escuchar cambios en el estado de autenticación
    this.authService.usuario$.subscribe(usuario => {
      // Si hay usuario logueado, ocultar el mensaje
      this.mostrarMensaje.set(!usuario);
    });

    // El BackgroundService se inicializa automáticamente
    // y gestiona los cambios de fondo
  }

  private verificarRuta(url: string): void {
    // Ocultar Helpy en home, home2, login, registro y rutas sin componente (como /mantenimiento)
    const ocultarEn = ['/', '/home', '/home2', '/login', '/registro'];
    
    // Verificar si es una de las rutas específicas donde ocultar Helpy
    const esRutaOculta = ocultarEn.some(ruta => 
      url === ruta || url.startsWith(ruta + '?') || url.startsWith(ruta + '#')
    );

    // También ocultar en rutas que no existen (para evitar superposición)
    // Esto cubre el caso de /mantenimiento que no tiene componente
    const rutasValidas = [
      '/', '/home', '/home2', '/login', '/registro', '/dashboard',
      '/admin', '/animatronicos', '/locales', '/tipos', '/perfil', '/usuario'
    ];
    
    const esRutaValida = rutasValidas.some(ruta => 
      url === ruta || url.startsWith(ruta + '?') || url.startsWith(ruta + '#')
    );

    // Ocultar Helpy si es una ruta donde debe ocultarse O si la ruta no es válida
    this.mostrarHelpy.set(!(esRutaOculta || !esRutaValida));
  }
}
