import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpResponseService } from 'src/app/core/controllers/http-response.service';
import { SessionService } from 'src/app/core/controllers/session.service';
import { AuditoryService } from 'src/app/services/auditory.service';
import { DatabaseService } from 'src/app/core/controllers/database.service';
import { SQLiteService } from 'src/app/core/controllers/sqlite.service';
import { timeout } from 'rxjs';
import { QuestionService } from 'src/app/services/question.service';
import { ConfirmDialogService } from 'src/app/core/controllers/confirm-dialog.service';
import { VersionService } from 'src/app/services/version.service';

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
    private sessionService: SessionService,
    private httpResponseService: HttpResponseService,
    private databaseService: DatabaseService,
    private router: Router,
    private versionService: VersionService,
    private confirmDialogService: ConfirmDialogService,
  ) { }

  ngOnInit() {
    this.databaseService
      .checkDatabaseVersion()
      .then((localVersion: any) => {
        this.versionService
          .checkLastVersion()
          .subscribe({
            next: res => {
              const localVersionLowerThanRemote = (localVersion === 'new' ? 1 : +localVersion.values[0].number) < +res.data.number;
              if (localVersionLowerThanRemote) {
                this.confirmDialogService.presentAlert('Hay una nueva versión del formulario de auditorías. ¿Desea actualizar?', () => {
                  this.versionService
                    .getNewVersion()
                    .subscribe({
                      next: newVersionRes => {
                        let query = '';
                        let count = 0;

                        if (newVersionRes.data.sections.length > 0) {
                          newVersionRes.data.sections.forEach((s: any, i: number, arr: any[]) => {
                            this.databaseService
                              .executeQuery(`SELECT * FROM sections WHERE uid = "${s.uid}"`)
                              .subscribe({
                                next: questionExists => {
                                  if (questionExists !== 'waiting') {
                                    if (questionExists.values.length === 0) {
                                      query += `INSERT INTO sections (uid, name, subname, page, indx, status) VALUES ("${s.uid}", "${s.name}", "${s.subname}", ${s.page}, ${s.indx}, ${s.status}); `
                                    } else {
                                      query += `UPDATE sections SET uid = "${s.uid}", name = "${s.name}", subname = "${s.subname}", page = ${s.page}, indx = ${s.indx}, status = ${s.status}  WHERE uid = "${s.uid}"; `
                                    }

                                    count++;
                                    if (count === arr.length) {
                                      this.importQuestions(newVersionRes.data.questions, query);
                                    }
                                  }
                                }
                              })
                          });
                        } else {
                          this.importQuestions(newVersionRes.data.questions, query);
                        }
                      },
                      error: err => this.httpResponseService.onError(err, 'No se pudo recuperar la actualización'),
                    })
                });
              }
            },
            error: err => this.httpResponseService.onError(err, 'No se pudo recuperar'),
          });
      });
  }

  private importQuestions(questions: any[], sectionsQuery: string) {
    let query = '';
    let count = 0;

    if (questions.length > 0) {
      questions.forEach((q: any, i: number, arr: any[]) => {
        this.databaseService
          .executeQuery(`SELECT * FROM questions WHERE uid = "${q.uid}"`)
          .subscribe({
            next: questionExists => {
              if (questionExists !== 'waiting') {
                if (questionExists.values.length === 0) {
                  query += `INSERT INTO questions (section_id, uid, score, cond, has_evidence, indx, status, sentence, answers, popup) VALUES (${q.section_id}, "${q.uid}", ${q.score}, "${q.cond}", ${q.has_evidence}, ${q.indx}, ${q.status}, "${q.sentence}", '${q.answers}', "${q.popup}"); `
                } else {
                  query += `UPDATE questions SET uid = "${q.uid}", score = ${q.score}, cond = "${q.cond}", has_evidence = ${q.has_evidence}, indx = ${q.indx}, status = ${q.status}, sentence = "${q.sentence}", answers = '${q.answers}', popup = "${q.popup}") WHERE uid = "${q.uid}"; `
                }

                count++;
                if (count === arr.length) {
                  this.updateAuditories(sectionsQuery + query);
                }
              }
            }
          })
      });
    }
  }

  updateAuditories(query: string) {
    this.databaseService
      .executeQuery(query)
      .subscribe({
        next: result => {
          // finishLoading;
        }
      });
  }

  ionViewDidEnter() {
    // this.databaseService.ngetProductList().subscribe({
    //   next: (res: any) => true,
    //   error: (err: any) => true,
    // })
  }

  ionViewWillLeave() {
  }

  onLogout() {
    this.confirmDialogService
      .presentAlert('¿Desea cerrar sesión?', async () => {
        return await this.sessionService.logout()
        .subscribe({
          next: (res:any) => {
            this.router.navigateByUrl('/login')
            // this.httpResponseService.onSuccessAndRedirect('/login', 'Sesión cerrada');
          },
          error: err => {
            this.httpResponseService.onError(err, '');
          },
        })
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
