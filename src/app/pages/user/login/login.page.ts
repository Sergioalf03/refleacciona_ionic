import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { URI_HOME, URI_RECOVER_ACCOUNT, URI_REGISTER } from 'src/app/core/constants/uris';
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
    private httpResponseService: HttpResponseService,
    private platform: Platform,
  ) {
    this.platform
      .backButton
      .subscribeWithPriority(9999, () => {
        return;
        // processNextHandler();
      });
  }

  onRecuperar() {
    this.router.navigateByUrl(URI_RECOVER_ACCOUNT());
  }


  onLogin( formLogin: NgForm ) {
    if (formLogin.invalid) { return; }
    this.txtButtonEnter = 'Cargando...';
    this.loadingService.showLoading();

    this.user['deviceId'] = this.randomService.generate(128);
    this.sessionService.login(this.user.email,this.user.password,this.user['deviceId'])
    .subscribe({
      next: (res:any) => {
        this.loadingService.dismissLoading();
        this.router.navigateByUrl(URI_HOME());
        this.resetForm(formLogin);
      },
      error: err => {
        this.httpResponseService.onError(err, 'Las credenciales no son correctas');
      },
    });
  }

  onRegistrar() {
    this.router.navigateByUrl(URI_REGISTER());
  }

  resetForm(form?: NgForm) {
    if(form){form.reset();}

    this.txtButtonEnter = 'INGRESAR';
  }

}
