import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { URI_AUDITORY_LIST } from 'src/app/core/constants/uris';
import { ConfirmDialogService } from 'src/app/core/controllers/confirm-dialog.service';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { LoadingService } from 'src/app/core/controllers/loading.service';
import { MapService } from 'src/app/core/controllers/map.service';
import { AuditoryService } from 'src/app/services/auditory.service';
import { STORAGE_URL } from 'src/environments/environment';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { DownloadPlatformService } from 'src/app/core/controllers/download-platform.service';


@Component({
  selector: 'app-auditory-detail',
  templateUrl: './auditory-detail.page.html',
})
export class AuditoryDetailPage {

  backUrl = URI_AUDITORY_LIST('remote');

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

  constructor(
    private auditoryService: AuditoryService,
    private loadingService: LoadingService,
    private responseService: HttpResponseService,
    private mapService: MapService,
    private route: ActivatedRoute,
    private platform: Platform,
    private router: Router,
    private confirmDialogService: ConfirmDialogService,
    private platformDownloadService: DownloadPlatformService,
  ) {
    this.platform
      .backButton
      .subscribeWithPriority(9999, () => {
        this.router.navigateByUrl(this.backUrl);
        return;
        // processNextHandler();
      });
  }

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
    this.auditoryTitle = data.auditory.title;
    this.auditoryDate = data.auditory.date;
    this.auditoryTime = data.auditory.time;

    this.auditoryDescription = data.auditory.description;
    this.auditoryCloseNote = data.auditory.close_note;
    this.auditoryLat = data.auditory.lat;
    this.auditoryLng = data.auditory.lng;

    this.auditoyrEvidences = data.auditory.evidences.map((e: any) => `${STORAGE_URL}/auditories/${e.dir}.jpeg`)

    this.auditorySections = data.sections;

    this.auditorySections.forEach(s => s.answers = s.answers
      .map((a: any) => {
        if (+a.score !== 0) {
          if (+a.answer === 1) {
            this.yesScore++;
          } else {
            this.notScore++;
          }
        }

        const ans = a.answers.startsWith('[') ? JSON.parse(a.answers).find((pa: any) => +pa.v === +a.answer) : undefined;
        return { ...a, formattedAnswer: ans ? ans.t : a.answer }
      })
      .sort((a: any, b: any) => a.indx - b.indx)
    );

    this.auditorySections.sort((a, b) => a.indx - b.indx)

    this.mapService.setCenter(+this.auditoryLat, +this.auditoryLng, true);
    setTimeout(() => {
      this.loadingService.dismissLoading();
    }, 500)
  }

  answerEvicenceUrl(dir: string) {
    return `${STORAGE_URL}/answers/${dir}.jpeg`;
  }

  public downloadCsv() {
    this.confirmDialogService
      .presentAlert('¿Desea descargar en formato CSV?', () => {
        this.loadingService.showLoading();
        const headers = 'Sección,SubSección,Identificador,Pregunta,Respuesta\n';

        const data = this.auditorySections.map((s: any) => s.answers.map((a: any) => `${s.name},${s.subname ? s.subname : '-' },${a.uid},${a.sentence.replace(',', ';')},${a.formattedAnswer}`).join('\n')).join('\n');

        const blob = new Blob([`${headers}${data}`], {
          type: "text/csv"
        });

        this.platformDownloadService.downloadBlob(blob, this.auditoryTitle, 'csv');
      });
  }

  public downloadPdf() {
    this.confirmDialogService
      .presentAlert('¿Desea descargar en formato PDF?', () => {

        this.loadingService.showLoading();
        this.auditoryService
          .downloadPdf(this.auditoryId)
          .subscribe({
            next: async res => this.platformDownloadService.downloadBlob(res, this.auditoryTitle, 'pdf'),
            error: err => this.responseService.onError(err, 'No se pudo descargar la auditoría')
          })
      });
  }

  onGoingBack() {
    this.router.navigateByUrl(this.backUrl);
  }

}
