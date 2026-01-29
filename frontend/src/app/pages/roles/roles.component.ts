import { Component, OnInit } from '@angular/core';
import { RolesService } from '../../services/roles.service';
import { AuthService } from '../../services/auth.service';
import { Rol } from '../../models/rol.model';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html'
})
export class RolesComponent implements OnInit {

  roles: Rol[] = [];
  rolUsuario = 0;

  constructor(
    private service: RolesService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.rolUsuario = this.auth.getUser().id_rol;

    this.service.obtenerTodos().subscribe(data => {
      this.roles = data;
    });
  }

  borrar(id: number): void {
    this.service.eliminar(id).subscribe(() => {
      this.roles = this.roles.filter(r => r.id !== id);
    });
  }

  crear() {}
  editar(rol: Rol) {}
}
