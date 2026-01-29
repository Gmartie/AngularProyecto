import { Component, OnInit } from '@angular/core';
import { TiposAnimatronicosService } from '../../services/tiposanimatronicos.service';
import { AuthService } from '../../services/auth.service';
import { TipoAnimatronico } from '../../models/tiposanimatronicos.model';
import { CommonModule } from '@angular/common';

@Component({
    standalone: true,
  imports: [CommonModule],
  selector: 'app-tipos',
  templateUrl: './tipos.component.html'
})
export class TiposComponent implements OnInit {

  tipos: TipoAnimatronico[] = [];
  rol = 0;

  constructor(
    private service: TiposAnimatronicosService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.rol = this.auth.getUser().id_rol;

    this.service.obtenerTodos().subscribe(data => {
      this.tipos = data;
    });
  }

  borrar(id: number): void {
    this.service.eliminar(id).subscribe(() => {
      this.tipos = this.tipos.filter(t => t.id !== id);
    });
  }

  crear() {}
  editar(tipo: TipoAnimatronico) {}
}
