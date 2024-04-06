import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GenericInitialFormPage } from './generic-initial-form.page';
import { RouterModule, Routes } from '@angular/router';
import { MapModule } from '../map/map.module';

const routes: Routes = [
  {
    path: '',
    component: GenericInitialFormPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    MapModule,
  ],
  declarations: [GenericInitialFormPage],
  exports: [GenericInitialFormPage],
})
export class GenericInitialFormPageModule {}
