import { AuthService } from '../../services/auth.service';
export class DashboardComponent {
  rol = 0;

  constructor(private auth:AuthService){
    this.rol = this.auth.getUser().id_rol;
  }
}
