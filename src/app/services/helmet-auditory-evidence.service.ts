import { Injectable } from '@angular/core';
import { DatabaseService } from '../core/controllers/database.service';
import { HttpRequestService } from '../core/controllers/http-request.service';

@Injectable({
  providedIn: 'root'
})
export class HelmetAuditoryEvidenceService {

  constructor(
    private databaseService: DatabaseService,
    private httpService: HttpRequestService,
  ) { }

  localSave(data: any) {
    const now = new Date().toISOString();
    return this.databaseService.executeQuery(`
      INSERT INTO helmet_auditory_evidences (helmet_auditory_id, dir, creation_date)
      VALUES (${data.auditoryId}, "${data.dir}", "${now}");
    `);
  }

  getEvidencesByAuditory(id: string) {
    return this.databaseService.executeQuery(`SELECT * FROM helmet_auditory_evidences WHERE helmet_auditory_id = ${id};`);
  }

  getLastInsertedDir() {
    return this.databaseService.executeQuery(`SELECT MAX(id) AS id, dir FROM helmet_auditory_evidences LIMIT 1;`);
  }

  localRemove(id: string) {
    return this.databaseService.executeQuery(`DELETE FROM helmet_auditory_evidences WHERE dir = "${id}";`);
  }

  uploadImage(blob: any, auditoryId: string, creationDate: string, dir: string) {
    let formData = new FormData();
    formData.append('image', blob);
    formData.append('helmet_auditory_id', auditoryId);
    formData.append('creation_date', creationDate);
    formData.append('dir', dir);

    return this.httpService
      .post('/no-urk', formData)
  }
}
