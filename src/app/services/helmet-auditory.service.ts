import { Injectable } from '@angular/core';
import { SessionService } from '../core/controllers/session.service';
import { PhotoService } from '../core/controllers/photo.service';
import { DatabaseService } from '../core/controllers/database.service';
import { HttpRequestService } from '../core/controllers/http-request.service';
import { DATABASE_WAITING_MESSAGE } from '../core/constants/message-code';
import { BehaviorSubject, take } from 'rxjs';

const BASE_URI = '/helmet-auditory';

@Injectable({
  providedIn: 'root'
})
export class HelmetAuditoryService {

  constructor(
    private httpService: HttpRequestService,
    private databaseService: DatabaseService,
    private photoService: PhotoService,
    private sessionService: SessionService,
  ) { }

  localSave(data: any) {
    const now = new Date().toISOString();
    const userId = this.sessionService.userId;
    return this.databaseService.executeQuery(`
      INSERT INTO helmet_auditory (title, date, time, description, lat, lng, status, creation_date, update_date, user_id)
      VALUES ("${data.title}", "${data.date}", "${data.time}", "${data.description}", "${data.lat}", "${data.lng}", 1, "${now}", "${now}", ${userId});
    `);
  }

  getLastSavedId() {
    const userId = this.sessionService.userId;
    return this.databaseService.executeQuery(`SELECT MAX(id) AS id FROM helmet_auditory WHERE status = 1 AND user_id = ${userId} LIMIT 1;`);
  }

  getLocalList() {
    const userId = this.sessionService.userId;
    const result = new BehaviorSubject<any>(DATABASE_WAITING_MESSAGE);

    this.databaseService
      .executeQuery(`SELECT id, title, date, status FROM helmet_auditory ;`)
      .subscribe({
        next: res => {
          console.log(res)
          if (res !== DATABASE_WAITING_MESSAGE) {
            const auditoryResult: any[] = [];
            if (res.values.length > 0) {
              res.values.forEach((auditory: any, i: number, arr: any[]) => {
                setTimeout(() => {
                  this.databaseService
                    .executeQuery(`SELECT questions.section_id FROM answers JOIN questions ON questions.id = answers.question_id WHERE answers.auditory_id = ${auditory.id} ORDER BY answers.id DESC LIMIT 1`)
                    .subscribe({
                      next: lastAnswer => {
                        if (lastAnswer !== DATABASE_WAITING_MESSAGE) {
                          setTimeout(() => {
                            this.databaseService
                              .executeQuery(`SELECT count(*) as answers FROM answers WHERE auditory_id = ${auditory.id};`)
                              .subscribe({
                                next: answerCount => {
                                  if (answerCount !== DATABASE_WAITING_MESSAGE) {
                                    setTimeout(() => {
                                      this.databaseService
                                        .executeQuery('SELECT count(*) as questions FROM questions WHERE status = 1')
                                        .subscribe({
                                          next: questionCount => {
                                            if (questionCount !== DATABASE_WAITING_MESSAGE) {

                                              auditoryResult.push({
                                                id: auditory.id,
                                                title: auditory.title,
                                                date: auditory.date,
                                                status: auditory.status,
                                                lastIndex: lastAnswer.values[0] ? lastAnswer.values[0].section_id : 1,
                                                answersCompleted: answerCount.values[0].answers === questionCount.values[0].questions,
                                              });

                                              if (auditoryResult.length === arr.length) {
                                                result.next(auditoryResult);
                                              }
                                            }
                                          }
                                        });
                                    }, (60 * i) - 20)

                                  }
                                }
                              })
                          }, (60 * i) - 40)
                        }
                      }
                    });
                }, 60 * i);
              });
            } else {
              result.next(auditoryResult);
            }

          }
        }
      });

    return result.asObservable().pipe(take(2));
  }

  getLocalForm(id: string) {
    return this.databaseService.executeQuery(`SELECT * FROM helmet_auditory WHERE id = ${id} AND (status = 1 OR status = 2);`);
  }

  getUpdateData(id: string) {
    return this.databaseService.executeQuery(`SELECT * FROM helmet_auditory WHERE id = ${id};`);
  }

  updateLocal(id: string, data: any) {
    const now = new Date().toISOString();
    return this.databaseService.executeQuery(`UPDATE helmet_auditory SET title = "${data.title}", date = "${data.date}", time = "${data.time}", description = "${data.description}", lat = "${data.lat}", lng = "${data.lng}", update_date = "${now}" WHERE id = ${id};`);
  }

  finishAuditory(id: string) {
    const now = new Date().toISOString();
    return this.databaseService.executeQuery(`UPDATE helmet_auditory SET status = 2, update_date = "${now}" WHERE id = ${id};`);
  }

  updateExternalId(localId: string, externalId: string) {
    const now = new Date().toISOString();
    return this.databaseService.executeQuery(`UPDATE helmet_auditory SET remote_id = ${externalId}, update_date = "${now}" WHERE id = ${localId};`);
  }

  closeLocal(id: string, note: string) {
    const now = new Date().toISOString();
    return this.databaseService.executeQuery(`UPDATE helmet_auditory SET close_note = "${note}", status = 2, update_date = "${now}" WHERE id = ${id};`);
  }

  deleteLocal(id: string) {
    const result = new BehaviorSubject<any>(DATABASE_WAITING_MESSAGE);
    this.databaseService
      .executeQuery(`SELECT dir FROM auditory_evidences WHERE auditory_id = ${id}`)
      .subscribe(directories => {
        if (directories !== DATABASE_WAITING_MESSAGE) {
          directories.values.forEach((dir: any) => {
            this.photoService.removeLocalAuditoryEvidence(dir.dir)
          });
          this.databaseService
            .executeQuery(`DELETE FROM auditory_evidences WHERE auditory_id = ${id}`)
            .subscribe(rm => {
              if (rm !== DATABASE_WAITING_MESSAGE) {

                setTimeout(() => {
                  this.databaseService
                    .executeQuery(`SELECT dir FROM answer_evidences WHERE auditory_id = ${id}`)
                    .subscribe(directories2 => {
                      if (directories2 !== DATABASE_WAITING_MESSAGE) {
                        directories2.values.forEach((dir: any) => {
                          this.photoService.removeLocalAnswerEvidence(dir.dir)
                        });

                        setTimeout(() => {
                          this.databaseService
                            .executeQuery(`DELETE FROM answer_evidences WHERE auditory_id = ${id}`)
                            .subscribe(rm => {
                              if (rm !== DATABASE_WAITING_MESSAGE) {

                                setTimeout(() => {
                                  this.databaseService
                                    .executeQuery(`DELETE FROM answers WHERE auditory_id = ${id}`)
                                    .subscribe(rm => {
                                      if (rm !== DATABASE_WAITING_MESSAGE) {

                                        setTimeout(() => {
                                          this.databaseService.executeQuery(`
                                            DELETE FROM helmet_auditory
                                            WHERE id = ${id};
                                          `)
                                            .subscribe({
                                              next: () => result.next('deleted')
                                            });
                                        }, 20);

                                      }
                                    });
                                }, 20);
                              }
                            });
                        }, 20)
                      }
                    });
                }, 30);

              }
            });
        }
      });

    return result.pipe(take(2));
  }

  finalDelete(id: string) {
    return this.databaseService
      .executeQuery(`DELETE FROM helmet_auditory WHERE id = ${id};`);
  }

  getFinalNotes(auditoryId: string) {
    return this.databaseService
      .executeQuery(`SELECT close_note FROM helmet_auditory WHERE id = ${auditoryId}`);
  }

  // Remote

  getRemoteList() {
    return this.httpService
      .get(`${BASE_URI}/list`)
  }

  getRemoteDetail(id: string) {
    return this.httpService
      .get(`${BASE_URI}/detail/${id}`);
  }

  downloadPdf(id: string) {
    return this.httpService
      .downloadGet(`${BASE_URI}/pdf/${id}`);
  }

  upload(data: any) {
    return this.httpService.post(`${BASE_URI}/import`, data);
  }

}
