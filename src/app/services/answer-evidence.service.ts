import { Injectable } from '@angular/core';
import { DatabaseService } from '../core/controllers/database.service';
import { HttpRequestService } from '../core/controllers/http-request.service';

@Injectable({
  providedIn: 'root'
})
export class AnswerEvidenceService {

  constructor(
    private databaseService: DatabaseService,
    private httpService: HttpRequestService,
  ) { }

  localSave(data: any) {
    const now = new Date().toISOString();
    return this.databaseService.executeQuery(`
      INSERT INTO answer_evidences (auditory_id, question_id, dir, creation_date)
      VALUES (${data.auditoryId}, ${data.questionId}, "${data.dir}", "${now}");
    `);
  }

  getEvidencesByAuditoryAndQuestion(auditoryId: string, questionId: string) {
    return this.databaseService.executeQuery(`SELECT * FROM answer_evidences WHERE auditory_id = ${auditoryId} AND question_id = ${questionId};`);
  }

  getEvidencesByAuditory(auditoryId: string) {
    return this.databaseService.executeQuery(`SELECT * FROM answer_evidences WHERE auditory_id = ${auditoryId};`);
  }

  getLastInsertedDir() {
    return this.databaseService.executeQuery(`SELECT MAX(id) AS id, dir FROM answer_evidences LIMIT 1;`);
  }

  localRemove(id: string) {
    return this.databaseService.executeQuery(`DELETE FROM answer_evidences WHERE dir = "${id}";`);
  }

  uploadImage(blob: any, auditoryId: string, questionId: string, creationDate: string, dir: string) {
    let formData = new FormData();
    formData.append('image', blob);
    formData.append('auditory_id', auditoryId);
    formData.append('question_id', questionId);
    formData.append('creation_date', creationDate);
    formData.append('dir', dir);

    return this.httpService
      .post('/auditory/upload-answer-evidence', formData)
  }

}
