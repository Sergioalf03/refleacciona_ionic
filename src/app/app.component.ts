import { Component, OnDestroy, OnInit } from '@angular/core';
import { SessionService } from './core/controllers/session.service';
import { HttpResponseService } from './core/controllers/http-response.service';
import { RandomStringService } from './core/controllers/random-string.service';
import { StorageService } from './core/controllers/storage.service';
import { Storage } from '@ionic/storage-angular';
import { Platform } from '@ionic/angular';
import { SQLiteService } from './core/controllers/sqlite.service';
import { URI_HOME } from './core/constants/uris';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
})
export class AppComponent implements OnInit {

  public isWeb: boolean = false;
  private initPlugin?: boolean;

  constructor(
    private sessionService: SessionService,
    private responseService: HttpResponseService,
    private randomStringService: RandomStringService,
    private storageService: StorageService,
    private sqlite: SQLiteService,
    private storage: Storage,
    private platform: Platform,
  ) {}

  async ngOnInit() {
    this.storage.create()
    .then(async storage => {
      await this.storageService.init(storage);

      const logged = await this.sessionService.isLoggedIn();
      if (logged) {
        await this.sessionService.setValuesFromStorage();
        this.responseService.onSuccessAndRedirect(URI_HOME(), '/NA');
      }
    });

    this.platform.ready().then(async () => {
      this.sqlite.initializePlugin()
        .then(async (ret) => {
          this.initPlugin = ret;
          if (this.sqlite.platform === "web") {
            this.isWeb = true;
            await customElements.whenDefined('jeep-sqlite');
            const jeepSqliteEl = document.querySelector('jeep-sqlite');
            if (jeepSqliteEl != null) {
              await this.sqlite.initWebStore();
            }
          }
        })
        .catch(error => {
          console.log('No se pudo inicializar sqlite')
        });
    });
  }

}
