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
      INSERT INTO answer_evidences (auditory_id, question_id, dir, creationDate)
      VALUES (${data.auditoryId}, ${data.questionId}, "${data.dir}", "${now}");
    `);
  }

  getEvidencesByAuditoryAndQuestion(auditoryId: string, questionId: string) {
    return this.databaseService.executeQuery(`SELECT * FROM answer_evidences WHERE auditory_id = ${auditoryId} AND question_id = ${questionId};`);
  }

  getLastInsertedDir() {
    return this.databaseService.executeQuery(`SELECT MAX(id) AS id, dir FROM answer_evidences LIMIT 1;`);
  }

  localRemove(id: string) {
    return this.databaseService.executeQuery(`DELETE FROM answer_evidences WHERE dir = "${id}";`);
  }
}
