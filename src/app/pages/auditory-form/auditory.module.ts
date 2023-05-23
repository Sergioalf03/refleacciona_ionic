import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AuditoryFormPageRoutingModule } from './auditory-routing.module';

import { AuditoryFormPage } from './auditory-form.page';
import { MapModule } from 'src/app/components/map/map.module';
import { HeaderButtonsModule } from 'src/app/components/header-buttons/header-buttons.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule,
    AuditoryFormPageRoutingModule,
    MapModule,
    HeaderButtonsModule,
  ],
  declarations: [AuditoryFormPage]
})
export class AuditoryFormPageModule {}
