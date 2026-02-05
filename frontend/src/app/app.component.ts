import { Component, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AuthService } from './services/auth.service';
import { BackgroundService } from './services/background.service';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend';
  mostrarHelpy = signal(true);
  mostrarMensaje = signal(true);
  private rutaActual = '';
  
  constructor(
    private router: Router,
    private authService: AuthService,
    private backgroundService: BackgroundService
  ) {
    // Verificar ruta inicial
    this.verificarRuta(this.router.url);

    // Escuchar cambios de ruta
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.rutaActual = event.url;
        this.verificarRuta(event.url);
      });

    // Escuchar cambios en el estado de autenticación
    this.authService.usuario$.subscribe(usuario => {
      this.mostrarMensaje.set(!usuario);
    });
  }

  private verificarRuta(url: string): void {
    // Ocultar Helpy en home, home2, login, registro y rutas de programas
    const ocultarEn = ['/', '/home', '/home2', '/login', '/registro', 
                       '/animatronicos', '/locales', '/tipos', '/perfil', 
                       '/admin', '/usuario'];
    
    const esRutaOculta = ocultarEn.some(ruta => 
      url === ruta || url.startsWith(ruta + '?') || url.startsWith(ruta + '#')
    );

    // También ocultar en rutas que no existen
    const rutasValidas = [
      '/', '/home', '/home2', '/login', '/registro', '/dashboard',
      '/admin', '/animatronicos', '/locales', '/tipos', '/perfil', '/usuario'
    ];
    
    const esRutaValida = rutasValidas.some(ruta => 
      url === ruta || url.startsWith(ruta + '?') || url.startsWith(ruta + '#')
    );

    this.mostrarHelpy.set(!(esRutaOculta || !esRutaValida));
  }

  /**
   * Determina si se debe mostrar el navbar
   * NO se muestra en: home2 ni en rutas de programas (animatronicos, locales, etc)
   */
  mostrarNavbar(): boolean {
    const rutasSinNavbar = ['/home2', '/animatronicos', '/locales', '/tipos', 
                            '/perfil', '/admin', '/usuario'];
    
    return !rutasSinNavbar.some(ruta => 
      this.rutaActual === ruta || 
      this.rutaActual.startsWith(ruta + '?') || 
      this.rutaActual.startsWith(ruta + '#')
    );
  }
}
