import { Injectable } from '@angular/core';
import { HttpRequestService } from '../core/controllers/http-request.service';
import { DatabaseService } from '../core/controllers/database.service';
import { PhotoService } from '../core/controllers/photo.service';
import { SessionService } from '../core/controllers/session.service';
import { BehaviorSubject, take } from 'rxjs';
import { DATABASE_WAITING_MESSAGE } from '../core/constants/message-code';

const BASE_URI = '/general-count-auditory';

@Injectable({
  providedIn: 'root'
})
export class GeneralCountAuditoryService {

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
      INSERT INTO general_count_auditory (title, date, time, description, lat, lng, status, creation_date, update_date, user_id)
      VALUES ("${data.title}", "${data.date}", "${data.time}", "${data.description}", "${data.lat}", "${data.lng}", 1, "${now}", "${now}", ${userId});
    `);
  }

  getLastSavedId() {
    const userId = this.sessionService.userId;
    return this.databaseService.executeQuery(`SELECT MAX(id) AS id FROM general_count_auditory WHERE status = 1 AND user_id = ${userId} LIMIT 1;`);
  }

  getLocalList() {
    const userId = this.sessionService.userId;
    const result = new BehaviorSubject<any>(DATABASE_WAITING_MESSAGE);

    this.databaseService
      .executeQuery(`
        SELECT
          general_count_auditory.id,
          general_count_auditory.title,
          general_count_auditory.date,
          general_count_auditory.status,
          general_count_auditory_count.id AS countId
        FROM general_count_auditory
        LEFT JOIN general_count_auditory_count ON general_count_auditory.id = general_count_auditory_count.general_count_auditory_id
        WHERE general_count_auditory.user_id = ${userId};`)
      .subscribe({
        next: res => {
          if (res !== DATABASE_WAITING_MESSAGE) {
            const auditoryResult: any[] = [];
            if (res.values && res.values.length > 0) {
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
    return this.databaseService.executeQuery(`SELECT * FROM general_count_auditory WHERE id = ${id} AND (status = 1 OR status = 2);`);
  }

  getUpdateData(id: string) {
    return this.databaseService.executeQuery(`SELECT * FROM general_count_auditory WHERE id = ${id};`);
  }

  updateLocal(id: string, data: any) {
    const now = new Date().toISOString();
    return this.databaseService.executeQuery(`UPDATE general_count_auditory SET title = "${data.title}", date = "${data.date}", time = "${data.time}", description = "${data.description}", lat = "${data.lat}", lng = "${data.lng}", update_date = "${now}" WHERE id = ${id};`);
  }

  finishAuditory(id: string) {
    const now = new Date().toISOString();
    return this.databaseService.executeQuery(`UPDATE general_count_auditory SET status = 2, update_date = "${now}" WHERE id = ${id};`);
  }

  updateExternalId(localId: string, externalId: string) {
    const now = new Date().toISOString();
    return this.databaseService.executeQuery(`UPDATE general_count_auditory SET remote_id = ${externalId}, update_date = "${now}" WHERE id = ${localId};`);
  }

  closeLocal(id: string, note: string) {
    const now = new Date().toISOString();
    return this.databaseService.executeQuery(`UPDATE general_count_auditory SET close_note = "${note}", status = 2, update_date = "${now}" WHERE id = ${id};`);
  }

  deleteLocal(id: string) {
    const result = new BehaviorSubject<any>(DATABASE_WAITING_MESSAGE);
    this.databaseService
      .executeQuery(`SELECT dir FROM general_count_auditory_evidences WHERE general_count_auditory_id = ${id}`)
      .subscribe(directories => {
        if (directories !== DATABASE_WAITING_MESSAGE) {
          directories.values.forEach((dir: any) => {
            this.photoService.removeLocalEvidence(dir.dir)
          });
          this.databaseService
            .executeQuery(`DELETE FROM general_count_auditory_evidences WHERE general_count_auditory_id = ${id}`)
            .subscribe(rm => {
              if (rm !== DATABASE_WAITING_MESSAGE) {

                setTimeout(() => {
                  this.databaseService
                    .executeQuery(`DELETE FROM general_count_auditory_count WHERE general_count_auditory_id = ${id}`)
                    .subscribe(rm => {
                      if (rm !== DATABASE_WAITING_MESSAGE) {

                        setTimeout(() => {
                          this.databaseService.executeQuery(`
                            DELETE FROM general_count_auditory
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
      .executeQuery(`DELETE FROM general_count_auditory WHERE id = ${id};`);
  }

  getFinalNotes(auditoryId: string) {
    return this.databaseService
      .executeQuery(`SELECT close_note FROM general_count_auditory WHERE id = ${auditoryId}`);
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
