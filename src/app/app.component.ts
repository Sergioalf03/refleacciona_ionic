import { Component, OnInit } from '@angular/core';
import { SessionService } from './core/controllers/session.service';
import { HttpResponseService } from './core/controllers/http-response.service';
import { RandomStringService } from './core/controllers/random-string.service';
import { StorageService } from './core/controllers/storage.service';
import { Storage } from '@ionic/storage-angular';
import { Platform } from '@ionic/angular';
import { SQLiteService } from './core/controllers/sqlite.service';
import { DatabaseService } from './core/controllers/database.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {

  public isWeb: boolean = false;
  private initPlugin?: boolean;

  constructor(
    private sessionService: SessionService,
    private responseService: HttpResponseService,
    private randomStringService: RandomStringService,
    private storageService: StorageService,
    private databaseService: DatabaseService,
    private sqlite: SQLiteService,
    private storage: Storage,
    private platform: Platform,
  ) {}

  async ngOnInit() {
    this.storage.create()
    .then(async storage => {
      await this.storageService.init(storage);
      // await this.databaseService.init();
      // console.log(res)

      const logged = await this.sessionService.isLoggedIn();
      if (logged) {
        await this.sessionService.setValuesFromStorage();
        this.sessionService
          .validToken()
          .subscribe({
            next: res => {
              this.responseService.onSuccessAndRedirect('/home','/NA');

              this.sessionService
                .getUserData()
                .subscribe({
                  next: res => this.responseService.onSuccess('/NA'),
                  error: err => this.responseService.onError(err, 'No se pudieron recuperar los datos')
                })
            },
            error: err => this.responseService.onError(err, 'No se pudo verificar'),
          })
      } else {
        // console.log('not logged');
        // this.submit();
      }
    });

    this.platform.ready().then(async () => {
      this.sqlite.initializePlugin().then(async (ret) => {
        this.initPlugin = ret;
        if (this.sqlite.platform === "web") {
          this.isWeb = true;
          await customElements.whenDefined('jeep-sqlite');
          const jeepSqliteEl = document.querySelector('jeep-sqlite');
          if (jeepSqliteEl != null) {
            await this.sqlite.initWebStore();
            console.log(`>>>> isStoreOpen ${await jeepSqliteEl.isStoreOpen()}`);
          } else {
            console.log('>>>> jeepSqliteEl is null');
          }
        }

        console.log(`>>>> in App  this.initPlugin ${this.initPlugin}`);
        this.databaseService
          .initConnection()
          .then(() => {
            this.databaseService.checkDatabaseVersion();

          });
      });
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
          // console.log(res)

        },
        error: err => this.responseService.onError(err, 'No se pudo iniciar sesión'),
      });
  }


}
