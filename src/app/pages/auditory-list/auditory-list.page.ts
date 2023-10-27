import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmDialogService } from 'src/app/core/controllers/confirm-dialog.service';
import { Capacitor } from '@capacitor/core';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { AuditoryService } from 'src/app/services/auditory.service';
import { ActionSheetController, Platform } from '@ionic/angular';
import { LoadingService } from 'src/app/core/controllers/loading.service';
import { AnswerService } from 'src/app/services/answer.service';
import { AuditoryEvidenceService } from 'src/app/services/auditory-evidence.service';
import { PhotoService } from 'src/app/core/controllers/photo.service';
import { AnswerEvidenceService } from 'src/app/services/answer-evidence.service';
import { URI_AUDITORY_DETAIL, URI_AUDITORY_FINISH_FORM, URI_AUDITORY_FORM, URI_HOME, URI_QUESTION_FORM } from 'src/app/core/constants/uris';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { DATABASE_WAITING_MESSAGE } from 'src/app/core/constants/message-code';

@Component({
  selector: 'app-auditory-list',
  templateUrl: './auditory-list.page.html',
})
export class AuditoryListPage implements OnInit {

  auditories: any[] = [];
  sendedList = false;
  loading = false;

  customButton = {
    click: () => this.router.navigateByUrl(this.formUri),
    icon: 'add',
  }

  backUri = URI_HOME();
  formUri = URI_AUDITORY_FORM('00');

  constructor(
    private auditoryService: AuditoryService,
    private auditoryEvidenceService: AuditoryEvidenceService,
    private answerService: AnswerService,
    private answerEvidenceService: AnswerEvidenceService,
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

  ngOnInit() {
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

  async ionViewWillEnter() {

  }

  onGoingHome() {
    this.router.navigateByUrl(this.backUri);
  }

  private onEdit(id: string) {
    this.router.navigateByUrl(URI_AUDITORY_FORM(id));
  }

  private onEditAnswers(id: string, lastIndex: number) {
    this.router.navigateByUrl(URI_QUESTION_FORM('1', id, `${lastIndex}`));
  }

  private onFinish(id: string) {
    this.router.navigateByUrl(URI_AUDITORY_FINISH_FORM('1', id));
  }

  onNewAuditory() {
    this.router.navigateByUrl(URI_AUDITORY_FORM('00'));
  }

  private onUpload(id: string) {
    this.confirmDialogService
      .presentAlert('Una vez enviada la auditoría no se podrá modificar. ¿Desea continuar?', () => {
        this.loadingService.showLoading();

        this.auditoryService
          .getUpdateData(id)
          .subscribe({
            next: auditory => {
              if (auditory !== DATABASE_WAITING_MESSAGE) {

                setTimeout(() => {
                  this.answerService
                    .getAnswersBySectionByAuditory(id)
                    .subscribe({
                      next: answers => {
                        if (answers !== DATABASE_WAITING_MESSAGE) {

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

                          const formattedAnswers = answers.values.map((answer: any) => ({
                            value: answer.value,
                            notes: answer.notes,
                            creation_date: answer.creation_date,
                            update_date: answer.update_date,
                            question_id: answer.question_id,
                          }));

                          const data = {
                            auditory: formattedAuditory,
                            answers: formattedAnswers,
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
                this.uploadAnswerPhotos(localId, extenalId);
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
      const blob = await fetch(Capacitor.convertFileSrc(ImageSrc)).then(r => r.blob());

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

  private uploadAnswerPhotos(id: string, extenalId: string) {
    this.answerEvidenceService
      .getEvidencesByAuditory(id)
      .subscribe({
        next: async evidences => {
          if (evidences !== DATABASE_WAITING_MESSAGE) {

            setTimeout(() => {
              this.uploadAnswersEvidence(evidences.values, 0, extenalId)
                .then(result => {

                  this.answerService
                    .deleteAnswersByAuditory(id)
                    .subscribe({
                      next: answerDelete => {
                        if (answerDelete !== DATABASE_WAITING_MESSAGE) {

                          setTimeout(() => {
                            this.auditoryService
                              .finalDelete(id)
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
                          }, 20);
                        }
                      }
                    });
                })
            }, 20);
          }
        }
      });
  }

  private async uploadAnswersEvidence(arr: any, index: number, extenalId: string) {
    const resultPromise = new Promise(async (res, rej) => {
      if (index === arr.length) {
        return res(true);
      }

      const ImageSrc = await this.photoService.getLocalAnswerEvidenceUri(arr[index].dir).then(photo => photo.uri);
      const blob = await fetch(Capacitor.convertFileSrc(ImageSrc)).then(r => r.blob());

      this.answerEvidenceService
        .uploadImage(blob, extenalId, arr[index].question_id, arr[index].creation_date, arr[index].dir)
        .subscribe({
          next: () => {

            this.photoService
              .removeLocalAnswerEvidence(arr[index].dir)
              .then(() => {
                this.answerEvidenceService
                  .localRemove(arr[index].dir)
                  .subscribe({
                    next: dlt => {
                      if (dlt !== DATABASE_WAITING_MESSAGE) {

                        setTimeout(() => {
                          this.uploadAnswersEvidence(arr, index + 1, extenalId).then(r => res(r));
                        }, 20);
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
    this.confirmDialogService.presentAlert('¿Desea eliminar la auditoría?', () => {
      this.loadingService.showLoading();
      this.auditoryService
        .deleteLocal(id)
        .subscribe({
          next: (rm) => {
            if (rm !== DATABASE_WAITING_MESSAGE) {
              this.responseService.onSuccess('Auditoría eliminada');
              setTimeout(() => {
                this.fetchLocalList();
              }, 100)
            }
          },
          error: err => {
            this.responseService.onError(err, 'No se pudo eliminar la auditoría');
          }
        })
    });
  }

  private onDetail(id: string) {
    this.router.navigateByUrl(URI_AUDITORY_DETAIL(id));
  }

  private onDownloadPdf(id: string, title: string) {
    this.confirmDialogService
      .presentAlert('¿Desea descargar la auditoría?', () => {
        this.loadingService.showLoading();
        this.auditoryService
          .downloadPdf(id)
          .subscribe({
            next: res => {
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
        text: 'Ver',
        handler: () => this.onDetail(auditory.id),
      },
      {
        text: 'Descargar',
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
    auditory.status === 1 ?
      auditory.answersCompleted ? [
        {
          text: 'Actualizar Auditoría',
          handler: () => this.onEdit(auditory.id),
        },
        {
          text: 'Actualizar Respuestas',
          handler: () => this.onEditAnswers(auditory.id, 1),
        },
        {
          text: 'Finalizar auditoría',
          handler: () => this.onFinish(auditory.id),
        },
        {
          text: 'Eliminar Auditoría',
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
      ] :
      [
          {
            text: 'Actualizar Auditoría',
            handler: () => this.onEdit(auditory.id),
          },
          {
            text: 'Actualizar Respuestas',
            handler: () => this.onEditAnswers(auditory.id, auditory.lastIndex),
          },
          {
            text: 'Eliminar Auditoría',
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
      ] :
      [
        {
          text: 'Actualizar Auditoría',
          handler: () => this.onEdit(auditory.id),
        },
        {
          text: 'Actualizar Respuestas',
          handler: () => this.onEditAnswers(auditory.id, 1),
        },
        {
          text: 'Actualizar Finalización',
          handler: () => this.onFinish(auditory.id),
        },
        {
          text: 'Envíar Auditoría',
          handler: () => this.onUpload(auditory.id),
        },
        {
          text: 'Eliminar Auditoría',
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
            statusWord: a.status === 1 ? 'En progreso' : 'Terminada',
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
