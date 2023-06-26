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

  getLocalQuestionsBySection(id: string, auditoryId: string) {
    return this.dbService.executeQuery(`SELECT questions.*, answers.value as answer FROM questions LEFT JOIN answers ON answers.question_id = questions.id AND answers.auditory_id = ${auditoryId} WHERE questions.section_id = ${id};`);
  }

}
