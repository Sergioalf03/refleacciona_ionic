import { Injectable } from '@angular/core';
import { HttpRequestService } from '../core/controllers/http-request.service';
import { DatabaseService } from '../core/controllers/database.service';
import { BehaviorSubject, Observable, take } from 'rxjs';
import { PhotoService } from '../core/controllers/photo.service';

const BASE_URI = '/auditory';

@Injectable({
  providedIn: 'root'
})
export class AuditoryService {

  constructor(
    private httpService: HttpRequestService,
    private databaseService: DatabaseService,
    private photoService: PhotoService,
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
    return this.databaseService.executeQuery(`
      INSERT INTO auditories (title, date, description, lat, lng, status, creationDate, updateDate)
      VALUES ("${data.title}", "${data.date}", "${data.description}", "${data.lat}", "${data.lng}", 1, "${now}", "${now}");
    `);
  }

  getLastSavedId() {
    return this.databaseService.executeQuery(`SELECT MAX(id) AS id FROM auditories WHERE status = 1 LIMIT 1;`);
  }

  getLocalList() {
    return this.databaseService.executeQuery(`SELECT id, title, date FROM auditories WHERE status = 1;`);
  }

  getLocalForm(id: string) {
    return this.databaseService.executeQuery(`SELECT title, date, description, lat, lng FROM auditories WHERE id = ${id} AND status = 1;`);
  }

  updateLocal(id: string, data: any) {
    const now = new Date().toISOString();
    return this.databaseService.executeQuery(`
      UPDATE auditories
      SET title = "${data.title}", date = "${data.date}", description = "${data.description}", lat = "${data.lat}", lng = "${data.lng}", updateDate = "${now}"
      WHERE id = ${id} AND status = 1;
    `);
  }

  deleteLocal(id: string) {
    const result = new BehaviorSubject<any>('waiting');
    this.databaseService
      .executeQuery(`SELECT dir FROM auditory_evidences WHERE auditory_id = ${id}`)
      .subscribe(directories => {
        console.log(directories)
        if (directories !== 'waiting') {
          directories.values.forEach((dir: any) => {
            this.photoService.removeLocalAuditoryEvidence(dir.dir)
          });
          this.databaseService
            .executeQuery(`DELETE FROM auditory_evidences WHERE auditory_id = ${id}`)
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

      return result.pipe(take(2));
  }

}
