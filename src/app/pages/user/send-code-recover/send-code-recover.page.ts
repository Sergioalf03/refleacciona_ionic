import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { URI_LOGIN } from 'src/app/core/constants/uris';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { LoadingService } from 'src/app/core/controllers/loading.service';
import { ValidFormService } from 'src/app/core/controllers/valid-form.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-send-code-recover',
  templateUrl: './send-code-recover.page.html',
})
export class SendCodeRecoverPage implements OnInit {

  form!: FormGroup;
  backUri = URI_LOGIN();

  showEmail = false;

  constructor(
    private authService: AuthService,
    private responseService: HttpResponseService,
    private validFormService: ValidFormService,
    private loadingService: LoadingService,
    private router: Router,
    private route: ActivatedRoute,
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
      code1: new FormControl('', {
        validators: [
          Validators.required,
          Validators.maxLength(1)
        ]
      }),
      code2: new FormControl('', {
        validators: [
          Validators.required,
          Validators.maxLength(1)
        ]
      }),
      code3: new FormControl('', {
        validators: [
          Validators.required,
          Validators.maxLength(1)
        ]
      }),
      code4: new FormControl('', {
        validators: [
          Validators.required,
          Validators.maxLength(1)
        ]
      }),
      code5: new FormControl('', {
        validators: [
          Validators.required,
          Validators.maxLength(1)
        ]
      }),
      code6: new FormControl('', {
        validators: [
          Validators.required,
          Validators.maxLength(1)
        ]
      }),
      password: new FormControl('', {
        validators: [
          Validators.required,
          Validators.minLength(8),
        ]
      }),
      email: new FormControl(this.authService.email, {
        validators: [
          Validators.required,
        ]
      }),
    });
  }

  ngOnInit() {
    this.showEmail = false;
    this.route
      .paramMap
      .subscribe({
        next: paramMap => {
          this.showEmail = paramMap.get('withMail') === '1';
        },
      }).unsubscribe();
  }

  ionViewWillEnter() {
    this.initForm();
  }

  ionViewDidEnter() {
    this.authService.email = '';
  }

  onSubmit() {
    if (this.validFormService.isValid(this.form, [])) {
      this.loadingService.showLoading();
      const code = `${this.form.controls['code1'].value}${this.form.controls['code2'].value}${this.form.controls['code3'].value}${this.form.controls['code4'].value}${this.form.controls['code5'].value}${this.form.controls['code6'].value}`;

      const data = {
        email: this.form.controls['email'].value,
        token: code,
        password: this.form.controls['password'].value,
      }

      this.authService
        .changePassword(data)
        .subscribe({
          next: res => {
            this.responseService.onSuccessAndRedirect(this.backUri, 'Contraseña cambiada');
          },
          error: err => {
            this.responseService.onError(err, 'No se pudo cambiar la contraseña')
          }
        });
    }
  }

  onGoingHome() {
    this.router.navigateByUrl(this.backUri);
  }

  printEvent(event: any) {
  }

  setInputFocus(input: any) {
    if (input.focus) {
      const end = input.value.length;
      input.setSelectionRange(end, end);
      input.focus();
    } else {
      input.setFocus();
    }
  }

}
