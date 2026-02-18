/**
 * COMPONENTE: HomeComponent
 * 
 * Página principal pública de la aplicación
 * Muestra bienvenida y opciones para login/registro
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor(private router: Router) { }

  irLogin() {
    this.router.navigate(['/login']);
  }

  irRegistro() {
    this.router.navigate(['/registro']);
  }
}
