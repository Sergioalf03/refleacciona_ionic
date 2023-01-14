import { Injectable } from '@angular/core';
import { HttpRequestService } from '../core/controllers/http-request.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private httpService: HttpRequestService
  ) { }
}
