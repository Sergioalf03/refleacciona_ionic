import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionService } from 'src/app/services/question.service';

@Component({
  selector: 'app-question-form',
  templateUrl: './question-form.page.html',
})
export class QuestionFormPage implements OnInit {

  sectionId = '0';
  sectionName = '';
  subsectionName  = '';
  openedPopover = 0;
  questions: any[] = [];
  loading = false;
  constructor(
    private questionService: QuestionService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {
    this.route
      .paramMap
      .subscribe({
        next: paramMap => {
          if (!paramMap.has('sectionId')) {
            this.router.navigateByUrl('/home');
          }

          this.sectionId = `${paramMap.get('sectionId')}`;

          this.fetchSection();
        }
      })
  }

  ionViewWillEnter() {
    const data = JSON.stringify([{ id: 1, text: 'hola' }, { id: 1, text: 'hola' }, { id: 1, text: 'hola' }]);
    console.log(data);
    const decode = JSON.parse(data);
    console.log(decode);
  }

  onNext() {
    if (this.sectionId !== '7') {
      this.sectionId = `${+this.sectionId + 1}`;
      this.fetchSection();
    }
  }

  onPrevious() {
    if (this.sectionId !== '1') {
      this.sectionId = `${+this.sectionId - 1}`;
      this.fetchSection();
    }
  }

  private fetchSection() {
    this.questionService
      .getSection(this.sectionId)
      .subscribe({
        next: res1 => {
          if (res1 !== 'waiting') {
            this.loading = true;
            const section = res1.values[0];
            this.sectionName = section.name;
            this.subsectionName = section.subname;
            this.questionService
              .getLocalQuestionsBySection(this.sectionId)
              .subscribe({
                next: res => {
                  if (res !== 'waiting') {
                    this.questions = res.values;
                    this.loading = false;
                  }
                },
              });
          }
        }
      })
  }

  jsonCast(jsonString: string) {
    const data = JSON.parse(jsonString);
    return data;
  }

}
