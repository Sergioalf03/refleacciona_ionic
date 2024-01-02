import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { LoadingService } from './loading.service';
import { HttpResponseService } from './http-response.service';

@Injectable({
  providedIn: 'root'
})
export class DownloadPlatformService {

  constructor(
    private platform: Platform,
    private loadingService: LoadingService,
    private responseService: HttpResponseService,
  ) { }

  async downloadBlob(blob: any, name: string, ext: string) {
    const find = ' ';
    const re = new RegExp(find, 'g');
    const filePath = `${name.replace(re, '-')}.${ext}`;

    if (
      this.platform.is('ios') ||
      this.platform.is('android') &&
      !( this.platform.is('desktop') || this.platform.is('mobileweb') )
    ) {

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
    } else {

      if ((window.navigator as any).msSaveOrOpenBlob) {
        (window.navigator as any).msSaveBlob(blob, filePath);
        this.loadingService.dismissLoading();
      } else {
        const downloadLink = window.document.createElement('a');
        const contentTypeHeader = 'text/csv';
        downloadLink.href = window.URL.createObjectURL(
          new Blob([blob], { type: contentTypeHeader })
        );
        downloadLink.download = filePath;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        this.loadingService.dismissLoading();
      }
    }
  }
}
