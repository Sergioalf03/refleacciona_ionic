import { Injectable } from '@angular/core';
import { BehaviorSubject, take } from 'rxjs';
import { DatabaseService } from '../core/controllers/database.service';

@Injectable({
  providedIn: 'root'
})
export class AnswerService {

  constructor(
    private databaseService: DatabaseService,
  ) { }

  getAnswersBySection(auditoryId: string, sectionId: string) {
    return this.databaseService
      .executeQuery(`SELECT * FROM answers JOIN questions on questions.id = answers.question_id;`)
      // .executeQuery(`SELECT * FROM answers JOIN questions on questions.id = answers.question_id WHERE answers.auditory_id = ${auditoryId} AND questions.section_id = ${sectionId};`)
  }

  saveAnswer(questionId: string, auditoryId: string, value: any) {
    const result = new BehaviorSubject<any>('waiting');
    this.databaseService
      .executeQuery(`SELECT * FROM answers WHERE auditory_id = ${auditoryId} AND question_id = ${questionId};`)
      .subscribe(answers => {
        if (answers !== 'waiting') {
          console.log(answers);
          const now = new Date().toISOString();
          if (answers.values.length === 0) {
            this.databaseService
              .executeQuery(`INSERT INTO answers (auditory_id, question_id, value, creationDate, updateDate) VALUES (${auditoryId}, ${questionId}, "${value}", "${now}", "${now}");`)
              .subscribe(rm => {
                if (rm !== 'waiting') {
                  result.next('saved')
                }
              });
          } else {
            this.databaseService
              .executeQuery(`UPDATE answers SET value="${value}", updateDate="${now}" WHERE auditory_id = ${auditoryId} AND question_id = ${questionId};`)
              .subscribe(rm => {
                if (rm !== 'waiting') {
                  result.next('updated')
                }
              });
          }
        }
      });

    return result.pipe(take(2));
  }

}
