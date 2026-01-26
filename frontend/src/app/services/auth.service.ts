@Injectable({providedIn:'root'})
export class AuthService {
  user:any;

  setUser(u:any){ this.user = u; }
  getUser(){ return this.user; }

  login(user:string,pass:string){
    return this.http.post('http://localhost:3000/login',{user,pass});
  }
}
