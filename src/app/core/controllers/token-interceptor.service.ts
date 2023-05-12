import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root'
})
export class TokenInterceptorService implements HttpInterceptor {

  constructor(
    private sessionService: SessionService,
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
      const token = this.sessionService.token;
    // console.log(token, token === '')

      if (token === '') {
        return next.handle(req);
      }

      const authorized = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });

      return next.handle(authorized);
  }



}

