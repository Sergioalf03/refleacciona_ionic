import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmDialogService } from 'src/app/core/controllers/confirm-dialog.service';
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
  backUrl = '/auditory-list';
  yesCount = 0;
  notCount = 0;
  submitLoading = false;

  form!: FormGroup;

  constructor(
    private auditoryService: AuditoryService,
    private questionService: QuestionService,
    private validFormService: ValidFormService,
    private confirmDialogService: ConfirmDialogService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

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
            this.router.navigateByUrl('/auditory-list');
          }

          this.auditoryId = paramMap.get('auditoryId') || '0';

          this.questionService
            .getPointsResume(this.auditoryId)
            .subscribe({
              next: answers => {
                if (answers !== 'waiting') {
                  answers.values.forEach((answer: any) => {
                    if (answer.answer === '1') {
                      this.yesCount++;
                    } else {
                      this.notCount++;
                    }
                  });
                }
              }
            })

        }
      })
  }

  ionViewWillLeave() {
    this.auditoryId = '0';
    this.backUrl = '/auditory-list';
    this.yesCount = 0;
    this.notCount = 0;
    this.form = new FormGroup({});
  }

  onSubmit() {
    if (this.validFormService.isValid(this.form, [])) {
      this.confirmDialogService
        .presentAlert('¿Desea guardar los cambios?', () => {
          this.submitLoading = true;

          this.auditoryService
            .closeLocal(this.auditoryId, this.form.controls['notes'].value)
            .subscribe({
              next: () => {
                this.submitLoading = false;
                // this.toastService.showSuccessToast('Auditoría finalizada correctamente');
                this.router.navigateByUrl('/auditory-list')
              }
            })
        })
    }
  }

  onReturn() {
    this.router.navigateByUrl(`/question-form/${this.auditoryId}/7`)
  }

}
