import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmDialogService } from 'src/app/core/controllers/confirm-dialog.service';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { LoadingService } from 'src/app/core/controllers/loading.service';
import { ValidFormService } from 'src/app/core/controllers/valid-form.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-recover-account',
  templateUrl: './recover-account.page.html',
})
export class RecoverAccountPage implements OnInit {

  email = '';

  form!: FormGroup;

  constructor(
    private authService: AuthService,
    private validFormService: ValidFormService,
    private responseService: HttpResponseService,
    private loadingService: LoadingService,
    private confirmDialogService: ConfirmDialogService,
    private router: Router,
  ) { }

  private initForm() {
    this.form = new FormGroup({
      email: new FormControl('', {
        validators: [
          Validators.required,
          Validators.email,
        ],
      })
    })
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.initForm();
  }

  onSubmit() {
    if (this.validFormService.isValid(this.form, [])) {
      this.confirmDialogService
        .presentAlert('¿Desea continuar?', () => {
          this.loadingService.showLoading();

          const email = this.form.controls['email'].value;

          this.authService
            .resetPassword(email)
            .subscribe({
              next: () => {
                this.authService.email = email;
                this.responseService.onSuccessAndRedirect('/code/0', 'Solicitud recibida');
              },
              error: err => {
                this.responseService.onError(err, 'No se pudo procesar la solicitud');
              }
            });
        });
    }
  }

  alreadyHadCode() {
    this.router.navigateByUrl('/code/1');
  }

  onGoingHome() {
    this.router.navigateByUrl('/login');
  }

}
