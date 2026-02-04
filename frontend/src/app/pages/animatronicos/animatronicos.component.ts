import { Component, OnInit } from '@angular/core';
import { AnimatronicosService } from '../../services/animatronicos.service';
import { AuthService } from '../../services/auth.service';
import { Animatronico } from '../../models/animatronico.model';
import { CommonModule } from '@angular/common';
import { WindowWrapperComponent } from '../../components/window-wrapper/window-wrapper.component';

@Component({
  selector: 'app-animatronicos',
  templateUrl: './animatronicos.component.html',
  styleUrls: ['./animatronicos.component.css'],
  standalone: true,
  imports: [CommonModule, WindowWrapperComponent]
})
export class AnimatronicosComponent implements OnInit {

  animas: Animatronico[] = [];
  rol = 0;

  constructor(
    private service: AnimatronicosService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    const user = this.auth.obtenerUsuario();
    this.rol = user?.id_rol || 0;

    this.actualizar();
  }

  actualizar() {
    this.service.obtenerTodos().subscribe(data => {
      this.animas = data;
    });
  }

  borrar(id: number) {
    if (confirm('¿Está seguro de eliminar este animatrónico?')) {
      this.service.eliminar(id).subscribe(() => {
        this.animas = this.animas.filter(a => a.id !== id);
      });
    }
  }

  crear() {
    // TODO: Implementar formulario de creación
    alert('Función en desarrollo');
  }

  editar(a: Animatronico) {
    // TODO: Implementar formulario de edición
    alert('Editar: ' + a.nombre);
  }

  verDetalles(a: Animatronico) {
    alert(`Animatrónico: ${a.nombre}\nReconocimiento: ${a.reconocimiento}%`);
  }

  getRolNombre(): string {
    switch (this.rol) {
      case 1: return 'Propietario';
      case 2: return 'Técnico';
      case 3: return 'Empleado';
      default: return 'Desconocido';
    }
  }
}
