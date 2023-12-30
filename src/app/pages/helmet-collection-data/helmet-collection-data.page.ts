import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DATABASE_WAITING_MESSAGE } from 'src/app/core/constants/message-code';
import { URI_HELMET_COUNT_FORM, URI_HELMET_COUNT_LIST, URI_HELMET_FORM, URI_HELMET_LIST } from 'src/app/core/constants/uris';
import { ConfirmDialogService } from 'src/app/core/controllers/confirm-dialog.service';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { LoadingService } from 'src/app/core/controllers/loading.service';
import { HelmetAuditoryService } from 'src/app/services/helmet-auditory.service';
import { HelmetCollectionService } from 'src/app/services/helmet-collection.service';

@Component({
  selector: 'app-helmet-collection-data',
  templateUrl: './helmet-collection-data.page.html'
})
export class HelmetCollectionDataPage implements OnInit {

  backUrl = URI_HELMET_FORM('0');
  registrationCount = 0;
  auditoryId = '0';

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private helmetCollectionService: HelmetCollectionService,
    private helmetAuditoryService: HelmetAuditoryService,
    private responseService: HttpResponseService,
    private confirmDialogService: ConfirmDialogService,
    private loadingService: LoadingService,
  ) { }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.activatedRoute
      .paramMap
      .subscribe({
        next: paramMap => {
          this.auditoryId = paramMap.get('id') || '0';
          const from = paramMap.get('from') || '0';

          if (from !== '0') {
            this.backUrl = URI_HELMET_LIST('local');
          }

          this.helmetCollectionService
            .getCount(this.auditoryId)
            .subscribe({
              next: res => {
                if (res !== DATABASE_WAITING_MESSAGE) {
                  this.registrationCount = res.values[0].total;
                }
              },
              error: err => {
                this.responseService.onError(err, 'No se pudo guardar el conteo');
              }
            });
        }
      }).unsubscribe();;


  }

  openCountForm() {
    this.router.navigateByUrl(URI_HELMET_COUNT_FORM(this.auditoryId));
  }

  onOpenList() {
    this.router.navigateByUrl(URI_HELMET_COUNT_LIST(this.auditoryId));
  }

  onReturn() {
    this.router.navigateByUrl(this.backUrl);
  }

  onFinish() {
    this.confirmDialogService
      .presentAlert('Desea terminar el levantamiento', () => {
        this.loadingService.showLoading();
        this.helmetAuditoryService
          .finishAuditory(this.auditoryId)
          .subscribe({
            next: (updateRes) => {
              if (updateRes !== DATABASE_WAITING_MESSAGE) {
                this.loadingService.dismissLoading();
                this.responseService.onSuccessAndRedirect(URI_HELMET_LIST('local'), 'Levantamiento actualizado');
              }
            },
            error: err => {
              this.responseService.onError(err, 'No se pudo actualizar')
            },
          })
      })
  }

}
