import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

export class LoginComponent {
  usuario = '';
  pass = '';
  error = '';

  constructor(private auth:AuthService, private router:Router) {}

  login() {
    this.auth.login(this.usuario,this.pass).subscribe({
      next: (res:any) => {
        this.auth.setUser(res);
        this.router.navigate(['/dashboard']);
      },
      error: () => this.error = 'Credenciales incorrectas'
    });
  }
}
