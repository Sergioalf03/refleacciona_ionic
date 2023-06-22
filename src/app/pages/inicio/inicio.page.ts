import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { SessionService } from 'src/app/core/controllers/session.service';
import { AuditoryService } from 'src/app/services/auditory.service';
import { DatabaseService } from 'src/app/core/controllers/database.service';
import { SQLiteService } from 'src/app/core/controllers/sqlite.service';
import { timeout } from 'rxjs';
import { QuestionService } from 'src/app/services/question.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
})
export class InicioPage implements OnInit, AfterViewInit {

  auditoriesCount = 0;

  sqlite: any;
  platform?: string;
  handlerPermissions: any;
  initPlugin: boolean = false;

  constructor(
    private auditoryService: AuditoryService,
    private sessionService: SessionService,
    private httpResponseService: HttpResponseService,
    private databaseService: DatabaseService,
    private questionService: QuestionService,
    private router: Router,
  ) { }

  ngOnInit() {

  }

  ionViewDidEnter() {
    this.databaseService.initConnection()
      .then(databases => {
        console.log(databases)
        this.databaseService
          .checkDatabaseVersion()
          .then(() => {
            this.auditoryService
              .getCount()
              .subscribe({
                next: res => {
                  this.auditoriesCount = res.data;
                  // this.httpResponseService.onSuccess('Información recuperada')
                },
                error: err => this.httpResponseService.onError(err, 'No se pudo recuperar la información'),
              });
          })
        ;
      });

    // this.databaseService.ngetProductList().subscribe({
    //   next: (res: any) => console.log(res),
    //   error: (err: any) => console.log(err),
    // })
  }

  ionViewWillLeave() {
    this.databaseService.closeConnection();
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

  async ngAfterViewInit() {
  }

}
