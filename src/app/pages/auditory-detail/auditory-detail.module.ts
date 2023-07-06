import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AuditoryDetailPage } from './auditory-detail.page';
import { RouterModule, Routes } from '@angular/router';
import { HeaderButtonsModule } from 'src/app/components/header-buttons/header-buttons.module';
import { MapModule } from 'src/app/components/map/map.module';

const routes: Routes = [
  {
    path: '',
    component: AuditoryDetailPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    HeaderButtonsModule,
    MapModule,
  ],
  declarations: [AuditoryDetailPage]
})
export class AuditoryDetailPageModule {}
