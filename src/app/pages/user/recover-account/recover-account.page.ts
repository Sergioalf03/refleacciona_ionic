import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { URI_LOGIN, URI_SEND_RECOVER_CODE } from 'src/app/core/constants/uris';
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
  backUri = URI_LOGIN();

  form!: FormGroup;

  constructor(
    private authService: AuthService,
    private validFormService: ValidFormService,
    private responseService: HttpResponseService,
    private loadingService: LoadingService,
    private confirmDialogService: ConfirmDialogService,
    private router: Router,
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
                this.responseService.onSuccessAndRedirect(URI_SEND_RECOVER_CODE('0'), 'Solicitud recibida');
              },
              error: err => {
                this.responseService.onError(err, 'No se pudo procesar la solicitud');
              }
            });
        });
    }
  }

  alreadyHadCode() {
    this.router.navigateByUrl(URI_SEND_RECOVER_CODE('1'));
  }

  onGoingHome() {
    this.router.navigateByUrl(this.backUri);
  }

}
