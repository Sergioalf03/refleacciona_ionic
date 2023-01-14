import { Injectable } from '@angular/core';
import { HttpRequestService } from '../core/controllers/http-request.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  userId = '';

  constructor(
    private httpService: HttpRequestService
  ) { }

  confirmEmail(userId: string, code: string) {
    return this.httpService.post('/confirm-email', {
      id: userId,
      token: code,
    });
  }

  resetPassword(email: string) {
    return this.httpService.post('/forget-password', {
      email
    });
  }

  changePassword(id: string, code: string, password: string) {
    return this.httpService.post('/change-password', {
      id,
      token: code,
      password,
    });
  }

}
