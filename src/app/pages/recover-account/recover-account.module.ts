import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RecoverAccountPage } from './recover-account.page';
import { HeaderButtonsModule } from 'src/app/components/header-buttons/header-buttons.module';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: RecoverAccountPage
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
  declarations: [RecoverAccountPage]
})
export class RecoverAccountPageModule {}
