import { Component, OnInit } from '@angular/core';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-email-confirmation',
  templateUrl: './email-confirmation.page.html',
})
export class EmailConfirmationPage implements OnInit {

  code = '';

  constructor(
    private authService: AuthService,
    private responseService: HttpResponseService,
  ) { }

  ngOnInit() {
  }

  onSendCode() {
    this.authService
      .confirmEmail(this.authService.userId, this.code)
      .subscribe({
        next: () => this.responseService.onSuccessAndRedirect('/login', 'Correo confirmado'),
        error: err => this.responseService.onError(err, 'No se pudo confirmar el correo'),
      });
  }


}
