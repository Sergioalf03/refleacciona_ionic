import { Component, OnInit } from '@angular/core';
import { SessionService } from './core/controllers/session.service';
import { HttpResponseService } from './core/controllers/http-response.service';
import { StorageService } from './core/controllers/storage.service';
import { Storage } from '@ionic/storage-angular';
import { Platform } from '@ionic/angular';
import { SQLiteService } from './core/controllers/sqlite.service';
import { URI_AUDITORY_LIST, URI_BELT_LIST, URI_GENERAL_COUNT_LIST, URI_HELMET_LIST, URI_HOME, URI_LOGIN } from './core/constants/uris';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { DatabaseService } from './core/controllers/database.service';
import { Subscription } from 'rxjs';
import { LOCAL_DATABASE } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
})
export class AppComponent implements OnInit {

  public isWeb: boolean = false;
  logged = false;
  showProfileHeader= true;
  platform = '';
  isAppInit = false;

  loggedObservable!: Subscription;

  constructor(
    private sessionService: SessionService,
    private responseService: HttpResponseService,
    private storageService: StorageService,
    private sqliteService: SQLiteService,
    private storage: Storage,
    private router: Router,
    private location: Location,
    private databaseService: DatabaseService,
  ) {}

  async ngOnInit() {
    this.storage.create()
      .then(async storage => {
        await this.storageService.init(storage);

        this.logged = await this.sessionService.isLoggedIn();
        if (this.logged) {
          await this.sessionService.setValuesFromStorage();
          if (this.location.path() !== URI_HOME()) {
            this.responseService.onSuccessAndRedirect(URI_HOME(), '/NA');
          }
        } else {
          this.router.navigateByUrl(URI_LOGIN());
        }
      })
      .catch(e => console.log(e));

      this.loggedObservable = this.sessionService
      .loggedObservable()
      .subscribe({
        next: res => {
          console.log(res);
          this.logged = res
        },
      })

      await this.sqliteService.initializePlugin().then(async (ret) => {
        this.platform = this.sqliteService.platform;
        try {
            if( this.sqliteService.platform === 'web') {
                await this.sqliteService.initWebStore();
            }
            await this.databaseService.createConnection();
            // Here Initialize MOCK_DATA if required

            // Initialize whatever database and/or MOCK_DATA you like

            if( this.sqliteService.platform === 'web') {
                await this.sqliteService.saveToStore( LOCAL_DATABASE.name);
            }

            this.isAppInit = true;

        } catch (error) {
            console.log(`initializeAppError: ${error}`);
            await this.responseService.onError(error, `initializeAppError: ${error}`);
        }
      });



  }


  ngOnDestroy() {
    this.loggedObservable.unsubscribe();

    this.databaseService
      .closeConnection()
      .then(() => true)
      .catch(() => true);
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
