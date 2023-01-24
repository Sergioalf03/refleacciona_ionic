import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { ValidFormService } from 'src/app/core/controllers/valid-form.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-recover-account',
  templateUrl: './recover-account.page.html',
  styleUrls: ['./recover-account.page.scss'],
})
export class RecoverAccountPage implements OnInit {

  email = '';
  submitLoading = false;

  form!: FormGroup;

  constructor(
    private authService: AuthService,
    private validFormService: ValidFormService,
    private responseService: HttpResponseService,
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
      this.submitLoading = true;

      this.authService
        .resetPassword(this.email)
        .subscribe({
          next: res => {
            console.log(res.data.token);
            this.submitLoading = false;
            this.authService.userId = res.data.id;
            this.responseService.onSuccessAndRedirect('/code', 'Solicitud recibida');
          },
          error: err => {
            this.responseService.onError(err, 'No se pudo procesar la solicitud');
            this.submitLoading = false;
          }
        });
    }
  }

  onGoingHome() {
    this.router.navigateByUrl('/login');
  }

}
