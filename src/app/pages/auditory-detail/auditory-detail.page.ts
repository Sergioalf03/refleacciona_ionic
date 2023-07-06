import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { LoadingService } from 'src/app/core/controllers/loading.service';
import { MapService } from 'src/app/core/controllers/map.service';
import { AuditoryService } from 'src/app/services/auditory.service';
import { STORAGE_URL } from 'src/environments/environment';

@Component({
  selector: 'app-auditory-detail',
  templateUrl: './auditory-detail.page.html',
})
export class AuditoryDetailPage {

  backUrl = 'auditory-list';
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
    private router: Router,
  ) { }

  ionViewWillEnter() {
    this.route
      .paramMap
      .subscribe({
        next: paramMap => {
          if (!paramMap.has('id')) {
            this.router.navigateByUrl('/auditory-list');
            return;
          }

          this.loadingService.showLoading();

          this.auditoryId = paramMap.get('id') || '0';

          this.auditoryService
            .getRemoteDetail(this.auditoryId)
            .subscribe({
              next: res => {
                console.log(res)
                this.setAuditory(res.data);
              },
              error: err => this.responseService.onError(err, 'No se pudo recuperar la auditoría'),
            })
        }
      })
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
      console.log(this.auditorySections)
      this.loadingService.dismissLoading();
    }, 500)
  }

  answerEvicenceUrl(dir: string) {
    return `${STORAGE_URL}/answers/${dir}.jpeg`;
  }

}
