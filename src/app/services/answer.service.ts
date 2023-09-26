import { Injectable } from '@angular/core';
import { BehaviorSubject, take } from 'rxjs';
import { DatabaseService } from '../core/controllers/database.service';
import { DATABASE_WAITING_MESSAGE } from '../core/constants/message-code';

@Injectable({
  providedIn: 'root'
})
export class AnswerService {

  constructor(
    private databaseService: DatabaseService,
  ) { }

  getAnswersBySectionByAuditory(auditoryId: string) {
    return this.databaseService
      .executeQuery(`SELECT * FROM answers WHERE auditory_id = ${auditoryId};`)
  }

  getAnswersBySection(auditoryId: string, sectionId: string) {
    return this.databaseService
      .executeQuery(`SELECT * FROM answers JOIN questions on questions.id = answers.question_id WHERE answers.auditory_id = ${auditoryId} AND questions.section_id = ${sectionId};`)
  }

  saveAnswer(questionId: string, auditoryId: string, value: any) {
    const result = new BehaviorSubject<any>(DATABASE_WAITING_MESSAGE);
    this.databaseService
      .executeQuery(`SELECT * FROM answers WHERE auditory_id = ${auditoryId} AND question_id = ${questionId};`)
      .subscribe(answers => {
        if (answers !== DATABASE_WAITING_MESSAGE) {
          setTimeout(() => {
            const now = new Date().toISOString();
            if (answers.values.length === 0) {
              this.databaseService
                .executeQuery(`INSERT INTO answers (auditory_id, question_id, value, creation_date, update_date) VALUES (${auditoryId}, ${questionId}, "${value}", "${now}", "${now}");`)
                .subscribe(rm => {
                  if (rm !== DATABASE_WAITING_MESSAGE) {
                    result.next('saved')
                  }
                });
            } else {
              this.databaseService
                .executeQuery(`UPDATE answers SET value="${value}", update_date="${now}" WHERE auditory_id = ${auditoryId} AND question_id = ${questionId};`)
                .subscribe(rm => {
                  if (rm !== DATABASE_WAITING_MESSAGE) {
                    result.next('updated')
                  }
                });
            }
          }, 20);
        }
      });

    return result.pipe(take(2));
  }

  deleteAnswersByAuditory(id: string) {
    return this.databaseService
      .executeQuery(`DELETE FROM answers WHERE auditory_id = ${id};`);
  }

  deleteAnswer(questionId: string, auditoryId: string) {
    return this.databaseService
      .executeQuery(`DELETE FROM answers WHERE auditory_id = ${auditoryId} AND question_id = ${questionId};`);
  }

  answerExists(questionId: string, auditoryId: string) {
    return this.databaseService
      .executeQuery(`SELECT answers.value FROM answers JOIN questions on questions.id = answers.question_id WHERE answers.auditory_id = ${auditoryId} AND questions.uid = ${questionId};`)
  }

}
