import { Injectable } from '@angular/core';
import { DatabaseService } from '../core/controllers/database.service';

@Injectable({
  providedIn: 'root'
})
export class AuditoryEvidenceService {

  constructor(
    private databaseService: DatabaseService,
  ) { }

  localSave(data: any) {
    const now = new Date().toISOString();
    return this.databaseService.executeQuery(`
      INSERT INTO auditory_evidences (auditory_id, dir, creationDate)
      VALUES (${data.auditoryId}, "${data.dir}", "${now}");
    `);
  }

  getEvidencesByAuditory(id: string) {
    return this.databaseService.executeQuery(`SELECT * FROM auditory_evidences WHERE auditory_id = ${id};`);
  }

  getLastInsertedDir() {
    return this.databaseService.executeQuery(`SELECT MAX(id) AS id, dir FROM auditory_evidences LIMIT 1;`);
  }

  localRemove(id: string) {
    return this.databaseService.executeQuery(`DELETE FROM auditory_evidences WHERE dir = "${id}";`);
  }

}
