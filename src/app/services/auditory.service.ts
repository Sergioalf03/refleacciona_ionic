import { Injectable } from '@angular/core';
import { HttpRequestService } from '../core/controllers/http-request.service';

const BASE_URI = '/auditory';

@Injectable({
  providedIn: 'root'
})
export class AuditoryService {

  constructor(
    private httpService: HttpRequestService,
  ) { }

  save(data: any) {
    return this.httpService.post(`${BASE_URI}/save`, data);
  }

  update(id: string, data: any) {
    return this.httpService.post(`${BASE_URI}/update/${id}`, data);
  }

  getList() {
    return this.httpService.get(`${BASE_URI}/list`);
  }

  getCount() {
    return this.httpService.get(`${BASE_URI}/count`);
  }

  getForm(id: string) {
    return this.httpService.get(`${BASE_URI}/form/${id}`);
  }

  getDetail(id: string) {

  }

}
