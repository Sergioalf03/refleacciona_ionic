import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {  URI_HELMET_COUNT_FORM, URI_HELMET_LIST, URI_HOME } from 'src/app/core/constants/uris';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { LoadingService } from 'src/app/core/controllers/loading.service';
import { HelmetAuditoryService } from 'src/app/services/helmet-auditory.service';
import { DATABASE_WAITING_MESSAGE } from 'src/app/core/constants/message-code';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-helmet-initial-form',
  templateUrl: './helmet-initial-form.page.html',
})
export class HelmetInitialFormPage {

  showForm = false;
  setFormObs = new BehaviorSubject<any>(undefined);

  functions = {
    create: async (auditory: any) => {
      this.helmetAuditoryService
        .localSave(auditory)
        .subscribe({
          next: (save) => {
            if (save !== DATABASE_WAITING_MESSAGE) {

              setTimeout(() => {
                this.helmetAuditoryService
                  .getLastSavedId()
                  .subscribe({
                    next: async res => {
                      if (res !== DATABASE_WAITING_MESSAGE) {

                        setTimeout(() => {
                          this.auditoryId = res.values[0].id;
                          this.responseService.onSuccessAndRedirect(URI_HELMET_COUNT_FORM(this.auditoryId), 'Conteo guardado');
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
      this.helmetAuditoryService
        .updateLocal(this.auditoryId, auditory)
        .subscribe({
          next: (updateRes) => {
            if (updateRes !== DATABASE_WAITING_MESSAGE) {
              this.responseService.onSuccessAndRedirect(URI_HELMET_LIST('local'), 'Registro actualizado');
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
    private helmetAuditoryService: HelmetAuditoryService,
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
          // this.hideMap = false;
          let id = paramMap.get('id') || '0';
          if (id === '00') {
            this.backUrl = URI_HELMET_LIST('local');
            id = '0';
          }
          if (id !== '0') {
            this.loadingService.showLoading();
            this.auditoryId = id;
            this.helmetAuditoryService
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
