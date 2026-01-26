import { Component, OnInit } from '@angular/core';
import { LocalesService } from '../../services/locales.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-locales',
  templateUrl: './locales.component.html'
})
export class LocalesComponent implements OnInit {

  locales:any[] = [];
  rol = 0;

  constructor(
    private service:LocalesService,
    private auth:AuthService
  ) {}

  ngOnInit() {
    this.rol = this.auth.getUser().id_rol;
    this.service.getAll().subscribe(data => this.locales = data as any[]);
  }

  borrar(id:number){
    this.service.delete(id).subscribe(() => {
      this.locales = this.locales.filter(l => l.id !== id);
    });
  }

  crear(){}
  editar(l:any){}
}
