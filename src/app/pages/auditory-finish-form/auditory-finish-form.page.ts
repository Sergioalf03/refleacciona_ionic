import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { DATABASE_WAITING_MESSAGE } from 'src/app/core/constants/message-code';
import { URI_AUDITORY_LIST, URI_QUESTION_FORM } from 'src/app/core/constants/uris';
import { ConfirmDialogService } from 'src/app/core/controllers/confirm-dialog.service';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { LoadingService } from 'src/app/core/controllers/loading.service';
import { ToastService } from 'src/app/core/controllers/toast.service';
import { ValidFormService } from 'src/app/core/controllers/valid-form.service';
import { AuditoryService } from 'src/app/services/auditory.service';
import { QuestionService } from 'src/app/services/question.service';

@Component({
  selector: 'app-auditory-finish-form',
  templateUrl: './auditory-finish-form.page.html',
})
export class AuditoryFinishFormPage implements OnInit {

  auditoryId = '0';
  backUrl = URI_AUDITORY_LIST('local');
  yesCount = 0;
  notCount = 0;

  form!: FormGroup;

  constructor(
    private auditoryService: AuditoryService,
    private questionService: QuestionService,
    private validFormService: ValidFormService,
    private confirmDialogService: ConfirmDialogService,
    private loadingService: LoadingService,
    private responseService: HttpResponseService,
    private route: ActivatedRoute,
    private router: Router,
    private platform: Platform,
  ) {
    this.platform
      .backButton
      .subscribeWithPriority(9999, () => {
        this.router.navigateByUrl(this.backUrl);
        return;
        // processNextHandler();
      });
  }

  ngOnInit() {

  }

  private initForm() {
    this.form = new FormGroup({
      notes: new FormControl(''),
    });
  }

  ionViewDidEnter() {
    this.yesCount = 0;
    this.notCount = 0;
    this.initForm();

    this.route
      .paramMap
      .subscribe({
        next: paramMap => {
          if (!paramMap.has('auditoryId')) {
            this.router.navigateByUrl(this.backUrl);
          }

          this.auditoryId = paramMap.get('auditoryId') || '0';

          this.backUrl = (paramMap.get('from') || '0') === '0' ? URI_QUESTION_FORM('0', this.auditoryId, '7') : URI_AUDITORY_LIST('local');

          this.auditoryService
            .getFinalNotes(this.auditoryId)
            .subscribe({
              next: note => {
                if (note !== DATABASE_WAITING_MESSAGE) {
                  this.form.controls['notes'].setValue(note.values[0] ? note.values[0].close_note : '');

                  setTimeout(() => {
                    this.questionService
                      .getPointsResume(this.auditoryId)
                      .subscribe({
                        next: answers => {
                          if (answers !== DATABASE_WAITING_MESSAGE) {
                            answers.values.forEach((answer: any) => {
                              if (answer.answer === '1') {
                                this.yesCount++;
                              } else {
                                this.notCount++;
                              }
                            });
                          }
                        }
                      });
                  }, 20);
                }
              }
            });
        }
      }).unsubscribe();
  }

  ionViewWillLeave() {
    this.auditoryId = '0';
    this.yesCount = 0;
    this.notCount = 0;
    this.form = new FormGroup({});
  }

  onSubmit() {
    if (this.validFormService.isValid(this.form, [])) {
      this.confirmDialogService
        .presentAlert('¿Desea guardar los cambios?', () => {
          this.loadingService.showLoading();

          this.auditoryService
            .closeLocal(this.auditoryId, this.form.controls['notes'].value)
            .subscribe({
              next: res => {
                if (res !== DATABASE_WAITING_MESSAGE) {
                  this.responseService.onSuccessAndRedirect(URI_AUDITORY_LIST('local'), 'Auditoría finalizada correctamente');
                }
              }
            })
        })
    }
  }

  onReturn() {
    this.router.navigateByUrl(this.backUrl);
  }

}
