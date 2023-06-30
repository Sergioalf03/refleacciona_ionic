import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from './toast.service';
import { LoadingService } from './loading.service';

@Injectable({
  providedIn: 'root'
})
export class HttpResponseService {

  constructor(
    private router: Router,
    private toastService: ToastService,
    private loadingService: LoadingService,
  ) { }

  onSuccess(message: string) {
    this.loadingService.dismissLoading()
    if(message === '/NA') {
      return;
    }
    this.toastService.showSuccessToast(message);
  }

  onSuccessAndRedirect(redirectTo: string, message: string) {
    this.router.navigateByUrl(redirectTo);
    this.loadingService.dismissLoading()
    if(message === '/NA' ) {
      return;
    }
    this.toastService.showSuccessToast(message);
  }

  onError(error: any, message: string) {
    let defaultMessage = message;
    if (error.startsWith && error.startsWith('M/:')) {
       defaultMessage = error.substring(3);
    }
    this.loadingService.dismissLoading()
    console.log(error)
    this.toastService.showErrorToast(defaultMessage);
  }

  onErrorAndRedirect(error: any, redirectTo: string, message: string) {
    let defaultMessage = message;
    if (error.startsWith && error.startsWith('M/:')) {
      defaultMessage = error.substring(3);
    }
    this.loadingService.dismissLoading()
    console.log(error)
    this.toastService.showErrorToast(defaultMessage);
    this.router.navigateByUrl(redirectTo);
  }

}
