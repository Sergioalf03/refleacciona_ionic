import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { DIRECTIONS } from 'src/app/core/constants/directions';
import { URI_HELMET_LIST } from 'src/app/core/constants/uris';
import { ConfirmDialogService } from 'src/app/core/controllers/confirm-dialog.service';
import { DownloadPlatformService } from 'src/app/core/controllers/download-platform.service';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { LoadingService } from 'src/app/core/controllers/loading.service';
import { MapService } from 'src/app/core/controllers/map.service';
import { HelmetAuditoryService } from 'src/app/services/helmet-auditory.service';
import { STORAGE_URL } from 'src/environments/environment';

const directions = DIRECTIONS;

@Component({
  selector: 'app-helmet-auditory-detail',
  templateUrl: './helmet-auditory-detail.page.html',
})
export class HelmetAuditoryDetailPage {

    backUrl = URI_HELMET_LIST('remote');

    auditoryId = '0';

    auditoryTitle = '';
    auditoryDate = '';
    auditoryTime = '';
    auditoryDescription = '';
    auditoryCloseNote = '';
    auditoryLat = '';
    auditoryLng = '';

    yesScore = 0;
    notScore = 0;

    auditoyrEvidences: any[] = [];
    auditorySections: any[] = [];

    counts: any[] = [];

    constructor(
      private auditoryService: HelmetAuditoryService,
      private loadingService: LoadingService,
      private responseService: HttpResponseService,
      private mapService: MapService,
      private route: ActivatedRoute,
      // private platform: Platform,
      private router: Router,
      private confirmDialogService: ConfirmDialogService,
      private platformDownloadService: DownloadPlatformService,
    ) {}

    ionViewWillEnter() {
      this.route
        .paramMap
        .subscribe({
          next: paramMap => {
            if (!paramMap.has('id')) {
              this.router.navigateByUrl(this.backUrl);
              return;
            }

            this.loadingService.showLoading();

            this.auditoryId = paramMap.get('id') || '0';

            this.auditoryService
              .getRemoteDetail(this.auditoryId)
              .subscribe({
                next: res => {
                  this.setAuditory(res.data);
                },
                error: err => this.responseService.onError(err, 'No se pudo recuperar la auditoría'),
              })
          }
        }).unsubscribe();
    }

    private setAuditory(data: any) {
      this.auditoryTitle = data.title;
      this.auditoryDate = data.date;
      this.auditoryTime = data.time;

      this.auditoryDescription = data.description;
      this.auditoryCloseNote = data.close_note;
      this.auditoryLat = data.lat;
      this.auditoryLng = data.lng;

      this.auditoyrEvidences = data.evidences.map((e: any) => `${STORAGE_URL}/helmet/${e.dir}.jpeg`)

      this.counts = data.counts;

      this.mapService.setCenter(+this.auditoryLat, +this.auditoryLng, true);
      setTimeout(() => {
        this.loadingService.dismissLoading();
      }, 500)
    }

    downloadCsv() {
      this.confirmDialogService
      .presentAlert('¿Desea descargar en formato CSV?', () => {
        const headers = 'Tipo,conteo\n';

        const data = 'Sin Casco,' + this.counts[0].users_count + '\nCon Casco,' + this.counts[0].helmets_count;

        const blob = new Blob([`${headers}${data}`], {
          type: "text/csv"
        });

        this.platformDownloadService.downloadBlob(blob, this.auditoryTitle, 'csv');
      });

    }

    downloadPdf() {
      this.confirmDialogService
      .presentAlert('¿Desea descargar en formato PDF?', () => {
        this.loadingService.showLoading();
        this.auditoryService
          .downloadPdf(this.auditoryId)
          .subscribe({
            next: async res => this.platformDownloadService.downloadBlob(res, this.auditoryTitle, 'pdf'),
            error: err => this.responseService.onError(err, 'No se pudo descargar el levantamiento')
          });
        });
    }

    onGoingBack() {
      this.router.navigateByUrl(this.backUrl);
    }

}
