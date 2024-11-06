import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { URI_GENERAL_COUNT_LIST } from 'src/app/core/constants/uris';
import { ConfirmDialogService } from 'src/app/core/controllers/confirm-dialog.service';
import { DownloadPlatformService } from 'src/app/core/controllers/download-platform.service';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { LoadingService } from 'src/app/core/controllers/loading.service';
import { MapService } from 'src/app/core/controllers/map.service';
import { GeneralCountAuditoryService } from 'src/app/services/general-count-auditory.service';
import { STORAGE_URL } from 'src/environments/environment';

@Component({
  selector: 'app-general-count-auditory-detail',
  templateUrl: './general-count-auditory-detail.page.html',
  styleUrls: ['./general-count-auditory-detail.page.scss'],
})
export class GeneralCountAuditoryDetailPage {

  backUrl = URI_GENERAL_COUNT_LIST('remote');

  names = [
    'Urbano',
    'Sedán',
    'Berlina',
    'Hatchback',
    'Cupé',
    'Descapotable',
    'Deportivo',
    'Todoterreno',
    'Monovolumen',
    'SUV',
    'Furgoneta',
    'Pickup',
  ];

  total = 0;

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
  score: any[] = []

  constructor(
    private auditoryService: GeneralCountAuditoryService,
    private loadingService: LoadingService,
    private responseService: HttpResponseService,
    private mapService: MapService,
    private route: ActivatedRoute,
    // private platform: Platform,
    private router: Router,
    private confirmDialogService: ConfirmDialogService,
    private platformDownloadService: DownloadPlatformService,
  ) { }

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

    this.auditoyrEvidences = data.evidences.map((e: any) => `${STORAGE_URL}/general/${e.dir}`);

    this.counts = data.counts;

    this.total = +this.counts[0].count1 +
      +this.counts[0].count2 +
      +this.counts[0].count3 +
      +this.counts[0].count4 +
      +this.counts[0].count5 +
      +this.counts[0].count6 +
      +this.counts[0].count7 +
      +this.counts[0].count8 +
      +this.counts[0].count9 +
      +this.counts[0].count10 +
      +this.counts[0].count11 +
      +this.counts[0].count12;

    this.counts[0].score1 = (this.counts[0].count1 * 100 / this.total).toFixed(2);
    if (this.counts[0].score1.length < 5) {
      this.counts[0].score1 = `0${this.counts[0].score1}`;
    }
    this.counts[0].score2 = (this.counts[0].count2 * 100 / this.total).toFixed(2);
    if (this.counts[0].score2.length < 5) {
      this.counts[0].score2 = `0${this.counts[0].score2}`;
    }
    this.counts[0].score3 = (this.counts[0].count3 * 100 / this.total).toFixed(2);
    if (this.counts[0].score3.length < 5) {
      this.counts[0].score3 = `0${this.counts[0].score3}`;
    }
    this.counts[0].score4 = (this.counts[0].count4 * 100 / this.total).toFixed(2);
    if (this.counts[0].score4.length < 5) {
      this.counts[0].score4 = `0${this.counts[0].score4}`;
    }
    this.counts[0].score5 = (this.counts[0].count5 * 100 / this.total).toFixed(2);
    if (this.counts[0].score5.length < 5) {
      this.counts[0].score5 = `0${this.counts[0].score5}`;
    }
    this.counts[0].score6 = (this.counts[0].count6 * 100 / this.total).toFixed(2);
    if (this.counts[0].score6.length < 5) {
      this.counts[0].score6 = `0${this.counts[0].score6}`;
    }
    this.counts[0].score7 = (this.counts[0].count7 * 100 / this.total).toFixed(2);
    if (this.counts[0].score7.length < 5) {
      this.counts[0].score7 = `0${this.counts[0].score7}`;
    }
    this.counts[0].score8 = (this.counts[0].count8 * 100 / this.total).toFixed(2);
    if (this.counts[0].score8.length < 5) {
      this.counts[0].score8 = `0${this.counts[0].score8}`;
    }
    this.counts[0].score9 = (this.counts[0].count9 * 100 / this.total).toFixed(2);
    if (this.counts[0].score9.length < 5) {
      this.counts[0].score9 = `0${this.counts[0].score9}`;
    }
    this.counts[0].score10 = (this.counts[0].count10 * 100 / this.total).toFixed(2);
    if (this.counts[0].score10.length < 5) {
      this.counts[0].score10 = `0${this.counts[0].score10}`;
    }
    this.counts[0].score11 = (this.counts[0].count11 * 100 / this.total).toFixed(2);
    if (this.counts[0].score11.length < 5) {
      this.counts[0].score11 = `0${this.counts[0].score11}`;
    }
    this.counts[0].score12 = (this.counts[0].count12* 100 / this.total).toFixed(2);
    if (this.counts[0].score12.length < 5) {
      this.counts[0].score12 = `0${this.counts[0].score12}`;
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

        const data = `${this.names[0]},${this.counts[0].count1}\n` +
        `${this.names[1]},${this.counts[0].count2}\n` +
        `${this.names[2]},${this.counts[0].count3}\n` +
        `${this.names[3]},${this.counts[0].count4}\n` +
        `${this.names[4]},${this.counts[0].count5}\n` +
        `${this.names[5]},${this.counts[0].count6}\n` +
        `${this.names[6]},${this.counts[0].count7}\n` +
        `${this.names[7]},${this.counts[0].count8}\n` +
        `${this.names[8]},${this.counts[0].count9}\n` +
        `${this.names[9]},${this.counts[0].count10}\n` +
        `${this.names[10]},${this.counts[0].count11}\n` +
        `${this.names[11]},${this.counts[0].count12}`;

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
