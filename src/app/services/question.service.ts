import { Injectable } from '@angular/core';
import { DatabaseService } from '../core/controllers/database.service';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {

  constructor(
    private dbService: DatabaseService,
  ) { }

  getLocalQuestions() {
    return this.dbService.executeQuery('SELECT * FROM questions;');
  }

  getSection(id: string) {
    return this.dbService.executeQuery(`SELECT * FROM sections WHERE id = ${id};`);
  }

  getSectionIds() {
    return this.dbService.executeQuery(`SELECT id FROM sections WHERE status = 1 ORDER BY indx ASC`);
  }

  getLocalQuestionsBySection(id: string, auditoryId: string) {
    return this.dbService.executeQuery(`SELECT questions.*, answers.value as answer, answer_evidences.dir FROM questions LEFT JOIN answers ON answers.question_id = questions.id AND answers.auditory_id = ${auditoryId} LEFT JOIN answer_evidences ON answer_evidences.question_id = questions.id AND answers.auditory_id = ${auditoryId} WHERE questions.section_id = ${id} AND (questions.status = 1 OR answers.id IS NOT NULL);`);
  }

  getPointsResume(auditoryId: string) {
    return this.dbService.executeQuery(`SELECT answers.value as answer FROM questions JOIN answers ON answers.question_id = questions.id AND answers.auditory_id = ${auditoryId} WHERE questions.score = "1";`);
  }

}
