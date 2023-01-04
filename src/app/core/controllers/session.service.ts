import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs';
import { HttpRequestService } from './http-request.service';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  userEmail = '';
  userName = '';

  constructor(
    private httpService: HttpRequestService,
    private httpClient: HttpClient,
  ) { }

  intializeProtection() {
    return this.httpService
      .get('/sanctum/csrf-cookie');
  }

  login() {
    return this.httpService
      .post('/sanctum/token', { email: 'sergio@dev.com', password: '12345678', device_name: 'sergio PC' });
  }

  getUser(token: string) {
    return this.httpClient
      .post('http://127.0.0.1:8000/api/1', { headers: new HttpHeaders({ Authorization: 'Bearer ' + token }) })
      .pipe(
        tap(res => {
          console.log(res);
          // const data = res.data;
          // console.log(data)
          // this.setUserData(data.email, data.name);
        })
      );
  }



  setUserData(email: string, name: string) {
    this.userEmail = email;
    this.userName = name;
  }

  autehticated() {
    return this.userEmail !== '' && this.userName !== '';
  }

  cleanSession() {
    this.userEmail = '';
    this.userName = '';
  }

}
