import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class HttpResponseService {

  defaultMessage: string = '';
  constructor(
    private router: Router,
    private toastService: ToastService
  ) { }

  onSuccess(message: string) {
    if(message === '/NA'){return;} 
      this.toastService.showSuccessToast(message);
  }

  onSuccessAndRedirect(redirectTo: string, message: string) {
    this.router.navigateByUrl(redirectTo);
    if(message === '/NA' ){
      return;
    } 
      this.toastService.showSuccessToast(message);
  }

  onError(error: any, message: string) {
    if (error.startsWith && error.startsWith('M/:')) {
       this.defaultMessage = error.substring(3);
    }
    // console.log(this.defaultMessage);
    this.toastService.showErrorToast(this.defaultMessage);
  }

  onErrorAndRedirect(error: any, redirectTo: string, message: string) {

  }

}
