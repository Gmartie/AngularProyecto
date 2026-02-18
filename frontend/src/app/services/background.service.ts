
import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from './auth.service';
export type BackgroundType = 'web' | 'dashboard' | 'none';
@Injectable({
providedIn: 'root'
})
export class BackgroundService {
private backgroundTypeSubject = new BehaviorSubject<BackgroundType>('none');
public backgroundType$ = this.backgroundTypeSubject.asObservable();
constructor(
private router: Router,
private authService: AuthService
) {
this.initializeBackgroundListener();
}
private initializeBackgroundListener(): void {
this.router.events
.pipe(filter(event => event instanceof NavigationEnd))
.subscribe((event: NavigationEnd) => {
this.updateBackground(event.url);
});
this.authService.usuario$.subscribe(usuario => {
this.updateBackground(this.router.url, usuario !== null);
});
this.updateBackground(this.router.url);
}
private updateBackground(url: string, isAuthenticated?: boolean): void {
if (isAuthenticated === undefined) {
isAuthenticated = this.authService.estaAutenticado();
}
const authRoutes = ['/login', '/registro'];
const isAuthRoute = authRoutes.some(route => url === route || url.startsWith(route + '?') || url.startsWith(route + '#')
);
const isHome2 = url === '/home2' || url.startsWith('/home2?') || url.startsWith('/home2#');
if (isAuthRoute) {
this.setBackground('web');
} else if (isHome2) {
this.setBackground('none');
} else if (isAuthenticated) {
this.setBackground('dashboard');
} else {
this.setBackground('none');
}
}
private setBackground(type: BackgroundType): void {
this.backgroundTypeSubject.next(type);
this.applyBackgroundToBody(type);
}
private applyBackgroundToBody(type: BackgroundType): void {
const body = document.body;
body.classList.remove('bg-web', 'bg-dashboard', 'bg-none');
switch (type) {
case 'web':
body.classList.add('bg-web');
break;
case 'dashboard':
body.classList.add('bg-dashboard');
break;
case 'none':
default:
body.classList.add('bg-none');
break;
}
}
getCurrentBackgroundType(): BackgroundType {
return this.backgroundTypeSubject.value;
}
}
