import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SessionService } from '../controllers/session.service';
import { URI_HOME, URI_LOGIN } from '../constants/uris';

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
      this.router.navigateByUrl(URI_HOME());
      return true;
    } else {
      this.router.navigateByUrl(URI_LOGIN());
      return false;
    }
  }

}
