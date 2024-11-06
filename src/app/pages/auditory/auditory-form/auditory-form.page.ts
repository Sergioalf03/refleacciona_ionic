import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { AuditoryService } from 'src/app/services/auditory.service';
import { AuditoryEvidenceService } from 'src/app/services/auditory-evidence.service';
import { Platform } from '@ionic/angular';
import { LoadingService } from 'src/app/core/controllers/loading.service';
import { URI_AUDITORY_LIST, URI_HOME, URI_QUESTION_FORM } from 'src/app/core/constants/uris';
import { DATABASE_WAITING_MESSAGE } from 'src/app/core/constants/message-code';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-auditory-form',
  templateUrl: './auditory-form.page.html',
})
export class AuditoryFormPage {

  showForm = false;
  setFormObs = new BehaviorSubject<any>(undefined);

  functions = {
    create: async (auditory: any) => {
      this.auditoryService
        .localSave(auditory)
        .subscribe({
          next: (save) => {
            if (save !== DATABASE_WAITING_MESSAGE) {

              setTimeout(() => {
                this.auditoryService
                  .getLastSavedId()
                  .subscribe({
                    next: async res => {
                      if (res !== DATABASE_WAITING_MESSAGE) {

                        setTimeout(() => {
                          this.auditoryId = res.values[0].id;
                          this.responseService.onSuccessAndRedirect(URI_QUESTION_FORM(this.auditoryId), 'Auditoría guarda');

                        }, 20)
                      }

                    }
                  });
              }, 20);
            }
          },
          error: err => {
            this.responseService.onError(err, 'No se pudo guardar')
          },
        })
    },
    update: async (auditory: any) => {
      this.auditoryService
        .updateLocal(this.auditoryId, auditory)
        .subscribe({
          next: (updateRes: any) => {
            if (updateRes !== DATABASE_WAITING_MESSAGE) {
              this.responseService.onSuccessAndRedirect(URI_AUDITORY_LIST('local'), 'Registro actualizado');
            }
          },
          error: (err: any) => {
            this.responseService.onError(err, 'No se pudo actualizar')
          },
        })
    }
  }

  auditoryId = '0';
  backUrl = URI_HOME();

  constructor(
    public auditoryService: AuditoryService,
    public auditoryEvidenceService: AuditoryEvidenceService,
    private router: Router,
    private route: ActivatedRoute,
    private responseService: HttpResponseService,
    private loadingService: LoadingService,
    private platform: Platform,
  ) {
    this.platform
      .backButton
      .subscribeWithPriority(9999, () => {
        this.router.navigateByUrl(this.backUrl);
        return;
        // processNextHandler();
      });
  }


  private setAuditory(auditory: any) {
    this.setFormObs.next({
      title: auditory.title,
      description: auditory.description,
      date: auditory.date,
      time: auditory.time,
      lat: auditory.lat,
      lng: auditory.lng,
      location: 'Ubicación seleccionada',
    });
  }

  ionViewWillEnter() {
    this.showForm = true;
    this.route
      .paramMap
      .subscribe({
        next: paramMap => {
          let id = paramMap.get('id') || '0';
          if (id === '00') {
            this.backUrl = URI_AUDITORY_LIST('local');
            id = '0';
          }
          if (id !== '0') {
            this.loadingService.showLoading();
            this.auditoryId = id;
            this.auditoryService
              .getLocalForm(this.auditoryId)
              .subscribe({
                next: res => {
                  if (res !== DATABASE_WAITING_MESSAGE) {
                    setTimeout(() => {
                      this.setAuditory({
                        id: this.auditoryId,
                        ...res.values[0]
                      });
                    }, 20);
                  }
                },
                error: err => {
                  this.responseService.onError(err, 'No se pudieron recuperar los datos');
                },
              })
          }
        }
      }).unsubscribe();
  }


}
