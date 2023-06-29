import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { SessionService } from '../controllers/session.service';

@Injectable({
  providedIn: 'root'
})
export class AutoLoginGuard implements CanActivate {
  constructor(
    private sessionService: SessionService,
    private router: Router
  ){}

  async canActivate(): Promise<any> {
    const isAuthenticated = await this.sessionService.isLoggedIn();
    if(isAuthenticated){
      this.router.navigateByUrl('/home');
      return true;
    } else {
      this.router.navigateByUrl('/login');
      return false;
    }
  }

}
