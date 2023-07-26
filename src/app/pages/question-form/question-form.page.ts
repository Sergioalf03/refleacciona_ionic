import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { ActionSheetController, Platform, isPlatform } from '@ionic/angular';
import { URI_AUDITORY_FINISH_FORM, URI_AUDITORY_FORM, URI_AUDITORY_LIST, URI_HOME } from 'src/app/core/constants/uris';
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
  backUri = URI_HOME();

  hasConditionQuestions = false;
  questionChangeEvent:any[] = [];
  hideQuestion: any[] = [];
  questionsWithCondition: any[] = [];
  showedQuestions = 0;

  sameAnswer: any[] = [];
  canNext = false;

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
          if (!paramMap.has('sectionId') || !paramMap.has('auditoryId')) {
            this.router.navigateByUrl(this.backUri);
          }

          this.auditoryId = `${paramMap.get('auditoryId')}`;
          this.sectionId = `${paramMap.get('sectionId')}`;

          this.backUri = (paramMap.get('from') === '0') ? URI_AUDITORY_FORM(this.auditoryId) : URI_AUDITORY_LIST('local');

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


                    // To hide answers
                    this.hideQuestion = this.questions.map(q => {
                      return q.cond && q.cond !== '' && q.cond.startsWith('S')
                    });

                    this.showedQuestions = this.hideQuestion.filter(q => q !== true).length;
                    this.hasConditionQuestions = !!this.questions.find(q => q.cond && q.cond !== '');

                    this.questionsWithCondition = this.questions.map((q, i)=> {
                      if (q.cond) {
                        const cond = q.cond.split('-');
                        return { questionId: q.id, questionIndex: i, type: cond[0], section: cond[1], question: cond[2], answer: cond[3] }
                      } else {
                        return null;
                      }
                    }).filter(q => q !== null);

                    this.questionChangeEvent = this.questionsWithCondition
                    .map(q => ({
                      uid: q.question,
                      affectedIndexes: this.questionsWithCondition.filter(qwc => qwc.question === q.question).map(qwc => qwc.questionIndex),
                    }))
                    .filter((q, i, arr) => arr.findIndex(qaux => qaux.uid === q.uid) === i)

                    this.questionChangeEvent.forEach(q => {
                      this.answerService
                        .answerExists(q.uid, this.auditoryId)
                        .subscribe({
                          next: result => {
                            if (result !== 'waiting') {
                              if (result.values.length > 0) {
                                const answer = result.values[0].value
                                this.verifyCondition(q.uid, answer)
                              }
                            }
                          }
                        })
                    });
                    // End to hide answers

                    // To answer the same like another answer
                    this.questions.filter(q => {
                      return q.cond && q.cond !== '' && q.cond.startsWith('E')
                    })
                    .forEach(q => {
                      this.answerService
                        .answerExists(q.cond.split('-')[2], this.auditoryId)
                        .subscribe({
                          next: result => {
                            if (result !== 'waiting') {
                              q.answer = result.values[0].value;
                              // Insertar a base de datos

                              this.answerService
                                .saveAnswer(q.id, this.auditoryId, q.answer)
                                .subscribe({
                                  next: save => {
                                    if (save !== 'waiting') {
                                      const originalIndex = this.questions.findIndex(question => question.id === q.id);
                                      this.ImageSrc[originalIndex].canTakePickture = true;
                                      this.alreadyAnsweredAll();
                                    }
                                  }
                                })
                            }
                          }
                        })
                    });
                    // End to answer the same like another answer

                    // To answer by some answer
                    this.questions.filter(q => {
                      return q.cond && q.cond !== '' && q.cond.startsWith('D')
                    })
                    .forEach(q => {
                      const conditionArr = q.cond.split('-');
                      this.answerService
                        .answerExists(conditionArr[2], this.auditoryId)
                        .subscribe({
                          next: result => {
                            if (result !== 'waiting') {

                              const valueArr = conditionArr[3].split(':');
                              let answer = '';

                              switch (valueArr[0]) {
                                case '<':
                                  answer = +result.values[0].value < +valueArr[1] ? valueArr[2] : valueArr[3];
                                  break;
                                case '<=':
                                  answer = +result.values[0].value <= +valueArr[1] ? valueArr[2] : valueArr[3];
                                  break;
                                case '>':
                                  answer = +result.values[0].value > +valueArr[1] ? valueArr[2] : valueArr[3];
                                  break;
                                case '>=':
                                  answer = +result.values[0].value >= +valueArr[1] ? valueArr[2] : valueArr[3];
                                  break;
                                case '=':
                                  answer = +result.values[0].value === +valueArr[1] ? valueArr[2] : valueArr[3];
                                  break;
                                case '!=':
                                  answer = +result.values[0].value !== +valueArr[1] ? valueArr[2] : valueArr[3];
                                  break;
                              }

                              q.answer = answer;
                              // // Insertar a base de datos

                              this.answerService
                                .saveAnswer(q.id, this.auditoryId, answer)
                                .subscribe({
                                  next: save => {
                                    if (save !== 'waiting') {
                                      const  originalIndex = this.questions.findIndex(question => question.id === q.id);
                                      this.ImageSrc[originalIndex].canTakePickture = true;
                                      this.alreadyAnsweredAll();
                                    }
                                  }
                                })
                            }
                          }
                        })
                    });
                    // End to answer by some answer

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

                    this.alreadyAnsweredAll()
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
            if (save !== 'waiting') {
              this.ImageSrc[index].canTakePickture = true;
              this.alreadyAnsweredAll();
            }
          }
        });
    } else {
      this.ImageSrc[index].canTakePickture = false;
      this.alreadyAnsweredAll();
    }

    this.verifyCondition(question.uid, `${event.detail.value}`);
  }

  private verifyCondition(questionUid: string, answerValue: string) {
    const needsChange = this.questionChangeEvent.find(q => `${questionUid}` === q.uid);

    if (needsChange) {

      needsChange.affectedIndexes.forEach((i: number) => {
        this.hideQuestion[i] = this.questionsWithCondition.find(qwc => qwc.type === 'S' && qwc.questionIndex === i).answer !== answerValue;

        if (this.hideQuestion[i]) {
          // pendiente; eliminar fotografía
          this.answerService
            .deleteAnswer(this.questions[i].id, this.auditoryId)
            .subscribe({
              next: (dlt) => {
                if(dlt !== 'waiting') {
                  this.ImageSrc[i].canTakePickture = false;
                  this.questions[i].answer = undefined;
                  this.showedQuestions = this.hideQuestion.filter(q => q !== true).length;
                }
              }
            });
        } else {
          this.showedQuestions = this.hideQuestion.filter(q => q !== true).length;
        }
        this.alreadyAnsweredAll();
      })
    }
  }

  alreadyAnsweredAll() {
    this.answerCount = 0;
    this.ImageSrc.forEach(src => {
      if (src.canTakePickture === true) {
        this.answerCount++;
      }
      return src.canTakePickture;
    });
    this.canNext = this.answerCount === this.showedQuestions;
  }

  onFinish() {
    this.router.navigateByUrl(URI_AUDITORY_FINISH_FORM('0', this.auditoryId));
  }

}
