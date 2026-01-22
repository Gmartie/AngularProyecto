/**
 * COMPONENTE: DashboardComponent
 * 
 * Página principal del ciclo formativo DAW
 * Muestra información general e introductoria para usuarios
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
}
