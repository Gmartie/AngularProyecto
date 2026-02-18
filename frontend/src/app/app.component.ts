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
        this.verificarRuta(this.router.url);
        this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe((event: any) => {
                this.rutaActual = event.url;
                this.verificarRuta(event.url);
            });
        this.authService.usuario$.subscribe(usuario => {
            this.mostrarMensaje.set(!usuario);
        });
    }
    private verificarRuta(url: string): void {
        const ocultarEn = ['/', '/home', '/home2', '/login', '/registro', '/animatronicos', '/locales', '/tipos', '/perfil', '/admin', '/usuario', '/roles', '/animatronico-local'];
        const esRutaOculta = ocultarEn.some(ruta => url === ruta || url.startsWith(ruta + '?') || url.startsWith(ruta + '#')
        );
        const rutasValidas = [
            '/', '/home', '/home2', '/login', '/registro', '/dashboard',
            '/admin', '/animatronicos', '/locales', '/tipos', '/perfil', '/usuario',
            '/roles', '/animatronico-local'
        ];
        const esRutaValida = rutasValidas.some(ruta => url === ruta || url.startsWith(ruta + '?') || url.startsWith(ruta + '#')
        );
        this.mostrarHelpy.set(!(esRutaOculta || !esRutaValida));
    }
    mostrarNavbar(): boolean {
        const rutasSinNavbar = ['/home2', '/animatronicos', '/locales', '/tipos', '/perfil', '/admin', '/usuario', '/roles', '/animatronico-local'];
        return !rutasSinNavbar.some(ruta => this.rutaActual === ruta || this.rutaActual.startsWith(ruta + '?') || this.rutaActual.startsWith(ruta + '#')
        );
    }
}
