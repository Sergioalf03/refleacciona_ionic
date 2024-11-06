import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';
import { BeltInitialFormPage } from './belt-initial-form.page';
import { RouterModule, Routes } from '@angular/router';
import { GenericInitialFormPageModule } from 'src/app/components/generic-initial-form/generic-initial-form.module';

const routes: Routes = [
  {
    path: '',
    component: BeltInitialFormPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes),
    GenericInitialFormPageModule,
  ],
  declarations: [BeltInitialFormPage]
})
export class BeltInitialFormPageModule {}
