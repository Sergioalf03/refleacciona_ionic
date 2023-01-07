import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HttpResponseService {

  constructor() { }

  onSuccess(message: string) {

  }

  onSuccessAndRedirect(redirectTo: string, message: string) {

  }

  onError(error: any, message: string) {

  }

  onErrorAndRedirect(error: any, redirectTo: string, message: string) {

  }

}
