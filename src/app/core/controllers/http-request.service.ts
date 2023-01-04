import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HttpRequestService {

  constructor(
    private httpClient: HttpClient,
  ) { }

  post(uri: string, object: {}) {
    return this.httpClient
      .post<any>(`${API_URL}${uri}`, object);
  }

  get(uri: string) {
    return this.httpClient
      .get<any>(`${API_URL}${uri}`);
  }

  put(uri: string, object?: {}) {
    return this.httpClient
      .put<any>(`${API_URL}${uri}`, object ? object : {});
  }

  delete(uri: string, object?: {}) {
    return this.httpClient
      .delete<any>(`${API_URL}${uri}`, object);
  }

  downloadGet(uri: string) {
    return this.httpClient
      .get(`${API_URL}${uri}`, { responseType: 'blob' });
  }

  downloadPost(uri: string, body: any) {
    return this.httpClient
      .post(`${API_URL}${uri}`, body, { responseType: 'blob' });
  }

  customPost(COMPLETE_URL: string, data: any) {
    return this.httpClient
      .post<any>(COMPLETE_URL, data, { withCredentials: true })
  }

  customGet(COMPLETE_URL: string) {
    return this.httpClient
      .get<any>(COMPLETE_URL, { withCredentials: true })
  }

}
