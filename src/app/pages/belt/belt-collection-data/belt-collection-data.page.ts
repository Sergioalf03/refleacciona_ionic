import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DATABASE_WAITING_MESSAGE } from 'src/app/core/constants/message-code';
import { URI_BELT_COUNT_FORM, URI_BELT_COUNT_LIST, URI_BELT_FORM, URI_BELT_LIST } from 'src/app/core/constants/uris';
import { ConfirmDialogService } from 'src/app/core/controllers/confirm-dialog.service';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { LoadingService } from 'src/app/core/controllers/loading.service';
import { BeltAuditoryService } from 'src/app/services/belt-auditory.service';
import { BeltCollectionService } from 'src/app/services/belt-collection.service';

@Component({
  selector: 'app-belt-collection-data',
  templateUrl: './belt-collection-data.page.html',
})
export class BeltCollectionDataPage implements OnInit {

  backUrl = URI_BELT_FORM('0');
  registrationCount = 0;
  auditoryId = '0';

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private beltCollectionService: BeltCollectionService,
    private beltAuditoryService: BeltAuditoryService,
    private responseService: HttpResponseService,
    private confirmDialogService: ConfirmDialogService,
    private loadingService: LoadingService,
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.activatedRoute
      .paramMap
      .subscribe({
        next: paramMap => {
          this.auditoryId = paramMap.get('id') || '0';
          const from = paramMap.get('from') || '0';

          if (from !== '0') {
            this.backUrl = URI_BELT_LIST('local');
          }

          this.beltCollectionService
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
      }).unsubscribe();
  }

  openCountForm() {
    this.router.navigateByUrl(URI_BELT_COUNT_FORM(this.auditoryId));
  }

  onOpenList() {
    this.router.navigateByUrl(URI_BELT_COUNT_LIST(this.auditoryId));
  }

  onReturn() {
    this.router.navigateByUrl(this.backUrl);
  }

  onFinish() {
    this.confirmDialogService
      .presentAlert('¿Desea terminar el registro?', () => {
        this.loadingService.showLoading();
        this.beltAuditoryService
          .finishAuditory(this.auditoryId)
          .subscribe({
            next: (updateRes) => {
              if (updateRes !== DATABASE_WAITING_MESSAGE) {
                this.loadingService.dismissLoading();
                this.responseService.onSuccessAndRedirect(URI_BELT_LIST('local'), 'Registro terminado');
              }
            },
            error: err => {
              this.responseService.onError(err, 'No se pudo actualizar')
            },
          })
      })
  }

}
