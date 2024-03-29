import { Component, OnInit } from '@angular/core';
import { SessionService } from './core/controllers/session.service';
import { HttpResponseService } from './core/controllers/http-response.service';
import { StorageService } from './core/controllers/storage.service';
import { Storage } from '@ionic/storage-angular';
import { Platform } from '@ionic/angular';
import { SQLiteService } from './core/controllers/sqlite.service';
import { URI_AUDITORY_LIST, URI_BELT_LIST, URI_GENERAL_COUNT_LIST, URI_HELMET_LIST, URI_HOME } from './core/constants/uris';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
})
export class AppComponent implements OnInit {

  public isWeb: boolean = false;
  logged = false;

  constructor(
    private sessionService: SessionService,
    private responseService: HttpResponseService,
    private storageService: StorageService,
    private sqlite: SQLiteService,
    private storage: Storage,
    private platform: Platform,
    private router: Router,
  ) {}

  async ngOnInit() {
    this.storage.create()
      .then(async storage => {
      await this.storageService.init(storage);

      this.logged = await this.sessionService.isLoggedIn();
      if (this.logged) {
        await this.sessionService.setValuesFromStorage();
        this.responseService.onSuccessAndRedirect(URI_HOME(), '/NA');
      }
    });

    this.platform.ready().then(async () => {
      this.sqlite.initializePlugin()
        .then(async (ret) => {
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

  onAuditoryList() {
    this.router.navigateByUrl(URI_AUDITORY_LIST('local'));
  }

  onHelmetList() {
    this.router.navigateByUrl(URI_HELMET_LIST('local'));
  }

  onBeltList() {
    this.router.navigateByUrl(URI_BELT_LIST('local'));
  }

  onGeneralCountList() {
    this.router.navigateByUrl(URI_GENERAL_COUNT_LIST('local'));
  }

}
