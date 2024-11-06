import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {

  constructor(
    private alertController: AlertController
  ) { }

  async presentAlert(message: string, onAccept: () => void) {
    const alert = await this.alertController.create({
      header: 'Confirmación',
      message,
      mode: 'ios',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',

        },
        {
          text: 'Aceptar',
          role: 'confirm',
          handler: onAccept,
        },
      ],
    });

    await alert.present();
  }
}
