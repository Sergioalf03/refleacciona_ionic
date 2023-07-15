import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { ActionSheetController, isPlatform } from '@ionic/angular';
import { ConfirmDialogService } from 'src/app/core/controllers/confirm-dialog.service';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { LoadingService } from 'src/app/core/controllers/loading.service';
import { PhotoService } from 'src/app/core/controllers/photo.service';
import { AnswerEvidenceService } from 'src/app/services/answer-evidence.service';
import { AnswerService } from 'src/app/services/answer.service';
import { QuestionService } from 'src/app/services/question.service';

@Component({
  selector: 'app-question-form',
  templateUrl: './question-form.page.html',
})
export class QuestionFormPage implements OnInit {

  auditoryId = '0';
  sectionId = '0';
  sectionName = '';
  subsectionName  = '';
  openedPopover = 0;
  questions: any[] = [];
  ImageSrc: any[] = [];
  answerCount = 0;
  hideForm = true;
  sectionIds: number[] = [];
  sectionIndex = 0;

  constructor(
    private questionService: QuestionService,
    private answerService: AnswerService,
    private route: ActivatedRoute,
    private router: Router,
    private photoService: PhotoService,
    private confirmDialogService: ConfirmDialogService,
    private answerEvidenceService: AnswerEvidenceService,
    private responseService: HttpResponseService,
    private loadingService: LoadingService,
    private actionSheetCtrl: ActionSheetController,
    private sanitization: DomSanitizer,
  ) { }

  ngOnInit() {
    this.route
      .paramMap
      .subscribe({
        next: paramMap => {
          if (!paramMap.has('sectionId') || !paramMap.has('auditoryId')) {
            this.router.navigateByUrl('/home');
          }

          this.auditoryId = `${paramMap.get('auditoryId')}`;
          this.sectionId = `${paramMap.get('sectionId')}`;

          this.questionService
            .getSectionIds()
            .subscribe({
              next: sections => {
                if (sections !== 'waiting') {
                  this.sectionIds = sections.values.map((s: any) => s.id);

                  this.sectionIndex = this.sectionIds.findIndex(s => +s === +this.sectionId);

                  this.fetchSection();
                }
              }
            });
        }
      })
  }

  ionViewWillEnter() {

  }

  onNext() {
    if (this.sectionIndex < this.sectionIds.length) {
      this.sectionIndex++;
      this.sectionId = `${+this.sectionIds[this.sectionIndex]}`;
      this.fetchSection();
    }
  }

  onPrevious() {
    if (this.sectionIndex !== 0) {
      this.sectionIndex--;
      this.sectionId = `${+this.sectionIds[this.sectionIndex]}`;
      this.fetchSection();
    }
  }

  private fetchSection() {
    this.hideForm = true;
    this.questionService
      .getSection(this.sectionId)
      .subscribe({
        next: res1 => {
          if (res1 !== 'waiting') {
            this.loadingService.showLoading();
            const section = res1.values[0];
            this.sectionName = section.name;
            this.subsectionName = section.subname;
            this.questionService
              .getLocalQuestionsBySection(this.sectionId, this.auditoryId)
              .subscribe({
                next: res => {
                  if (res !== 'waiting') {
                    this.questions = res.values;
                    this.ImageSrc = this.questions.map(q => {
                      return {
                        canTakePickture: !!q.answer,
                        url: '',
                        id: q.dir ? q.dir : '',
                      }
                    });

                    if (isPlatform('hybrid')) {
                      this.ImageSrc.forEach((img, i) => {
                        if (!!img.id) {
                          this.photoService
                            .getLocalAnswerEvidenceUri(img.id)
                            .then((photo: any) => {
                              this.ImageSrc[i].url = Capacitor.convertFileSrc(photo.uri)
                            });
                        }
                      })
                    } else {
                      this.ImageSrc.forEach((img, i) => {
                        if (!!img.id) {
                          this.photoService
                            .getLocalAnswerEvidence(img.id)
                            .then((photo: any) => {
                              this.ImageSrc[i].url = this.sanitization.bypassSecurityTrustUrl('data:image/jpeg;base64,' + photo.data);
                            });
                        }
                      })
                    }


                    this.hideForm = false;
                    this.loadingService.dismissLoading();
                  }
                },
              });
          }
        }
      })
  }

  jsonCast(jsonString: string) {
    const data = JSON.parse(jsonString);
    return data;
  }

  async onSelectPhoto(index: number, questionId: string) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Opciones',
      mode: 'ios',
      buttons: [
        {
          text: 'Cámara',
          handler: () => this.fromCamera(index, questionId),
        },
        {
          text: 'Galería',
          handler: () => this.fromGallery(index, questionId),
        },
        {
          text: 'Cerrar',
          role: 'cancel',
          data: {
            action: 'cancel',
          },
        },
      ],
    });

    await actionSheet.present();
  }

  fromGallery(index: number, questionId: string) {
    this.photoService.openGallery().then(async res => {
      for (let forIndex = 0; forIndex < res.photos.length; forIndex++) {
        const img = res.photos[forIndex].webPath;
        console.log(img)
        const blob = await fetch(img).then(r => r.blob());

        this.photoService
          .saveLocalAnswerEvidence(blob, this.auditoryId, this.sectionId)
          .then(photoId => {
            this.answerEvidenceService
              .localSave({
                auditoryId: this.auditoryId,
                questionId: questionId,
                dir: photoId
              })
              .subscribe({
                next: async save => {
                  if (save !== 'waiting') {
                    this.answerEvidenceService
                      .getLastInsertedDir()
                      .subscribe({
                        next: async (res: any) => {
                          if (res !== 'waiting') {
                            this.ImageSrc[index].url = this.sanitization.bypassSecurityTrustUrl(img);
                            this.ImageSrc[index].id = res.values[0].dir;
                          }
                        }
                      });
                  }
                },
                error: err => {
                  this.responseService.onError(err, 'No se pudo guardar una imagen')
                },
              })
          });
      }
    });
  }

  fromCamera(index: number, questionId: string) {
    this.photoService.takePicture().then(async res => {
      const img = res.webPath || '';
      const blob = await fetch(img).then(r => r.blob());

      this.photoService
        .saveLocalAnswerEvidence(blob, this.auditoryId, this.sectionId)
        .then(photoId => {
          this.answerEvidenceService
            .localSave({
              auditoryId: this.auditoryId,
              questionId: questionId,
              dir: photoId
            })
            .subscribe({
              next: async save => {
                if (save !== 'waiting') {
                  this.answerEvidenceService
                    .getLastInsertedDir()
                    .subscribe({
                      next: async (res: any) => {
                        if (res !== 'waiting') {
                          this.ImageSrc[index].url = this.sanitization.bypassSecurityTrustUrl(img);
                          this.ImageSrc[index].id = res.values[0].dir;
                        }
                      }
                    });
                }
              },
              error: err => {
                this.responseService.onError(err, 'No se pudo guardar una imagen')
              },
            })
        });
    });
  }

  onImgClicked(index: number) {
    this.confirmDialogService.presentAlert('¿Desea eliminar la imagen?', () => {

      this.photoService
        .removeLocalAnswerEvidence(this.ImageSrc[index].id)
        .then(() => {
          this.ImageSrc[index] = {
            canTakePickture: true,
            url: '',
            id: '',
          };
        });
    });
  }

  onAnswerChange(event: any, question: any, index: number) {
    if (!!event.detail.value) {
      this.answerService
        .saveAnswer(question.id, this.auditoryId, event.detail.value)
        .subscribe({
          next: (save) => {
            this.ImageSrc[index].canTakePickture = true;
          }
        });
    } else {
      this.ImageSrc[index].canTakePickture = false;
    }
  }

  alreadyAnsweredAll() {
    this.answerCount = 0;
    return this.ImageSrc.every(src => {
      if (src.canTakePickture) {
        this.answerCount++;
      }
      return src.canTakePickture;
    });
  }

  onFinish() {
    this.router.navigateByUrl(`/auditory-finish-form/${this.auditoryId}`);
  }

}
