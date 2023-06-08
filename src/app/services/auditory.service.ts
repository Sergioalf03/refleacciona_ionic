import { Injectable } from '@angular/core';
import { HttpRequestService } from '../core/controllers/http-request.service';
import { DatabaseService } from '../core/controllers/database.service';

const BASE_URI = '/auditory';

@Injectable({
  providedIn: 'root'
})
export class AuditoryService {

  constructor(
    private httpService: HttpRequestService,
    private databaseService: DatabaseService,
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
    const now = new Date().toISOString();
    return this.databaseService.executeQuery(`
      DELETE FROM auditories
      WHERE id = ${id} AND status = 1;
    `);
  }

}
