import { Injectable } from '@angular/core';
import { CanLoad, Route, Router, UrlSegment, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { SessionService } from '../../controllers/session.service';

@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanLoad {
  constructor(
    private sessionService: SessionService, 
    private router: Router
  ){}

  canLoad(
      route: Route,
      segments: UrlSegment[]): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        return true
      }
  // canLoad(
  //   route: Route,
  //   segments: UrlSegment[]): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
  //   // return true;
  //   const isAuthenticated =  this.sessionService.isLoggedIn();
  //   if ( isAuthenticated) {
  //     return true;
  //   } else {
  //     this.router.navigateByUrl('/login');
  //     return false
  //   }
  // }
}
