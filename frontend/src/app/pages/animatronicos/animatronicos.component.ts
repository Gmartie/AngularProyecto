import { Component, OnInit } from '@angular/core';
import { AnimatronicosService } from '../../services/animatronicos.service';
import { AuthService } from '../../services/auth.service';
import { Animatronico } from '../../models/animatronico.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-animatronicos',
  templateUrl: './animatronicos.component.html',
    standalone: true,
  imports: [CommonModule]
})
export class AnimatronicosComponent implements OnInit {

  animas: Animatronico[] = [];
  rol = 0;

  constructor(
    private service: AnimatronicosService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.rol = this.auth.getUser().id_rol;

    this.service.obtenerTodos().subscribe(data => {
      this.animas = data;
    });
  }

  borrar(id: number) {
    this.service.eliminar(id).subscribe(() => {
      this.animas = this.animas.filter(a => a.id !== id);
    });
  }

  crear() {}
  editar(a: Animatronico) {}
}
