import { Component, OnInit } from '@angular/core';
import { TiposService } from '../../services/tipos.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-tipos',
  templateUrl: './tipos.component.html'
})
export class TiposComponent implements OnInit {

  tipos:any[] = [];
  rol = 0;

  constructor(
    private service:TiposService,
    private auth:AuthService
  ) {}

  ngOnInit() {
    this.rol = this.auth.getUser().id_rol;
    this.service.getAll().subscribe(data => this.tipos = data as any[]);
  }

  borrar(id:number){
    this.service.delete(id).subscribe(() => {
      this.tipos = this.tipos.filter(t => t.id !== id);
    });
  }

  crear(){}
  editar(t:any){}
}
