import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EmailConfirmationPage } from './email-confirmation.page';
import { RouterModule, Routes } from '@angular/router';
import { HeaderButtonsModule } from 'src/app/components/header-buttons/header-buttons.module';

const routes: Routes = [
  {
    path: '',
    component: EmailConfirmationPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    IonicModule,
    HeaderButtonsModule
  ],
  declarations: [EmailConfirmationPage]
})
export class EmailConfirmationPageModule {}
