import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { DIRECTIONS } from 'src/app/core/constants/directions';
import { URI_BELT_LIST } from 'src/app/core/constants/uris';
import { VEHICLE_TYPES } from 'src/app/core/constants/vehicle-types';
import { ConfirmDialogService } from 'src/app/core/controllers/confirm-dialog.service';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { LoadingService } from 'src/app/core/controllers/loading.service';
import { MapService } from 'src/app/core/controllers/map.service';
import { BeltAuditoryService } from 'src/app/services/belt-auditory.service';
import { STORAGE_URL } from 'src/environments/environment';

const directions = DIRECTIONS;
const vehicleTypes = VEHICLE_TYPES;

@Component({
  selector: 'app-belt-auditory-detail',
  templateUrl: './belt-auditory-detail.page.html',
})
export class BeltAuditoryDetailPage {

  backUrl = URI_BELT_LIST('remote');
  customButton = {
    click: async () => {
      this.confirmDialogService
        .presentAlert('¿Desea descargar el levantamiento?', () => {
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
        })
    },
    icon: 'cloud-download',
  }

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
    private auditoryService: BeltAuditoryService,
    private loadingService: LoadingService,
    private responseService: HttpResponseService,
    private mapService: MapService,
    private route: ActivatedRoute,
    // private platform: Platform,
    private router: Router,
    private confirmDialogService: ConfirmDialogService,
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

    this.auditoyrEvidences = data.auditory.evidences.map((e: any) => `${STORAGE_URL}/belt/${e.dir}.jpeg`);

    this.counts = data.counts.map((c: any) => {

      return {
        originText: directions.find(d => +d.id === +c.origin)!.short,
        destinationText: directions.find(d => +d.id === +c.destination)!.short,
        vehicleTypeText: vehicleTypes.find(v => +v.id === +c.vehicle_type)!.text,
        ...c,
      };
    });

    this.mapService.setCenter(+this.auditoryLat, +this.auditoryLng, true);
    setTimeout(() => {
      this.loadingService.dismissLoading();
    }, 500)
  }
}
