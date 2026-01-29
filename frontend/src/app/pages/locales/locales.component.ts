import { Component, OnInit } from '@angular/core';
import { LocalesService } from '../../services/locales.service';
import { AuthService } from '../../services/auth.service';
import { Local } from '../../models/local.model';

@Component({
  selector: 'app-locales',
  templateUrl: './locales.component.html'
})
export class LocalesComponent implements OnInit {

  locales: Local[] = [];
  rol = 0;

  constructor(
    private service: LocalesService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.rol = this.auth.getUser().id_rol;

    this.service.obtenerTodos().subscribe(data => {
      this.locales = data;
    });
  }

  borrar(id: number): void {
    this.service.eliminar(id).subscribe(() => {
      this.locales = this.locales.filter(l => l.id !== id);
    });
  }

  crear() {}
  editar(local: Local) {}
}
