import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { STORAGE_KEY_TOKEN, STORAGE_KEY_UNIQUE_DEVICE_ID, STORAGE_KEY_USER_EMAIL, STORAGE_KEY_USER_NAME } from '../constants/strings';
import { HttpRequestService } from './http-request.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  token = '';
  userEmail = '';
  userName = '';

  constructor(
    private httpService: HttpRequestService,
    private storageService: StorageService,
    private router: Router
  ) { }

   async isLoggedIn() {
    const token =  await this.storageService.get(STORAGE_KEY_TOKEN);
    return !!token;
  }

  login(email: string, password: string, deviceId: string) {
    return this.httpService
      .post('/login', { email, password, device_name: deviceId })
      .pipe(
        map(res => {
          const data = res.data;

          this.token = data.token;
          this.userEmail = data.userEmail;
          this.userName = data.userName;

          this.storageService.set(STORAGE_KEY_UNIQUE_DEVICE_ID, deviceId);
          this.storageService.set(STORAGE_KEY_TOKEN, data.token);
          this.storageService.set(STORAGE_KEY_USER_EMAIL, data.userEmail);
          this.storageService.set(STORAGE_KEY_USER_NAME, data.userName);

          return true;
        })
      );
  }
  register(body: any) {
    return this.httpService
    .post('/register', {name:body.name, email:body.email,phone_number: body.phone_number, password:body.password, key: body.key})
    .pipe(
      map(res => {
        console.log(res);
      })
    )
  }

  async setValuesFromStorage() {
    this.token = await this.storageService.get(STORAGE_KEY_TOKEN);
    this.userEmail = await this.storageService.get(STORAGE_KEY_USER_EMAIL);
    this.userName = await this.storageService.get(STORAGE_KEY_USER_NAME);
  }

  validToken() {
    return this.httpService
      .get('/valid-token')
      .pipe(
        catchError(error => {

          this.clearStorage();
          this.clearVariables();

          console.log(error);

          return of(false);
        })
      );
  }

  getUserData() {
    return this.httpService
      .get('/user-data')
      .pipe(
        map(res => {
          const data = res.data;

          this.userEmail = data.userEmail;
          this.userName = data.userName;

          this.storageService.set(STORAGE_KEY_USER_EMAIL, data.userEmail);
          this.storageService.set(STORAGE_KEY_USER_NAME, data.userName);

          return true;
        })
      );
  }

  logout() {
    return this.httpService
      .get('/logout')
      .pipe(
        map(() => {
          this.clearStorage();
          this.clearVariables();
          this.router.navigateByUrl('/login');
          return true;
        }),
        catchError(error => {
          this.clearStorage();
          this.clearVariables();

          console.log(error);

          return of(false);
        })
      )
  }

  clearStorage() {
    this.storageService.remove(STORAGE_KEY_TOKEN);
    this.storageService.remove(STORAGE_KEY_USER_EMAIL);
    this.storageService.remove(STORAGE_KEY_USER_NAME);
  }

  clearVariables() {
    this.token = '';
    this.userEmail = '';
    this.userName = '';
  }

}
