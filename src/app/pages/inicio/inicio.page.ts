import { Component, OnInit } from '@angular/core';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { SessionService } from 'src/app/core/controllers/session.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
})
export class InicioPage implements OnInit {

  constructor(
    private sessionService: SessionService,
    private httpResponseService: HttpResponseService
  ) { }

  ngOnInit() {
  }
  async onLogout() {
    return await this.sessionService.logout()
    .subscribe({
      next: (res:any) => {
        console.log(res);
        this.httpResponseService.onSuccessAndRedirect('/login', 'Sesión cerrada');
      },
      error: err => {
        this.httpResponseService.onError(err, '');
      },
    })
  }

}
