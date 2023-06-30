import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Route, Router } from '@angular/router';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { LoadingService } from 'src/app/core/controllers/loading.service';
import { RandomStringService } from 'src/app/core/controllers/random-string.service';
import { SessionService } from 'src/app/core/controllers/session.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {

  user: any = {};
  txtButtonEnter = 'INGRESAR';

  constructor(
    private router:Router,
    private sessionService: SessionService,
    private randomService: RandomStringService,
    private loadingService: LoadingService,
    private httpResponseService: HttpResponseService
  ) {}

  onRecuperar() {
    this.router.navigateByUrl('/recover');
  }


  onLogin( formLogin: NgForm ) {
    if (formLogin.invalid) { return; }
    this.txtButtonEnter = 'Cargando...';
    this.loadingService.showLoading();

    this.user['deviceId'] = this.randomService.generate(128);
    this.sessionService.login(this.user.email,this.user.password,this.user['deviceId'])
    .subscribe({
      next: (res:any) => {
        // this.httpResponseService.onSuccessAndRedirect('/home','Inicio de sesión correcto');
        this.loadingService.dismissLoading();
        this.router.navigateByUrl('/home');
        this.resetForm(formLogin);
      },
      error: err => {
        this.httpResponseService.onError(err, 'Las credenciales no son correctas');
      },
    });
    // formLogin.reset();
    // this.router.navigateByUrl('/home');
  }

  onRegistrar() {
    this.router.navigateByUrl('/register');
  }

  resetForm(form?: NgForm) {
    if(form){form.reset();}

    this.txtButtonEnter = 'INGRESAR';
  }

}
