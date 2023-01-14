import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-recover-account',
  templateUrl: './recover-account.page.html',
  styleUrls: ['./recover-account.page.scss'],
})
export class RecoverAccountPage implements OnInit {

  email = '';
  constructor(
    private authService: AuthService,
    private responseService: HttpResponseService,
  ) { }

  ngOnInit() {
  }

  onRecuperar() {
    this.authService
      .resetPassword(this.email)
      .subscribe({
        next: res => {
          console.log(res.data.token);
          this.authService.userId = res.data.id;
          this.responseService.onSuccessAndRedirect('/code', 'Solicitud recibida');
        },
        error: err => this.responseService.onError(err, 'No se pudo procesar la solicitud')
      });
  }

}
