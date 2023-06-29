import { Injectable } from '@angular/core';
import { HttpRequestService } from '../core/controllers/http-request.service';
import { DatabaseService } from '../core/controllers/database.service';
import { BehaviorSubject, Observable, take } from 'rxjs';
import { PhotoService } from '../core/controllers/photo.service';
import { SessionService } from '../core/controllers/session.service';

const BASE_URI = '/auditory';

@Injectable({
  providedIn: 'root'
})
export class AuditoryService {

  constructor(
    private httpService: HttpRequestService,
    private databaseService: DatabaseService,
    private photoService: PhotoService,
    private sessionService: SessionService,
  ) { }

  save(data: any) {
    return this.httpService.post(`${BASE_URI}/save`, data);
  }

  update(id: string, data: any) {
    return this.httpService.post(`${BASE_URI}/update/${id}`, data);
  }

  getList() {
    return this.httpService.get(`${BASE_URI}/list`);
  }

  getCount() {
    return this.httpService.get(`${BASE_URI}/count`);
  }

  getForm(id: string) {
    return this.httpService.get(`${BASE_URI}/form/${id}`);
  }

  getDetail(id: string) {

  }

  // local database
  localSave(data: any) {
    const now = new Date().toISOString();
    const userId = this.sessionService.userId;
    return this.databaseService.executeQuery(`
      INSERT INTO auditories (title, date, time, description, lat, lng, status, creationDate, updateDate, user_id)
      VALUES ("${data.title}", "${data.date}", "${data.time}", "${data.description}", "${data.lat}", "${data.lng}", 1, "${now}", "${now}", ${userId});
    `);
  }

  getLastSavedId() {
    const userId = this.sessionService.userId;
    return this.databaseService.executeQuery(`SELECT MAX(id) AS id FROM auditories WHERE status = 1 AND user_id = ${userId} LIMIT 1;`);
  }

  getLocalList() {
    const userId = this.sessionService.userId;
    const result = new BehaviorSubject<any>('waiting');

    this.databaseService
      .executeQuery(`SELECT id, title, date, status FROM auditories WHERE (status = 1 OR status = 2) AND user_id = ${userId};`)
      .subscribe({
        next: res => {
          if (res !== 'waiting') {

            const auditoryResult: any[] = [];

            res.values.forEach((auditory: any, i: number, arr: any[]) => {
              this.databaseService
                .executeQuery(`SELECT questions.section_id FROM answers JOIN questions ON questions.id = answers.question_id WHERE answers.auditory_id = ${auditory.id} ORDER BY answers.id DESC LIMIT 1`)
                .subscribe({
                  next: lastAnswer => {
                    if (lastAnswer !== 'waiting') {

                      this.databaseService
                        .executeQuery(`SELECT count(*) as answers FROM answers WHERE auditory_id = ${auditory.id};`)
                        .subscribe({
                          next: answerCount => {
                            if (answerCount !== 'waiting') {

                              this.databaseService
                                .executeQuery('SELECT count(*) as questions FROM questions WHERE status = 1')
                                .subscribe({
                                  next: questionCount => {
                                    if (questionCount !== 'waiting') {

                                      auditoryResult.push({
                                        id: auditory.id,
                                        title: auditory.title,
                                        date: auditory.date,
                                        status: auditory.status,
                                        lastIndex: lastAnswer.values[0].section_id,
                                        answersCompleted: answerCount.values[0].answers === questionCount.values[0].questions,
                                      });

                                      if (auditoryResult.length === arr.length) {
                                        result.next(auditoryResult);
                                      }
                                    }
                                  }
                                });
                            }
                          }
                        })
                    }
                  }
                });
            });
          }
        }
      });

    return result.asObservable().pipe(take(2));
  }

  getLocalForm(id: string) {
    return this.databaseService.executeQuery(`SELECT * FROM auditories WHERE id = ${id} AND (status = 1 OR status = 2);`);
  }

  updateLocal(id: string, data: any) {
    const now = new Date().toISOString();
    return this.databaseService.executeQuery(`
      UPDATE auditories SET title = "${data.title}", date = "${data.date}", time = "${data.time}", description = "${data.description}", lat = "${data.lat}", lng = "${data.lng}", updateDate = "${now}" WHERE id = ${id} AND status = 1;
    `);
  }

  closeLocal(id: string, note: string) {
    const now = new Date().toISOString();
    return this.databaseService.executeQuery(`
      UPDATE auditories
      SET close_note = "${note}", status = 2, updateDate = "${now}"
      WHERE id = ${id} AND status = 1;
    `);
  }

  deleteLocal(id: string) {
    const result = new BehaviorSubject<any>('waiting');
    this.databaseService
      .executeQuery(`SELECT dir FROM auditory_evidences WHERE auditory_id = ${id}`)
      .subscribe(directories => {
        if (directories !== 'waiting') {
          directories.values.forEach((dir: any) => {
            this.photoService.removeLocalAuditoryEvidence(dir.dir)
          });
          this.databaseService
            .executeQuery(`DELETE FROM auditory_evidences WHERE auditory_id = ${id}`)
            .subscribe(rm => {
              if (rm !== 'waiting') {

                this.databaseService
                  .executeQuery(`SELECT dir FROM answer_evidences WHERE auditory_id = ${id}`)
                  .subscribe(directories2 => {
                    if (directories2 !== 'waiting') {
                      directories2.values.forEach((dir: any) => {
                        this.photoService.removeLocalAnswerEvidence(dir.dir)
                      });
                      this.databaseService
                        .executeQuery(`DELETE FROM answer_evidences WHERE auditory_id = ${id}`)
                        .subscribe(rm => {
                          if (rm !== 'waiting') {

                            this.databaseService
                              .executeQuery(`DELETE FROM answers WHERE auditory_id = ${id}`)
                              .subscribe(rm => {
                                if (rm !== 'waiting') {

                                  this.databaseService.executeQuery(`
                                    DELETE FROM auditories
                                    WHERE id = ${id} AND status = 1;
                                  `)
                                  .subscribe({
                                    next: () => result.next('deleted')
                                  });

                                }
                              });
                          }
                        });
                    }
                  });

              }
            });
        }
      });

      return result.pipe(take(2));
  }

}
