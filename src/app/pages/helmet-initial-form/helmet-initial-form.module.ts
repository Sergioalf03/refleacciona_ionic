import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HelmetInitialFormPage } from './helmet-initial-form.page';
import { RouterModule, Routes } from '@angular/router';
import { MapModule } from 'src/app/components/map/map.module';
import { HeaderButtonsModule } from 'src/app/components/header-buttons/header-buttons.module';

const routes: Routes = [
  {
    path: '',
    component: HelmetInitialFormPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    MapModule,
    HeaderButtonsModule,
  ],
  declarations: [HelmetInitialFormPage]
})
export class HelmetInitialFormPageModule {}
