import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';

import { HelmetInitialFormPage } from './helmet-initial-form.page';
import { RouterModule, Routes } from '@angular/router';
import { GenericInitialFormPageModule } from 'src/app/components/generic-initial-form/generic-initial-form.module';

const routes: Routes = [
  {
    path: '',
    component: HelmetInitialFormPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes),
    GenericInitialFormPageModule,
  ],
  declarations: [HelmetInitialFormPage]
})
export class HelmetInitialFormPageModule {}
