import { Injectable } from '@angular/core';
import { DatabaseService } from '../core/controllers/database.service';

@Injectable({
  providedIn: 'root'
})
export class AnswerEvidenceService {

  constructor(
    private databaseService: DatabaseService,
  ) { }

  localSave(data: any) {
    const now = new Date().toISOString();
    return this.databaseService.executeQuery(`
      INSERT INTO answer_evidences (answer_id, dir, creationDate)
      VALUES (${data.answerId}, "${data.dir}", "${now}");
    `);
  }

  getEvidencesByAuditory(id: string) {
    return this.databaseService.executeQuery(`SELECT * FROM answer_evidences WHERE answer_id = ${id};`);
  }

  getLastInsertedDir() {
    return this.databaseService.executeQuery(`SELECT MAX(id) AS id, dir FROM answer_evidences LIMIT 1;`);
  }

  localRemove(id: string) {
    return this.databaseService.executeQuery(`DELETE FROM answer_evidences WHERE dir = "${id}";`);
  }
}
