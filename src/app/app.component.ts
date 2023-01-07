import { Component, OnInit } from '@angular/core';
import { SessionService } from './core/controllers/session.service';
import { HttpResponseService } from './core/controllers/http-response.service';
import { RandomStringService } from './core/controllers/random-string.service';
import { StorageService } from './core/controllers/storage.service';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {

  constructor(
    private sessionService: SessionService,
    private responseService: HttpResponseService,
    private randomStringService: RandomStringService,
    private storageService: StorageService,
    private storage: Storage
  ) {}

  async ngOnInit() {
    this.storage.create()
    .then(async storage => {
      const res = await this.storageService.init(storage);
      console.log(res)

      const logged = await this.sessionService.isLoggedIn();
      console.log(logged)
      if (logged) {
        console.log('logged');
        await this.sessionService.setValuesFromStorage();
        this.sessionService
          .validToken()
          .subscribe({
            next: res => {
              console.log(res);

              this.sessionService
                .getUserData()
                .subscribe({
                  next: res => console.log(res),
                  error: err => this.responseService.onError(err, 'No se pudieron recuperar los datos')
                })
            },
            error: err => this.responseService.onError(err, 'No se pudo verificar'),
          })
      } else {
        console.log('not logged');
        this.submit();
      }
    });
  }

  private submit() {
    const randomString = this.randomStringService.generate(128);
    this.loginWithId(randomString);
  }

  private loginWithId(deviceId: string) {
    this.sessionService
      .login('sergio@dev.com', '12345678', deviceId)
      .subscribe({
        next: res => {
          console.log(res)

        },
        error: err => this.responseService.onError(err, 'No se pudo iniciar sesión'),
      });
  }


}
