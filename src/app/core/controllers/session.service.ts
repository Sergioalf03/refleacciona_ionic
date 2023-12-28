import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { STORAGE_KEY_TOKEN, STORAGE_KEY_UNIQUE_DEVICE_ID, STORAGE_KEY_USER_EMAIL, STORAGE_KEY_USER_ID, STORAGE_KEY_USER_NAME, STORAGE_KEY_USER_PHONE_NUMBER } from '../constants/strings';
import { HttpRequestService } from './http-request.service';
import { StorageService } from './storage.service';
import { URI_LOGIN } from '../constants/uris';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  token = '';
  userEmail = '';
  userName = '';
  userPhone = '';
  userId = '';

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
          this.userPhone = data.userPhone;
          this.userId = data.userId;

          this.storageService.set(STORAGE_KEY_UNIQUE_DEVICE_ID, deviceId);
          this.storageService.set(STORAGE_KEY_TOKEN, data.token);
          this.storageService.set(STORAGE_KEY_USER_EMAIL, data.userEmail);
          this.storageService.set(STORAGE_KEY_USER_NAME, data.userName);
          this.storageService.set(STORAGE_KEY_USER_PHONE_NUMBER, data.userPhone);
          this.storageService.set(STORAGE_KEY_USER_ID, data.userId);

          return true;
        })
      );
  }

  register(body: any) {
    return this.httpService
      .post('/register', {name:body.name, email:body.email,phone_number: body.phone_number, password:body.password, key: body.key})
  }

  update(body: any) {
    return this.httpService
      .post('/update-user', {name:body.name ,phone_number: body.phone_number, password:body.password, key: body.key})
  }

  uploadLogo(blob: any) {
    let formData = new FormData();
    formData.append('image', blob);

    return this.httpService
      .postFile('/update-logo', formData)
  }

  async setValuesFromStorage() {
    this.token = await this.storageService.get(STORAGE_KEY_TOKEN);
    this.userEmail = await this.storageService.get(STORAGE_KEY_USER_EMAIL);
    this.userName = await this.storageService.get(STORAGE_KEY_USER_NAME);
    this.userPhone = await this.storageService.get(STORAGE_KEY_USER_PHONE_NUMBER);
    this.userId = await this.storageService.get(STORAGE_KEY_USER_ID);
  }

  validToken() {
    return this.httpService
      .get('/valid-token')
      .pipe(
        catchError(error => {

          this.clearStorage();
          this.clearVariables();

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

  getProfileFormData() {
    return this.httpService
      .get('/user-form')
      .pipe(
        map(res => {
          return res.data;
        })
      );
  }

  logout() {
    return this.httpService
      .get('/logout')
      .pipe(
        map((data) => {
          this.clearStorage();
          this.clearVariables();
          this.router.navigateByUrl(URI_LOGIN());
          return true;
        }),
        catchError(error => {
          this.clearStorage();
          this.clearVariables();
          return of(false);
        })
      )
  }

  clearStorage() {
    this.storageService.remove(STORAGE_KEY_TOKEN);
    this.storageService.remove(STORAGE_KEY_USER_EMAIL);
    this.storageService.remove(STORAGE_KEY_USER_NAME);
    this.storageService.remove(STORAGE_KEY_USER_PHONE_NUMBER);
    this.storageService.remove(STORAGE_KEY_USER_ID);
  }

  clearVariables() {
    this.token = '';
    this.userEmail = '';
    this.userName = '';
  }

}
