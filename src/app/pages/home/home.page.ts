import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { SessionService } from 'src/app/core/controllers/session.service';
import { DatabaseService } from 'src/app/core/controllers/database.service';
import { ConfirmDialogService } from 'src/app/core/controllers/confirm-dialog.service';
import { VersionService } from 'src/app/services/version.service';
import { LoadingService } from 'src/app/core/controllers/loading.service';
import { URI_AUDITORY_FORM, URI_AUDITORY_LIST, URI_BELT_FORM, URI_BELT_LIST, URI_HELMET_FORM, URI_HELMET_LIST, URI_LOGIN, URI_PROFILE } from 'src/app/core/constants/uris';
import { Platform } from '@ionic/angular';
import { DATABASE_WAITING_MESSAGE } from 'src/app/core/constants/message-code';
import { createSchema } from 'src/app/utils/database.util';
// import { Camera } from '@capacitor/camera';
// import { Filesystem } from '@capacitor/filesystem';
// import { Geolocation } from '@capacitor/geolocation';
// import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {

  auditoriesCount = 0;

  sqlite: any;
  // platform?: string;
  handlerPermissions: any;
  initPlugin: boolean = false;

  constructor(
    private sessionService: SessionService,
    private httpResponseService: HttpResponseService,
    private databaseService: DatabaseService,
    private router: Router,
    private versionService: VersionService,
    private confirmDialogService: ConfirmDialogService,
    private loadingService: LoadingService,
    private platform: Platform,
    // private androidPermissions: AndroidPermissions,
  ) {

    this.platform
      .backButton
      .subscribeWithPriority(9999, () => {
        return;
      });
  }

  private checkPermissions() {
          // this.androidPermissions
          //   .checkPermission(this.androidPermissions.PERMISSION.CAMERA)
          //   .then(
          //     result => console.log('Has permission?', result.hasPermission),
          //     err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAMERA)
          //   );

          // this.androidPermissions.requestPermissions([
          //   this.androidPermissions.PERMISSION.GEOLOCATION,
          //   this.androidPermissions.PERMISSION.CAMERA,
          //   this.androidPermissions.PERMISSION.FILESYSTEM
          // ]);

  }

  ionViewDidEnter() {
    // this.checkPermissions();

    if (!this.versionService.checked) {
      this.onFetchUpdate(false);
    }

    // this.databaseService.executeQuery(createSchema).subscribe({
    //   next: (rr: any) => console.log(rr),
    // });
  }

  private importQuestions(questions: any[], sectionsQuery: string, version: number) {
    let query = '';
    let count = 0;

    const updateVersionQuery = `INSERT INTO versions (name, number) VALUES ("${version}", "${version}"); `;

    if (questions.length > 0) {
      questions.forEach((q: any, i: number, arr: any[]) => {
        setTimeout(() => {

          this.databaseService
            .executeQuery(`SELECT * FROM questions WHERE uid = "${q.uid}"`)
            .subscribe({
              next: questionExists => {
                if (questionExists !== DATABASE_WAITING_MESSAGE) {
                  if (questionExists.values.length === 0) {
                    query += `INSERT INTO questions (section_id, uid, score, cond, has_evidence, indx, status, sentence, answers, popup) VALUES (${q.section_id}, "${q.uid}", ${q.score}, "${q.cond}", ${q.has_evidence}, ${q.indx}, ${q.status}, "${q.sentence}", '${q.answers}', "${q.popup}"); `
                  } else {
                    query += `UPDATE questions SET uid = "${q.uid}", score = ${q.score}, cond = "${q.cond}", has_evidence = ${q.has_evidence}, indx = ${q.indx}, status = ${q.status}, sentence = "${q.sentence}", answers = '${q.answers}', popup = "${q.popup}" WHERE uid = "${q.uid}"; `
                  }

                  count++;
                  if (count === arr.length) {
                    this.updateAuditories(sectionsQuery + query + updateVersionQuery);
                  }
                }
              }
            })
        }, 50 * i)
      });
    } else {
      this.updateAuditories(sectionsQuery + query + updateVersionQuery);
    }
  }

  updateAuditories(query: string) {
    this.databaseService
      .executeQuery(query)
      .subscribe({
        next: () => {
          this.httpResponseService.onSuccess('Se instaló la nueva versión');
        }
      });
  }

  onLogout() {
    this.confirmDialogService
      .presentAlert('¿Desea cerrar sesión?', async () => {
        this.loadingService.showLoading();
        return await this.sessionService.logout()
        .subscribe({
          next: () => {
            this.router.navigateByUrl(URI_LOGIN())
            this.loadingService.dismissLoading();
          },
          error: err => {
            this.httpResponseService.onError(err, 'Error al cerrar sesión');
          },
        })
      })
  }

  onNewAuditory() {
    this.router.navigateByUrl(URI_AUDITORY_FORM('0'));
  }

  onAuditoryList() {
    this.router.navigateByUrl(URI_AUDITORY_LIST('local'));
  }

  onNewHelmet() {
    this.router.navigateByUrl(URI_HELMET_FORM('0'));
  }

  onHelmetList() {
    this.router.navigateByUrl(URI_HELMET_LIST('local'));
  }

  onNewBelt() {
    this.router.navigateByUrl(URI_BELT_FORM('0'));
  }

  onBeltList() {
    this.router.navigateByUrl(URI_BELT_LIST('local'));
  }

  onOpenUser() {
    this.router.navigateByUrl(URI_PROFILE());
  }

  onFetchUpdate(showToast: boolean) {
    this.versionService.checked = true;
    this.loadingService.showLoading();
    this.databaseService
      .checkDatabaseVersion()
      .then((localVersion: any) => {
        this.versionService
          .checkLastVersion()
          .subscribe({
            next: res => {
              // const localVersionLowerThanRemote = (localVersion === 'new' ? 1 : +localVersion.values[0].number) < +res.data.number;
              // if (localVersionLowerThanRemote) {
              //   this.confirmDialogService.presentAlert('Hay una nueva versión del formulario de auditorías. ¿Desea actualizar?', () => {
              //     this.versionService
              //       .getNewVersion()
              //       .subscribe({
              //         next: newVersionRes => {
              //           let query = '';
              //           let count = 0;

              //           if (newVersionRes.data.sections.length > 0) {
              //             newVersionRes.data.sections.forEach((s: any, i: number, arr: any[]) => {
              //               setTimeout(() => {
              //                 this.databaseService
              //                   .executeQuery(`SELECT * FROM sections WHERE uid = "${s.uid}"`)
              //                   .subscribe({
              //                     next: questionExists => {
              //                       if (questionExists !== DATABASE_WAITING_MESSAGE) {
              //                         if (questionExists.values.length === 0) {
              //                           query += `INSERT INTO sections (uid, name, subname, page, indx, status) VALUES ("${s.uid}", "${s.name}", "${s.subname}", ${s.page}, ${s.indx}, ${s.status}); `
              //                         } else {
              //                           query += `UPDATE sections SET uid = "${s.uid}", name = "${s.name}", subname = "${s.subname}", page = ${s.page}, indx = ${s.indx}, status = ${s.status} WHERE uid = "${s.uid}"; `
              //                         }

              //                         count++;
              //                         if (count === arr.length) {
              //                           this.importQuestions(newVersionRes.data.questions, query, +res.data.number);
              //                         }
              //                       }
              //                     }
              //                   })
              //               }, 50 * i);
              //             });
              //           } else {
              //             this.importQuestions(newVersionRes.data.questions, query, +res.data.number);
              //           }
              //         },
              //         error: err => this.httpResponseService.onError(err, 'No se pudo recuperar la actualización'),
              //       })
              //   });
              // } else {
              //   if (showToast) {
              //     this.httpResponseService.onSuccess('La versión más reciente ya está instalada')
              //   } else {
              //     this.loadingService.dismissLoading();
              //   }
              // }
            },
            error: err => this.httpResponseService.onError(err, 'No se pudo recuperar'),
          });
      })
      .catch(err => this.httpResponseService.onError(err, 'Error al verificar versión local'));
  }

}
