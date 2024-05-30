import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonModal, Platform } from '@ionic/angular';
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
  txtButtonEnter = 'Entrar';
  onScreen = false;
  @ViewChild(IonModal) modal!: IonModal;

  disableLoginButton = false;

  @ViewChild(IonContent) content!: IonContent;

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

  ionViewWillEnter() {
    this.onScreen = true;
  }

  ionViewDidEnter() {
    setTimeout(()=> {
      this.content.scrollToBottom(1)
        .then(() => {
          this.content.scrollToTop(1);
        });
    }, 200);
  }

  ionViewWillLeave() {
    this.onScreen = false;
  }

  onRecuperar() {
    this.router.navigateByUrl(URI_RECOVER_ACCOUNT());
  }


  onLogin( formLogin: NgForm ) {
    if (formLogin.invalid) { return; }
    this.txtButtonEnter = 'Cargando...';
    this.disableLoginButton = true;
    this.loadingService.showLoading();

    this.user['deviceId'] = this.randomService.generate(128);
    this.sessionService.login(this.user.email,this.user.password,this.user['deviceId'])
    .subscribe({
      next: (res:any) => {
        this.loadingService.dismissLoading();
        this.router.navigateByUrl(URI_HOME());
        this.resetForm(formLogin);
        this.disableLoginButton = false;
        this.txtButtonEnter = 'Entrar';
      },
      error: err => {
        this.httpResponseService.onError(err, 'Las credenciales no son correctas');
        this.disableLoginButton = false;
        this.txtButtonEnter = 'Entrar';
      },
    });
  }

  onRegistrar() {
    this.router.navigateByUrl(URI_REGISTER());
  }

  resetForm(form?: NgForm) {
    if(form){form.reset();}

    this.txtButtonEnter = 'Log In';
  }

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm() {
    this.modal.dismiss(null, 'confirm');
  }

}
