import { Component } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { URI_EMAIL_CONFIRMATION, URI_LOGIN } from 'src/app/core/constants/uris';
import { ConfirmDialogService } from 'src/app/core/controllers/confirm-dialog.service';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { LoadingService } from 'src/app/core/controllers/loading.service';
import { RandomStringService } from 'src/app/core/controllers/random-string.service';
import { SessionService } from 'src/app/core/controllers/session.service';
import { ToastService } from 'src/app/core/controllers/toast.service';
import { ValidFormService } from 'src/app/core/controllers/valid-form.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {

  form!: FormGroup;
  backUri = URI_LOGIN();

  user: any = {};
  txtButtonEnter = 'Restrarse';
  disableSubmitButton = false;

  constructor(
    private randomService: RandomStringService,
    private sessionService: SessionService,
    private httpResponseService: HttpResponseService,
    private authService: AuthService,
    private validFormService: ValidFormService,
    private router: Router,
    private loadingService: LoadingService,
    private confirmDialogService: ConfirmDialogService,
    private platform: Platform,
    private toastSerivce: ToastService,
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
      name: new FormControl('', {
        validators: [ Validators.required ],
      }),
      confirmEmail: new FormControl('', {
        validators: [ Validators.required ],
      }),
      email: new FormControl('', {
        validators: [ Validators.required ],
      }),
      password: new FormControl('', {
        validators: [ Validators.required ],
      }),
      confirmPassword: new FormControl('', {
        validators: [ Validators.required ],
      }),
    })
  }

  ngOnInit() {}

  ionViewWillEnter() {
    this.initForm();
  }

  alreadyHasCode() {
    this.router.navigateByUrl(URI_EMAIL_CONFIRMATION('1'));
  }

  onSubmit() {
    if (this.validFormService.isValid(this.form, [])) {

      if (this.form.controls['email'].value !== this.form.controls['confirmEmail'].value) {
        this.toastSerivce.showErrorToast('El correo no coincide con la confirmación de correo');
        return;
      }

      if (this.form.controls['password'].value !== this.form.controls['confirmPassword'].value) {
        this.toastSerivce.showErrorToast('La contraseña no coincide con la confirmación de contraseña');
        return;
      }

      this.confirmDialogService
        .presentAlert('¿Desea envíar el registro?', () => {
          this.loadingService.showLoading();
          this.disableSubmitButton = true;
          this.txtButtonEnter = 'Cargando...'

          const user = {
            name: this.form.controls['name'].value,
            email: this.form.controls['email'].value,
            password: this.form.controls['password'].value,
            key: this.randomService.generate(128),
          };

          this.sessionService
            .register(user)
            .subscribe({
              next: () => {
                this.authService.email = user.email;
                this.httpResponseService.onSuccessAndRedirect(URI_EMAIL_CONFIRMATION('0'), 'Usuario registrado correctamente.');
                this.form.reset();
                this.disableSubmitButton = false;
                this.txtButtonEnter = 'Restrarse';
              },
              error: err => {
                this.httpResponseService.onError(err, 'No se pudo registrar el usuario');
                this.disableSubmitButton = false;
                this.txtButtonEnter = 'Restrarse';
              },
            });
        });
    }
  }

  onGoingHome() {
    this.router.navigateByUrl(this.backUri);
  }

}
