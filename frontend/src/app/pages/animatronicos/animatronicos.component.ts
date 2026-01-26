import { Component, OnInit } from '@angular/core';
import { AnimatronicosService } from '../../services/animatronicos.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-animatronicos',
  templateUrl: './animatronicos.component.html'
})
export class AnimatronicosComponent implements OnInit {

  animas:any[] = [];
  rol = 0;

  constructor(
    private service:AnimatronicosService,
    private auth:AuthService
  ) {}

  ngOnInit() {
    this.rol = this.auth.getUser().id_rol;
    this.service.getAll().subscribe(data => this.animas = data as any[]);
  }

  borrar(id:number){
    this.service.delete(id).subscribe(() => {
      this.animas = this.animas.filter(a => a.id !== id);
    });
  }

  crear(){ /* abrir modal */ }
  editar(a:any){ /* abrir modal */ }
}
