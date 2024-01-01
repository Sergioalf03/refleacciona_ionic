import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { GeneralCountAuditoryFormPage } from './general-count-auditory-form.page';
import { RouterModule, Routes } from '@angular/router';
import { MapModule } from 'src/app/components/map/map.module';
import { HeaderButtonsModule } from 'src/app/components/header-buttons/header-buttons.module';

const routes: Routes = [
  {
    path: '',
    component: GeneralCountAuditoryFormPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    MapModule,
    HeaderButtonsModule,
  ],
  declarations: [GeneralCountAuditoryFormPage]
})
export class GeneralCountAuditoryFormPageModule {}
