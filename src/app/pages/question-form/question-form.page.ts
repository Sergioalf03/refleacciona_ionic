import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';
import { ConfirmDialogService } from 'src/app/core/controllers/confirm-dialog.service';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
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
  loading = false;

  constructor(
    private questionService: QuestionService,
    private answerService: AnswerService,
    private route: ActivatedRoute,
    private router: Router,
    private photoService: PhotoService,
    private confirmDialogService: ConfirmDialogService,
    private answerEvidenceService: AnswerEvidenceService,
    private responseService: HttpResponseService,
    private actionSheetCtrl: ActionSheetController,
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

          this.fetchSection();
        }
      })
  }

  ionViewWillEnter() {

  }

  onNext() {
    if (this.sectionId !== '7') {
      this.sectionId = `${+this.sectionId + 1}`;
      this.fetchSection();
    }
  }

  onPrevious() {
    if (this.sectionId !== '1') {
      this.sectionId = `${+this.sectionId - 1}`;
      this.fetchSection();
    }
  }

  private fetchSection() {
    this.questionService
      .getSection(this.sectionId)
      .subscribe({
        next: res1 => {
          if (res1 !== 'waiting') {
            this.loading = true;
            const section = res1.values[0];
            this.sectionName = section.name;
            this.subsectionName = section.subname;
            this.questionService
              .getLocalQuestionsBySection(this.sectionId, this.auditoryId)
              .subscribe({
                next: res => {
                  if (res !== 'waiting') {
                    this.questions = res.values;
                    this.ImageSrc = this.questions.map(q => ({
                      canTakePickture: !!q.answer,
                      url: '',
                      id: '',
                    }));
                    this.loading = false;
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

  async onSelectPhoto(index: number) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Opciones',
      mode: 'ios',
      buttons: [
        {
          text: 'Cámara',
          handler: () => this.fromCamera(index),
        },
        {
          text: 'Galería',
          handler: () => this.fromGallery(index),
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

  fromGallery(index: number) {
    this.photoService.openGallery().then(async res => {
      this.ImageSrc[index].url = res.photos[0].webPath;

      // const img = res.photos[index].webPath;
      // const blob = await fetch(img).then(r => r.blob());

      // this.photoService
      //   .saveLocalAnswerEvidence(blob, this.auditoryId)
      //   .then(photoId => {
      //     this.answerEvidenceService
      //       .localSave({ auditoryId: this.auditoryId, dir: photoId })
      //       .subscribe({
      //         next: async save => {
      //           if (save !== 'waiting') {
      //             this.answerEvidenceService
      //               .getLastInsertedDir()
      //               .subscribe({
      //                 next: async (res: any) => {
      //                   if (res !== 'waiting') {
      //                     this.ImageSrc.push({
      //                       id: res.values[0].dir,
      //                       file: img
      //                     });
      //                   }
      //                 }
      //               });
      //           }
      //         },
      //         error: err => {
      //           this.responseService.onError(err, 'No se pudo guardar una imagen')
      //         },
      //       })
      //   });
    });
  }

  fromCamera(index: number) {
    this.photoService.takePicture().then(async res => {
      this.ImageSrc[index].url = res.webPath;

      // const img = res.webPath || '';
      // const blob = await fetch(img).then(r => r.blob());

      // this.photoService
      //   .saveLocalAnswerEvidence(blob, this.auditoryId)
      //   .then(photoId => {
      //     this.answerEvidenceService
      //       .localSave({ auditoryId: this.auditoryId, dir: photoId })
      //       .subscribe({
      //         next: async save => {
      //           if (save !== 'waiting') {
      //             this.answerEvidenceService
      //               .getLastInsertedDir()
      //               .subscribe({
      //                 next: async (res: any) => {
      //                   if (res !== 'waiting') {
      //                     this.ImageSrc.push({
      //                       id: res.values[0].dir,
      //                       file: img
      //                     });
      //                   }
      //                 }
      //               });
      //           }
      //         },
      //         error: err => {
      //           this.responseService.onError(err, 'No se pudo guardar una imagen')
      //         },
      //       })
      //   });
    });
  }

  onImgClicked(index: number) {
    this.confirmDialogService.presentAlert('¿Desea eliminar la imagen?', () => {

      this.ImageSrc[index] = '';

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
    return this.ImageSrc.every(src => src.canTakePickture);
  }

  onFinish() {

  }

}
