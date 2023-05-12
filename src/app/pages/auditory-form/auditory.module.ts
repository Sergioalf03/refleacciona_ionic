import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AuditoryFormPageRoutingModule } from './auditory-routing.module';

import { AuditoryFormPage } from './auditory-form.page';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule,
    AuditoryFormPageRoutingModule
  ],
  declarations: [AuditoryFormPage]
})
export class AuditoryFormPageModule {}
