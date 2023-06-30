import { Component } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmDialogService } from 'src/app/core/controllers/confirm-dialog.service';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { LoadingService } from 'src/app/core/controllers/loading.service';
import { RandomStringService } from 'src/app/core/controllers/random-string.service';
import { SessionService } from 'src/app/core/controllers/session.service';
import { ValidFormService } from 'src/app/core/controllers/valid-form.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
})
export class RegisterPage {

  form!: FormGroup;

  user: any = {};
  txtButtonEnter = 'GUARDAR';

  constructor(
    private randomService: RandomStringService,
    private sessionService: SessionService,
    private httpResponseService: HttpResponseService,
    private authService: AuthService,
    private validFormService: ValidFormService,
    private router: Router,
    private loadingService: LoadingService,
    private confirmDialogService: ConfirmDialogService,
  ) {}

  private initForm() {
    this.form = new FormGroup({
      name: new FormControl('', {
        validators: [ Validators.required ],
      }),
      phoneNumber: new FormControl('', {
        validators: [ Validators.required ],
      }),
      email: new FormControl('', {
        validators: [ Validators.required ],
      }),
      password: new FormControl('', {
        validators: [ Validators.required ],
      }),
    })
  }

  ngOnInit() {}

  ionViewWillEnter() {
    this.initForm();
  }

  onSubmit() {
    if (this.validFormService.isValid(this.form, [])) {
      this.confirmDialogService
        .presentAlert('¿Desea envíar el registro?', () => {
          this.loadingService.showLoading();

          const user = {
            name: this.form.controls['name'].value,
            email: this.form.controls['email'].value,
            password: this.form.controls['password'].value,
            phone_number: this.form.controls['phoneNumber'].value,
            key: this.randomService.generate(128),
          };

          this.sessionService
            .register(user)
            .subscribe({
              next: () => {
                this.authService.email = user.email;
                this.httpResponseService.onSuccessAndRedirect('/email-confirmation/0', 'Usuario registrado correctamente.');
                this.form.reset();
              },
              error: err => {
                this.httpResponseService.onError(err, 'No se pudo registrar el usuario');
              },
            });
        });
    }
  }

  onGoingHome() {
    this.router.navigateByUrl('/login');
  }

}
