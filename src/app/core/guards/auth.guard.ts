import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanLoad, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { SessionService } from '../controllers/session.service';

@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanLoad  {
  constructor(
    private sessionService: SessionService,
    private router: Router
  ){}


   async canLoad(): Promise<any> {
    const isAuthenticated = await this.sessionService.isLoggedIn();
    if( isAuthenticated){
      return true;
    } else {
      this.router.navigateByUrl('/login');
      return false;
    }
  }
}
