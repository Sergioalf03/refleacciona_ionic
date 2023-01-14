import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { RandomStringService } from 'src/app/core/controllers/random-string.service';
import { SessionService } from 'src/app/core/controllers/session.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage implements OnInit {

  user: any = {};
  txtButtonEnter = 'GUARDAR';
  btnLoading: boolean = false;
  constructor(
    private randomService: RandomStringService,
    private sessionService: SessionService,
    private httpResponseService: HttpResponseService,
    private authService: AuthService
  ) {
    this.btnLoading = false;
  }

  ngOnInit() {

  }

  onRegister( formRegister: NgForm ) {
    this.txtButtonEnter = 'REGISTRANDO...';
    this.btnLoading = true;

    if (formRegister.invalid) { return; }

    this.user['key'] = this.randomService.generate(128);
    this.sessionService
      .register(this.user)
      .subscribe({
        next: (res:any) => {
          console.log(res.data.token);
          this.authService.userId = res.data.id;
          this.httpResponseService.onSuccessAndRedirect('/email-confirmation','Usuario registrado correctamente.');
          this.resetForm(formRegister);
        },
        error: err => {
          this.httpResponseService.onError(err, '');
          this.resetForm();
        },
      });
  }

  resetForm(form?: NgForm) {
    if(form){form.reset();}

    this.txtButtonEnter = 'GUARDAR';
    this.btnLoading = false;
  }
}
