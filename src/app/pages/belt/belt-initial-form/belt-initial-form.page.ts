import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { URI_BELT_COUNT_FORM, URI_BELT_LIST, URI_HOME } from 'src/app/core/constants/uris';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { LoadingService } from 'src/app/core/controllers/loading.service';
import { BeltAuditoryService } from 'src/app/services/belt-auditory.service';
import { DATABASE_WAITING_MESSAGE } from 'src/app/core/constants/message-code';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-belt-initial-form',
  templateUrl: './belt-initial-form.page.html',
})
export class BeltInitialFormPage {

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
                          this.responseService.onSuccessAndRedirect(URI_BELT_COUNT_FORM(this.auditoryId), 'Registro guardado');
                        }, 20)
                      }

                    }
                  });
              }, 20)
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
          next: (updateRes) => {
            if (updateRes !== DATABASE_WAITING_MESSAGE) {
              this.responseService.onSuccessAndRedirect(URI_BELT_LIST('local'), 'Registro actualizado');
            }
          },
          error: err => {
            this.responseService.onError(err, 'No se pudo actualizar')
          },
        })
    }
  }

  auditoryId = '0';
  backUrl = URI_HOME();

  constructor(
    private auditoryService: BeltAuditoryService,
    private route: ActivatedRoute,
    private responseService: HttpResponseService,
    private loadingService: LoadingService,
  ) { }

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
            this.backUrl = URI_BELT_LIST('local');
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
                    this.setAuditory({
                      id: this.auditoryId,
                      ...res.values[0]
                    });
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
