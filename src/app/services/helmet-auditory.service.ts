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
      .executeQuery(`SELECT helmet_auditory.id, title, date, status, helmet_auditory_count.id AS countId FROM helmet_auditory LEFT JOIN helmet_auditory_count ON helmet_auditory.id = helmet_auditory_count.helmet_auditory_id WHERE user_id = ${userId};`)
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
                    status: !!auditory.countId ? 1 : 0,
                    countId: auditory.countId,
                  });

                  if (auditoryResult.length === arr.length) {
                    result.next(auditoryResult);
                  }

                })
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
      .executeQuery(`SELECT dir FROM helmet_auditory_evidences WHERE helmet_auditory_id = ${id}`)
      .subscribe(directories => {
        if (directories !== DATABASE_WAITING_MESSAGE) {
          directories.values.forEach((dir: any) => {
            this.photoService.removeLocalAuditoryEvidence(dir.dir)
          });
          this.databaseService
            .executeQuery(`DELETE FROM helmet_auditory_evidences WHERE helmet_auditory_id = ${id}`)
            .subscribe(rm => {
              if (rm !== DATABASE_WAITING_MESSAGE) {



                setTimeout(() => {
                  this.databaseService
                    .executeQuery(`DELETE FROM helmet_auditory_count WHERE helmet_auditory_id = ${id}`)
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
