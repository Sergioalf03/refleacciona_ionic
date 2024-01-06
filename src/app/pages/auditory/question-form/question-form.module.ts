import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QuestionFormPage } from './question-form.page';
import { HeaderButtonsModule } from 'src/app/components/header-buttons/header-buttons.module';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: QuestionFormPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    HeaderButtonsModule,

  ],
  declarations: [QuestionFormPage]
})
export class QuestionFormPageModule {}
