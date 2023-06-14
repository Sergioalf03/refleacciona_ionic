import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QuestionFormPageRoutingModule } from './question-form-routing.module';

import { QuestionFormPage } from './question-form.page';
import { HeaderButtonsModule } from 'src/app/components/header-buttons/header-buttons.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QuestionFormPageRoutingModule,
    HeaderButtonsModule,
  ],
  declarations: [QuestionFormPage]
})
export class QuestionFormPageModule {}
