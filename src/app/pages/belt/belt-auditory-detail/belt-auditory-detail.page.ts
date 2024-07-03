import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { URI_BELT_LIST } from 'src/app/core/constants/uris';
import { ConfirmDialogService } from 'src/app/core/controllers/confirm-dialog.service';
import { DownloadPlatformService } from 'src/app/core/controllers/download-platform.service';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { LoadingService } from 'src/app/core/controllers/loading.service';
import { MapService } from 'src/app/core/controllers/map.service';
import { BeltAuditoryService } from 'src/app/services/belt-auditory.service';
import { STORAGE_URL } from 'src/environments/environment';

@Component({
  selector: 'app-belt-auditory-detail',
  templateUrl: './belt-auditory-detail.page.html',
  styleUrls: ['./belt-auditory-detail.page.scss']
})
export class BeltAuditoryDetailPage {

  backUrl = URI_BELT_LIST('remote');

  auditoryId = '0';

  auditoryTitle = '';
  auditoryDate = '';
  auditoryTime = '';
  auditoryDescription = '';
  auditoryCloseNote = '';
  auditoryLat = '';
  auditoryLng = '';

  yesScore = '0';
  notScore = '0';
  chairScore = '0';
  total = 0;

  auditoyrEvidences: any[] = [];
  auditorySections: any[] = [];

  counts: any[] = [];

  constructor(
    private auditoryService: BeltAuditoryService,
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

    this.auditoyrEvidences = data.evidences.map((e: any) => `${STORAGE_URL}/belt/${e.dir}`);

    this.counts = data.counts;

    this.total = this.counts[0].adults_count + this.counts[0].belts_count + this.counts[0].chairs_count;

    this.notScore = (this.counts[0].adults_count * 100 / this.total).toFixed(2);
    if (this.notScore.length < 5) {
      this.notScore = `0${this.notScore}`;
    }

    this.yesScore = (this.counts[0].belts_count * 100 / this.total).toFixed(2);
    if (this.yesScore.length < 5) {
      this.yesScore = `0${this.yesScore}`;
    }

    this.chairScore = (this.counts[0].chairs_count * 100 / this.total).toFixed(2);
    if (this.chairScore.length < 5) {
      this.chairScore = `0${this.chairScore}`;
    }


    this.mapService.setCenter(+this.auditoryLat, +this.auditoryLng, true);
    setTimeout(() => {
      this.loadingService.dismissLoading();
    }, 500)
  }

  downloadCsv() {
    this.confirmDialogService
      .presentAlert('¿Desea descargar en formato CSV?', () => {
        const headers = 'Tipo,conteo\n';

        const data = 'Sin Cinturón,' + this.counts[0].adults_count + '\nCon Cinturón,' + this.counts[0].belts_count + '\nCon Silla de Retención,' + this.counts[0].chairs_count + '\n';

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
            error: (err: any) => this.responseService.onError(err, 'No se pudo descargar el archivo')
          });
      });
  }

  onGoingBack() {
    this.router.navigateByUrl(this.backUrl);
  }

}
