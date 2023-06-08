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

}
