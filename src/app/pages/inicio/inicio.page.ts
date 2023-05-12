import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { SessionService } from 'src/app/core/controllers/session.service';
import { AuditoryService } from 'src/app/services/auditory.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
})
export class InicioPage implements OnInit {

  auditoriesCount = 0;

  constructor(
    private auditoryService: AuditoryService,
    private sessionService: SessionService,
    private httpResponseService: HttpResponseService,
    private router: Router,
  ) { }

  ngOnInit() {

  }

  ionViewDidEnter() {
    this.auditoryService
      .getCount()
      .subscribe({
        next: res => {
          this.auditoriesCount = res.data;
          this.httpResponseService.onSuccess('Información recuperada')
        },
        error: err => this.httpResponseService.onError(err, 'No se pudo recuperar la información'),
      });
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

  onNewAuditory() {
    this.router.navigateByUrl('/auditory-form/0')
  }

  onAuditoryList() {
    this.router.navigateByUrl('/auditory-list')
  }

}
