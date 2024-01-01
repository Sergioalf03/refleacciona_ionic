import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { DIRECTIONS } from 'src/app/core/constants/directions';
import { URI_GENERAL_COUNT_LIST } from 'src/app/core/constants/uris';
import { VEHICLE_TYPES } from 'src/app/core/constants/vehicle-types';
import { ConfirmDialogService } from 'src/app/core/controllers/confirm-dialog.service';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { LoadingService } from 'src/app/core/controllers/loading.service';
import { MapService } from 'src/app/core/controllers/map.service';
import { GeneralCountAuditoryService } from 'src/app/services/general-count-auditory.service';
import { STORAGE_URL } from 'src/environments/environment';

const directions = DIRECTIONS;
const vehicleTypes = VEHICLE_TYPES;

@Component({
  selector: 'app-general-count-auditory-detail',
  templateUrl: './general-count-auditory-detail.page.html',
})
export class GeneralCountAuditoryDetailPage {

  backUrl = URI_GENERAL_COUNT_LIST('remote');
  customButton = {
    click: async () => {
      this.confirmDialogService
        .presentAlert('¿Desea descargar el levantamiento?', () => {
          this.downloadCsv();

        })
    },
    icon: 'cloud-download',
  }

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
    'Pickup'
  ];

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
    private auditoryService: GeneralCountAuditoryService,
    private loadingService: LoadingService,
    private responseService: HttpResponseService,
    private mapService: MapService,
    private route: ActivatedRoute,
    // private platform: Platform,
    private router: Router,
    private confirmDialogService: ConfirmDialogService,
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

    this.auditoyrEvidences = data.evidences.map((e: any) => `${STORAGE_URL}/general/${e.dir}.jpeg`);

    this.counts = data.counts;

    console.log(this.counts)

    this.mapService.setCenter(+this.auditoryLat, +this.auditoryLng, true);
    setTimeout(() => {
      this.loadingService.dismissLoading();
    }, 500)
  }

  private downloadCsv() {
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

    const filename = `data.csv`;

    if ((window.navigator as any).msSaveOrOpenBlob) {
      (window.navigator as any).msSaveBlob(blob, filename);
      this.loadingService.dismissLoading();
    } else {
      const downloadLink = window.document.createElement('a');
      const contentTypeHeader = 'text/csv';
      downloadLink.href = window.URL.createObjectURL(
        new Blob([blob], { type: contentTypeHeader })
      );
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      this.loadingService.dismissLoading();
    }

  }

  downloadPdf() {
    this.loadingService.showLoading();
          this.auditoryService
            .downloadPdf(this.auditoryId)
            .subscribe({
              next: async (res: any) => {
                const blob = res;

                const find = ' ';
                const re = new RegExp(find, 'g');
                const filePath = `${this.auditoryTitle.replace(re, '-')}.pdf`;

                const fileReader = new FileReader();

                fileReader.readAsDataURL(blob);

                fileReader.onloadend = async () => {
                  const base64Data: any = fileReader.result;

                  Filesystem.writeFile({
                    path: filePath,
                    data: base64Data,
                    directory: Directory.Cache,
                  }).then(() => {
                    return Filesystem.getUri({
                      directory: Directory.Cache,
                      path: filePath
                    });
                  })
                    .then((uriResult) => {
                      return Share.share({
                        title: filePath,
                        text: filePath,
                        url: uriResult.uri,
                      });
                    }).then(() => {
                      this.loadingService.dismissLoading();
                    })
                    .catch(err => this.responseService.onError(err, 'No se pudo descargar el levantamiento'));
                }
              },
              error: (err: any) => this.responseService.onError(err, 'No se pudo descargar el levantamiento')
            })
  }

}
