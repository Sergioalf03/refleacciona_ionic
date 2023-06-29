import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { RandomStringService } from 'src/app/core/controllers/random-string.service';
import { SessionService } from 'src/app/core/controllers/session.service';
import { ValidFormService } from 'src/app/core/controllers/valid-form.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  form!: FormGroup;

  user: any = {};
  txtButtonEnter = 'GUARDAR';
  btnLoading: boolean = false;

  constructor(
    private randomService: RandomStringService,
    private sessionService: SessionService,
    private httpResponseService: HttpResponseService,
    private authService: AuthService,
    private validFormService: ValidFormService,
    private router: Router,
  ) {
    this.btnLoading = false;
  }

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
      this.btnLoading = true;

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
          next: (res:any) => {
            this.authService.userId = res.data.id;
            this.httpResponseService.onSuccessAndRedirect('/email-confirmation','Usuario registrado correctamente.');
            this.resetForm();
          },
          error: err => {
            this.httpResponseService.onError(err, '');
            this.resetForm();
          },
        });
    }
  }

  resetForm() {
    this.form.reset();
    this.btnLoading = false;
  }

  onGoingHome() {
    this.router.navigateByUrl('/login');
  }

}
