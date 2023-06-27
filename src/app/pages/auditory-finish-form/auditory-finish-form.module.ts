import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AuditoryFinishFormPageRoutingModule } from './auditory-finish-form-routing.module';

import { AuditoryFinishFormPage } from './auditory-finish-form.page';
import { HeaderButtonsModule } from 'src/app/components/header-buttons/header-buttons.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    AuditoryFinishFormPageRoutingModule,
    HeaderButtonsModule,
  ],
  declarations: [AuditoryFinishFormPage]
})
export class AuditoryFinishFormPageModule {}
