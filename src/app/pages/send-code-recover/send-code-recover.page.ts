import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-send-code-recover',
  templateUrl: './send-code-recover.page.html',
  styleUrls: ['./send-code-recover.page.scss'],
})
export class SendCodeRecoverPage implements OnInit {

  id = '';
  code = '';
  password = '';

  constructor(
    private authService: AuthService,
    private responseService: HttpResponseService,
  ) { }

  ngOnInit() {
  }

  onSendCode() {
    this.authService
      .changePassword(this.authService.userId, this.code, this.password)
      .subscribe({
        next: res => {
          console.log(res.data);
          this.responseService.onSuccessAndRedirect('/login', 'Contraseña cambiada');
        },
        error: err => this.responseService.onError(err, 'No se pudo cambiar la contraseña')
      });
  }

}
