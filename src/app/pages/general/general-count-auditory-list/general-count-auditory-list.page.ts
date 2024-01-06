import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { ActionSheetController, Platform } from '@ionic/angular';
import { DATABASE_WAITING_MESSAGE } from 'src/app/core/constants/message-code';
import { URI_GENERAL_COUNT_COLLECION_DETAIL, URI_GENERAL_COUNT_COUNT_FORM, URI_GENERAL_COUNT_DETAIL, URI_GENERAL_COUNT_FORM, URI_HOME } from 'src/app/core/constants/uris';
import { ConfirmDialogService } from 'src/app/core/controllers/confirm-dialog.service';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { LoadingService } from 'src/app/core/controllers/loading.service';
import { PhotoService } from 'src/app/core/controllers/photo.service';
import { GeneralCountAuditoryEvidenceService } from 'src/app/services/general-count-auditory-evidence.service';
import { GeneralCountAuditoryService } from 'src/app/services/general-count-auditory.service';
import { GeneralCountCollectionService } from 'src/app/services/general-count-collection.service';

@Component({
  selector: 'app-general-count-auditory-list',
  templateUrl: './general-count-auditory-list.page.html',
})
export class GeneralCountAuditoryListPage {

  auditories: any[] = [];
  sendedList = false;
  loading = false;

  customButton = {
    click: () => this.router.navigateByUrl(this.formUri),
    icon: 'add',
  }

  backUri = URI_HOME();
  formUri = URI_GENERAL_COUNT_FORM('00');

  constructor(
    private auditoryService: GeneralCountAuditoryService,
    private auditoryEvidenceService: GeneralCountAuditoryEvidenceService,
    private helmetCollectionService: GeneralCountCollectionService,
    private photoService: PhotoService,
    private responseService: HttpResponseService,
    private loadingService: LoadingService,
    private router: Router,
    private confirmDialogService: ConfirmDialogService,
    private actionSheetCtrl: ActionSheetController,
    private route: ActivatedRoute,
    private platform: Platform,
  ) {
    this.platform
      .backButton
      .subscribeWithPriority(9999, () => {
        this.router.navigateByUrl(this.backUri);
        return;
        // processNextHandler();
      });
  }

  async ionViewWillEnter() {
    this.route
      .paramMap
      .subscribe({
        next: paramMap => {
          if (!paramMap.has('origin')) {
            this.router.navigateByUrl(this.backUri)
            return;
          }

          if (paramMap.get('origin') === 'remote') {
            this.fetchRemoteList();
          } else {
            this.fetchLocalList();
          }
        }
      }).unsubscribe();
  }

  onGoingHome() {
    this.router.navigateByUrl(this.backUri);
  }

  private onEdit(id: string) {
    this.router.navigateByUrl(URI_GENERAL_COUNT_FORM(id));
  }

  onNewAuditory() {
    this.router.navigateByUrl(URI_GENERAL_COUNT_FORM('00'));
  }

  private onUpload(id: string) {
    this.confirmDialogService
      .presentAlert('Una vez enviado el conteo no se podrá modificar. ¿Desea continuar?', () => {
        this.loadingService.showLoading();

        this.auditoryService
          .getUpdateData(id)
          .subscribe({
            next: auditory => {
              if (auditory !== DATABASE_WAITING_MESSAGE) {

                setTimeout(() => {
                  this.helmetCollectionService
                    .getList(id)
                    .subscribe({
                      next: counts => {
                        if (counts !== DATABASE_WAITING_MESSAGE) {

                          const formattedAuditory = {
                            title: auditory.values[0].title,
                            description: auditory.values[0].description,
                            close_note: auditory.values[0].close_note,
                            date: auditory.values[0].date,
                            time: auditory.values[0].time,
                            lat: auditory.values[0].lat,
                            lng: auditory.values[0].lng,
                            status: auditory.values[0].status,
                            creation_date: auditory.values[0].creation_date,
                            update_date: auditory.values[0].update_date,
                            external_id: auditory.values[0].id,
                            user_id: auditory.values[0].user_id,
                          }

                          const formattedCounts = counts.values.map((c: any) => ({
                            helmet_auditory_id: c.helmet_auditory_id,
                            count1: c.count1,
                            count2: c.count2,
                            count3: c.count3,
                            count4: c.count4,
                            count5: c.count5,
                            count6: c.count6,
                            count7: c.count7,
                            count8: c.count8,
                            count9: c.count9,
                            count10: c.count10,
                            count11: c.count11,
                            count12: c.count12,
                            creation_date: c.creation_date,
                          }));

                          const data = {
                            auditory: formattedAuditory,
                            counts: formattedCounts,
                          }

                          this.auditoryService
                            .upload(data)
                            .subscribe({
                              next: res => {
                                const externalId = res.data.id;
                                this.auditoryService
                                  .updateExternalId(id, externalId)
                                  .subscribe({
                                    next: updated => {
                                      if (updated !== DATABASE_WAITING_MESSAGE) {
                                        setTimeout(() => {
                                          this.uploadAuditoryPhotos(id, externalId);
                                        }, 20);
                                      }
                                    }
                                  })
                              },
                              error: err => this.responseService.onError(err, 'No se pudo subir la auditoría'),
                            })
                        }
                      }
                    })
                }, 20)

              }
            }
          })
      });
  }

  private uploadAuditoryPhotos(localId: string, extenalId: string) {
    this.auditoryEvidenceService
      .getEvidencesByAuditory(localId)
      .subscribe({
        next: async evidences => {
          if (evidences !== DATABASE_WAITING_MESSAGE) {
            this.uploadAuditoryEvidence(evidences.values, 0, extenalId)
              .then(result => {
                this.auditoryService
                  .finalDelete(localId)
                  .subscribe({
                    next: auditoryDelete => {
                      if (auditoryDelete !== DATABASE_WAITING_MESSAGE) {
                        this.responseService.onSuccess('Auditoría enviada exitósamente');
                        setTimeout(() => {
                          this.fetchLocalList();
                        }, 100)
                      }
                    },
                  });
              })
          }
        }
      });
  }

  private async uploadAuditoryEvidence(arr: any, index: number, externalId: string) {
    const resultPromise = new Promise(async (res, rej) => {
      if (index === arr.length) {
        return res(true);
      }

      const ImageSrc = await this.photoService.getLocalAuditoryEvidenceUri(arr[index].dir).then(photo => photo.uri);
      const blob = await fetch(Capacitor.convertFileSrc(ImageSrc)).then(r => {
        return r.blob()
      });

      this.auditoryEvidenceService
        .uploadImage(blob, externalId, arr[index].creation_date, arr[index].dir)
        .subscribe({
          next: () => {
            this.photoService
              .removeLocalAuditoryEvidence(arr[index].dir)
              .then(() => {
                this.auditoryEvidenceService
                  .localRemove(arr[index].dir)
                  .subscribe({
                    next: dlt => {
                      if (dlt !== DATABASE_WAITING_MESSAGE) {
                        this.uploadAuditoryEvidence(arr, index + 1, externalId).then(r => res(r))
                      }
                    }
                  });
              });
          },
          error: err => this.responseService.onError(err, 'No se pudo subir la imagen'),
        });
    })

    return resultPromise;
  }

  private onDelete(id: string) {
    this.confirmDialogService.presentAlert('¿Desea eliminar el registro?', () => {
      this.loadingService.showLoading();
      this.auditoryService
        .deleteLocal(id)
        .subscribe({
          next: (rm) => {
            if (rm !== DATABASE_WAITING_MESSAGE) {
              this.responseService.onSuccess('Registro eliminado');
              setTimeout(() => {
                this.fetchLocalList();
              }, 100)
            }
          },
          error: err => {
            this.responseService.onError(err, 'No se pudo eliminar el registro');
          }
        })
    });
  }

  private onDetail(id: string) {
    this.router.navigateByUrl(URI_GENERAL_COUNT_COUNT_FORM(id));
  }

  onRemoteDetail(id: string) {
    this.router.navigateByUrl(URI_GENERAL_COUNT_DETAIL(id));
  }

  private onDownloadPdf(id: string, title: string) {
    this.confirmDialogService
      .presentAlert('¿Desea descargar el conteo?', () => {
        this.loadingService.showLoading();
        this.auditoryService
          .downloadPdf(id)
          .subscribe({
            next: res => {
              // const blob = res;
              // const filename = `data.pdf`;
              // if ((window.navigator as any).msSaveOrOpenBlob) {
              //   (window.navigator as any).msSaveBlob(blob, filename);
              // } else {
              //   const downloadLink = window.document.createElement('a');
              //   const contentTypeHeader = 'application/pdf';
              //   downloadLink.href = window.URL.createObjectURL(
              //     new Blob([blob], { type: contentTypeHeader })
              //   );
              //   downloadLink.download = filename;
              //   document.body.appendChild(downloadLink);
              //   downloadLink.click();
              //   document.body.removeChild(downloadLink);
              // }
              const blob = res;
              const find = ' ';
              const re = new RegExp(find, 'g');
              const filePath = `${title.replace(re, '-')}.pdf`;

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
                  .catch(err => this.responseService.onError(err, 'No se pudo descargar la auditoría'));
              }
            },
            error: err => this.responseService.onError(err, 'No se pudo descargar la auditoría')
          })
      })
  }

  async presentActionSheetOptions(auditory: any) {

    const buttons = this.sendedList ?
      [
        {
          text: 'Ver Conteo',
          handler: () => this.onRemoteDetail(auditory.id),
        },
        {
          text: 'Descargar Conteo',
          handler: () => this.onDownloadPdf(auditory.id, auditory.title),
        },
        {
          text: 'Cerrar',
          role: 'cancel',
          data: {
            action: 'cancel',
          },
        },
      ] :
      !!auditory.countId ?
        [
          {
            text: 'Envíar Conteo',
            handler: () => this.onUpload(auditory.id),
          },
          {
            text: 'Actualizar Conteo',
            handler: () => this.onDetail(auditory.id),
          },
          {
            text: 'Actualizar catos generales',
            handler: () => this.onEdit(auditory.id),
          },
          {
            text: 'Eliminar Conteo',
            role: 'destructive',
            handler: () => this.onDelete(auditory.id),
          },
          {
            text: 'Cerrar',
            role: 'cancel',
            data: {
              action: 'cancel',
            },
          },
        ]:
        [
          {
            text: 'Actualizar Conteo',
            handler: () => this.onDetail(auditory.id),
          },
          {
            text: 'Actualizar datos generales',
            handler: () => this.onEdit(auditory.id),
          },
          {
            text: 'Eliminar Conteo',
            role: 'destructive',
            handler: () => this.onDelete(auditory.id),
          },
          {
            text: 'Cerrar',
            role: 'cancel',
            data: {
              action: 'cancel',
            },
          },
        ];

    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Opciones',
      mode: 'ios',
      buttons: buttons,
    });

    await actionSheet.present();
  }


  fetchLocalList() {
    this.sendedList = false;
    this.loadingService.showLoading();
    this.loading = true;

    this.auditoryService
      .getLocalList()
      .subscribe({
        next: res => {
          if (res !== DATABASE_WAITING_MESSAGE) {
            this.auditories = res.map((a: any) => ({
              ...a,
              statusWord: a.status === 1 ? 'En progreso' : 'Terminada',
            }));
            this.loading = false;
            this.loadingService.dismissLoading();
          }
        },
        error: err => {
          this.responseService.onError(err, 'No se pudieron recuperar las auditorías');
        }
      })
  }

  fetchRemoteList() {
    this.sendedList = true;
    this.loadingService.showLoading();

    this.auditoryService
      .getRemoteList()
      .subscribe({
        next: res => {
          this.sendedList = true;
          this.auditories = res.data.map((a: any) => ({
            ...a,
            statusWord: 'Enviado',
          }));
          this.loadingService.dismissLoading();
        },
        error: err => {
          this.responseService.onError(err, 'No se pudieron recuperar las auditorías');
          this.fetchLocalList();
        },
      })
  }

}
