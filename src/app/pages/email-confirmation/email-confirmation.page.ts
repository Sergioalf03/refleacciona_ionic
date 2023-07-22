import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { URI_LOGIN } from 'src/app/core/constants/uris';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { LoadingService } from 'src/app/core/controllers/loading.service';
import { ValidFormService } from 'src/app/core/controllers/valid-form.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-email-confirmation',
  templateUrl: './email-confirmation.page.html',
})
export class EmailConfirmationPage implements OnInit {

  form!: FormGroup;
  backUri = URI_LOGIN();

  showEmail = false;

  constructor(
    private authService: AuthService,
    private validFormService: ValidFormService,
    private responseService: HttpResponseService,
    private route: ActivatedRoute,
    private loadingService: LoadingService,
    private platform: Platform,
    private router: Router,
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
      })
  }

  ionViewWillEnter() {
    this.initForm();
  }

  onSubmit() {
    if (this.validFormService.isValid(this.form, [])) {
      this.loadingService.showLoading();

      const code = `${this.form.controls['code1'].value}${this.form.controls['code2'].value}${this.form.controls['code3'].value}${this.form.controls['code4'].value}${this.form.controls['code5'].value}${this.form.controls['code6'].value}`;

      this.authService
        .confirmEmail(this.form.controls['email'].value, code)
        .subscribe({
          next: () => this.responseService.onSuccessAndRedirect(this.backUri, 'Correo confirmado'),
          error: err => this.responseService.onError(err, 'No se pudo confirmar el correo'),
        });
    }
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
