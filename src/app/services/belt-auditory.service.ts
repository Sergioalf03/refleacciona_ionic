import { Injectable } from '@angular/core';
import { HttpRequestService } from '../core/controllers/http-request.service';
import { DatabaseService } from '../core/controllers/database.service';
import { PhotoService } from '../core/controllers/photo.service';
import { SessionService } from '../core/controllers/session.service';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { DATABASE_WAITING_MESSAGE } from '../core/constants/message-code';

const BASE_URI = '/belt-auditory';

@Injectable({
  providedIn: 'root'
})
export class BeltAuditoryService {

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
      INSERT INTO belt_auditory (title, date, time, description, lat, lng, status, creation_date, update_date, user_id)
      VALUES ("${data.title}", "${data.date}", "${data.time}", "${data.description}", "${data.lat}", "${data.lng}", 1, "${now}", "${now}", ${userId});
    `);
  }

  getLastSavedId() {
    const userId = this.sessionService.userId;
    return this.databaseService.executeQuery(`SELECT MAX(id) AS id FROM belt_auditory WHERE status = 1 AND user_id = ${userId} LIMIT 1;`);
  }

  getLocalList() {
    const userId = this.sessionService.userId;
    const result = new BehaviorSubject<any>(DATABASE_WAITING_MESSAGE);

    this.databaseService
      .executeQuery(`SELECT belt_auditory.id, title, date, status, belt_auditory_count.id AS countId FROM belt_auditory LEFT JOIN belt_auditory_count ON belt_auditory.id = belt_auditory_count.belt_auditory_id WHERE user_id = ${userId};`)
      .subscribe({
        next: res => {
          if (res !== DATABASE_WAITING_MESSAGE) {
            const auditoryResult: any[] = [];
            if (res.values.length > 0) {
              res.values.forEach((auditory: any, i: number, arr: any[]) => {
                setTimeout(() => {

                  auditoryResult.push({
                    id: auditory.id,
                    title: auditory.title,
                    date: auditory.date,
                    status: !!auditory.countId ? 2 : 1,
                    countId: auditory.countId,
                  });

                  if (auditoryResult.length === arr.length) {
                    result.next(auditoryResult);
                  }

                });
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
    return this.databaseService.executeQuery(`SELECT * FROM belt_auditory WHERE id = ${id} AND (status = 1 OR status = 2);`);
  }

  getUpdateData(id: string) {
    return this.databaseService.executeQuery(`SELECT * FROM belt_auditory WHERE id = ${id};`);
  }

  updateLocal(id: string, data: any) {
    const now = new Date().toISOString();
    return this.databaseService.executeQuery(`UPDATE belt_auditory SET title = "${data.title}", date = "${data.date}", time = "${data.time}", description = "${data.description}", lat = "${data.lat}", lng = "${data.lng}", update_date = "${now}" WHERE id = ${id};`);
  }

  finishAuditory(id: string) {
    const now = new Date().toISOString();
    return this.databaseService.executeQuery(`UPDATE belt_auditory SET status = 2, update_date = "${now}" WHERE id = ${id};`);
  }

  updateExternalId(localId: string, externalId: string) {
    const now = new Date().toISOString();
    return this.databaseService.executeQuery(`UPDATE belt_auditory SET remote_id = ${externalId}, update_date = "${now}" WHERE id = ${localId};`);
  }

  closeLocal(id: string, note: string) {
    const now = new Date().toISOString();
    return this.databaseService.executeQuery(`UPDATE belt_auditory SET close_note = "${note}", status = 2, update_date = "${now}" WHERE id = ${id};`);
  }

  deleteLocal(id: string) {
    const result = new BehaviorSubject<any>(DATABASE_WAITING_MESSAGE);
    this.databaseService
      .executeQuery(`SELECT dir FROM belt_auditory_evidences WHERE belt_auditory_id = ${id}`)
      .subscribe(directories => {
        if (directories !== DATABASE_WAITING_MESSAGE) {
          directories.values.forEach((dir: any) => {
            this.photoService.removeLocalAuditoryEvidence(dir.dir)
          });
          this.databaseService
            .executeQuery(`DELETE FROM belt_auditory_evidences WHERE belt_auditory_id = ${id}`)
            .subscribe(rm => {
              if (rm !== DATABASE_WAITING_MESSAGE) {

                setTimeout(() => {
                  this.databaseService
                    .executeQuery(`DELETE FROM belt_auditory_count WHERE belt_auditory_id = ${id}`)
                    .subscribe(rm => {
                      if (rm !== DATABASE_WAITING_MESSAGE) {

                        setTimeout(() => {
                          this.databaseService.executeQuery(`
                            DELETE FROM belt_auditory
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
        }
      });

    return result.pipe(take(2));
  }

  finalDelete(id: string) {
    return this.databaseService
      .executeQuery(`DELETE FROM belt_auditory WHERE id = ${id};`);
  }

  getFinalNotes(auditoryId: string) {
    return this.databaseService
      .executeQuery(`SELECT close_note FROM belt_auditory WHERE id = ${auditoryId}`);
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
