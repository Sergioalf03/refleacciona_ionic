import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionService } from 'src/app/services/question.service';

@Component({
  selector: 'app-question-form',
  templateUrl: './question-form.page.html',
})
export class QuestionFormPage implements OnInit {

  sectionId = '0';

  constructor(
    private questionService: QuestionService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.route
      .paramMap
      .subscribe({
        next: paramMap => {
          if (!paramMap.has('sectionId')) {
            this.router.navigateByUrl('/home');
          }

          this.sectionId = `${paramMap.get('sectionId')}`;

          this.questionService
            .getSection(this.sectionId)
            .subscribe({
              next: res1 => {
                console.log(res1);
                this.questionService
                  .getLocalQuestionsBySection(this.sectionId)
                  .subscribe({
                    next: res => console.log(res),
                  });
              }
            })
        }
      })
  }

}
