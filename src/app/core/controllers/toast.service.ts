import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(
    private toastController: ToastController
  ) { }

  async showSuccessToast(message:string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 1500,
      icon: 'checkmark-done-outline',
      position:'top',
      animated: true,
      translucent:true,
      color:'success'
    });
    await toast.present();
  }

  async showErrorToast(message:string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 1500,
      icon: 'close-outline',
      position:'top',
      animated: true,
      translucent:true,
      color:'danger'
    });
    await toast.present();
  }


}
