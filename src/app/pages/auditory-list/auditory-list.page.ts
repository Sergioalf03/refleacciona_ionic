import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmDialogService } from 'src/app/core/controllers/confirm-dialog.service';
import { DatabaseService } from 'src/app/core/controllers/database.service';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { AuditoryService } from 'src/app/services/auditory.service';
import { ActionSheetController } from '@ionic/angular';
import { LoadingService } from 'src/app/core/controllers/loading.service';
import { AnswerService } from 'src/app/services/answer.service';
import { AuditoryEvidenceService } from 'src/app/services/auditory-evidence.service';
import { PhotoService } from 'src/app/core/controllers/photo.service';
import { AnswerEvidenceService } from 'src/app/services/answer-evidence.service';

@Component({
  selector: 'app-auditory-list',
  templateUrl: './auditory-list.page.html',
})
export class AuditoryListPage implements OnInit {

  auditories: any[] = [];
  sendedList = false;
  loading = false;

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
  ) { }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    this.fetchLocalList();
  }

  onGoingHome() {
    this.router.navigateByUrl('/home');
  }

  private onEdit(id: string) {
    this.router.navigateByUrl(`/auditory-form/${id}`);
  }

  private onEditAnswers(id: string, lastIndex: number) {
    this.router.navigateByUrl(`/question-form/${id}/${lastIndex}`);
  }

  private onFinish(id: string) {
    this.router.navigateByUrl(`/auditory-finish-form/${id}`);
  }

  onNewAuditory() {
    this.router.navigateByUrl(`/auditory-form/00`);
  }

  private onUpload(id: string) {
    this.confirmDialogService
      .presentAlert('Una vez enviada la auditoría no se podrá modificar. ¿Desea continuar?', () => {
        this.loadingService.showLoading();

        this.auditoryService
          .getUpdateData(id)
          .subscribe({
            next: auditory => {
              if (auditory !== 'waiting') {
                this.answerService
                  .getAnswersBySectionByAuditory(id)
                  .subscribe({
                    next: answers => {
                      if (answers !== 'waiting') {
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
                                    if (updated !== 'waiting') {
                                      this.uploadAuditoryPhotos(id, externalId);
                                    }
                                  }
                                })
                            },
                            error: err => this.responseService.onError(err, 'No se pudo subir la auditoría'),
                          })
                      }
                    }
                  })

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
          if (evidences !== 'waiting') {
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

      const ImageSrc = 'data:image/jpeg;base64,' + await this.photoService.getLocalAuditoryEvidence(arr[index].dir).then(photo => photo.data);
      const blob = await fetch(ImageSrc).then(r => r.blob());

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
                      if (dlt !== 'waiting') {
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
          if (evidences !== 'waiting') {
            this.uploadAnswersEvidence(evidences.values, 0, extenalId)
              .then(result => {

                this.answerService
                  .deleteAnswersByAuditory(id)
                  .subscribe({
                    next: answerDelete => {
                      if (answerDelete !== 'waiting') {
                        this.auditoryService
                          .finalDelete(id)
                          .subscribe({
                            next: auditoryDelete => {
                              if (auditoryDelete !== 'waiting') {
                                this.responseService.onSuccess('Auditoría enviada exitósamente');
                                setTimeout(() => {
                                  this.fetchLocalList();
                                }, 100)
                              }
                            },
                          });
                      }
                    }
                  });
              })
          }
        }
      });
  }

  private async uploadAnswersEvidence(arr: any, index: number, extenalId: string) {
    const resultPromise = new Promise(async (res, rej) => {
      if (index === arr.length) {
        return res(true);
      }

      const ImageSrc = 'data:image/jpeg;base64,' + await this.photoService.getLocalAnswerEvidence(arr[index].dir).then(photo => photo.data);
      const blob = await fetch(ImageSrc).then(r => r.blob());

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
                      if (dlt !== 'waiting') {
                        this.uploadAnswersEvidence(arr, index + 1, extenalId).then(r => res(r));
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
            if (rm !== 'waiting') {
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
    this.router.navigateByUrl(`/auditory-detail/${id}`);
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
        handler: () => this.onEditAnswers(auditory.id, 1),
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
          if (res !== 'waiting') {
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
