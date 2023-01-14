import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Route, Router } from '@angular/router';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { RandomStringService } from 'src/app/core/controllers/random-string.service';
import { SessionService } from 'src/app/core/controllers/session.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  user: any = {};
  txtButtonEnter = 'INGRESAR';
  btnLoading: boolean = false;
  constructor( private router:Router,
              private sessionService: SessionService,
              private randomService: RandomStringService,
              private httpResponseService: HttpResponseService) { 

                this.btnLoading = false;
              }

  ngOnInit() {
  }

  onRecuperar() {
    this.router.navigateByUrl('/recover');
  }


  onLogin( formLogin: NgForm ) {
    if (formLogin.invalid) { return; }
    this.txtButtonEnter = 'Cargando...';
    this.btnLoading = true;

    this.user['deviceId'] = this.randomService.generate(128);
    this.sessionService.login(this.user.email,this.user.password,this.user['deviceId'])
    .subscribe({
      next: (res:any) => {
        this.httpResponseService.onSuccessAndRedirect('/home','Inicio de sesión correcto');
        this.resetForm(formLogin);
      },
      error: err => {
        this.httpResponseService.onError(err, '');
        
        this.resetForm();
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
    this.btnLoading = false;
  }

}
