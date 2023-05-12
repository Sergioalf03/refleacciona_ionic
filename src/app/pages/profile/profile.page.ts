import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { SessionService } from 'src/app/core/controllers/session.service';
import { ValidFormService } from 'src/app/core/controllers/valid-form.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
})
export class ProfilePage implements OnInit {

  form!: FormGroup;

  user: any = {};
  txtButtonEnter = 'GUARDAR';
  btnLoading: boolean = false;

  constructor(
    private sessionService: SessionService,
    private httpResponseService: HttpResponseService,
    private validFormService: ValidFormService,
    private router: Router,
  ) {
    this.btnLoading = false;
  }

  private initForm() {
    this.form = new FormGroup({
      name: new FormControl('', {
        validators: [Validators.required],
      }),
      phoneNumber: new FormControl('', {
        validators: [Validators.required],
      }),
      email: new FormControl('', {
        validators: [Validators.required],
      }),
    })
  }

  ngOnInit() {
    this.sessionService
      .getProfileFormData()
      .subscribe({
        next: res => this.setData(res),
        error: err => console.log(err)
      })
  }

  private setData(data: any) {
    this.form.setValue({
      name: data.userName,
      phoneNumber: data.userPhone,
      email: data.userEmail,
    });
  }

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
      };

      this.sessionService
        .register(user)
        .subscribe({
          next: (res: any) => {
            console.log(res.data.token);
            // this.authService.userId = res.data.id;
            this.httpResponseService.onSuccessAndRedirect('/email-confirmation', 'Usuario registrado correctamente.');
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
