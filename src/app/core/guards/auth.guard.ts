import { Injectable } from '@angular/core';
import { CanLoad, Router } from '@angular/router';
import { SessionService } from '../controllers/session.service';
import { URI_LOGIN } from '../constants/uris';

@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanLoad  {
  constructor(
    private sessionService: SessionService,
    private router: Router
  ){}

  addition = 0;

   async canLoad(): Promise<any> {
    this.addition++;
    const isAuthenticated = await this.sessionService.isLoggedIn();
    if (this.addition > 1) {
      if( isAuthenticated){
        return true;
      } else {
        this.router.navigateByUrl(URI_LOGIN());
        return false;
      }
    }
  }
}
