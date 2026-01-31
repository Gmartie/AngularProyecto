import { Component, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AuthService } from './services/auth.service';
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
    private authService: AuthService
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
  }

  private verificarRuta(url: string): void {
    // Ocultar Helpy en home, login y registro
    const ocultarEn = ['/', '/home', '/login', '/registro'];
    this.mostrarHelpy.set(!ocultarEn.some(ruta => 
      url === ruta || url.startsWith(ruta + '?') || url.startsWith(ruta + '#')
    ));
  }
}