import { Component, OnDestroy, OnInit } from '@angular/core';
import { SessionService } from './core/controllers/session.service';
import { HttpResponseService } from './core/controllers/http-response.service';
import { RandomStringService } from './core/controllers/random-string.service';
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
  private initPlugin?: boolean;

  constructor(
    private sessionService: SessionService,
    private responseService: HttpResponseService,
    private randomStringService: RandomStringService,
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

      const logged = await this.sessionService.isLoggedIn();
      if (logged) {
        await this.sessionService.setValuesFromStorage();
        // this.sessionService
        //   .validToken()
        //   .subscribe({
        //     next: res => {
              this.responseService.onSuccessAndRedirect(URI_HOME(), '/NA');

                // this.sessionService
                //   .getUserData()
                //   .subscribe({
                //     next: res => this.responseService.onSuccess('/NA'),
                //     error: err => this.responseService.onError(err, 'No se pudieron recuperar los datos')
                //   })
        //       },
        //       error: err => this.responseService.onError(err, 'No se pudo verificar'),
        //     });
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
          }
        }
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
