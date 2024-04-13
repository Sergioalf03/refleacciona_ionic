import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GenericInitialFormPage } from './generic-initial-form.page';
import { MapModule } from '../map/map.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    MapModule,
  ],
  declarations: [GenericInitialFormPage],
  exports: [GenericInitialFormPage],
})
export class GenericInitialFormPageModule {}
