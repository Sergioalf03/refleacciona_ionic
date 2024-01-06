import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HelmetCountFormPage } from './helmet-count-form.page';
import { RouterModule, Routes } from '@angular/router';
import { HeaderButtonsModule } from 'src/app/components/header-buttons/header-buttons.module';

const routes: Routes = [
  {
    path: '',
    component: HelmetCountFormPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    HeaderButtonsModule,
  ],
  declarations: [HelmetCountFormPage]
})
export class HelmetCountFormPageModule {}
