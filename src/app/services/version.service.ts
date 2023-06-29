import { Injectable } from '@angular/core';
import { HttpRequestService } from '../core/controllers/http-request.service';

const BASE_URI = '/version';

@Injectable({
  providedIn: 'root'
})
export class VersionService {

  constructor(
    private http: HttpRequestService,
  ) { }

  checkLastVersion() {
    return this.http
      .get(`${BASE_URI}/last`)
  }

  getNewVersion() {
    return this.http
      .get(`${BASE_URI}/get-last-version`)
  }

}
