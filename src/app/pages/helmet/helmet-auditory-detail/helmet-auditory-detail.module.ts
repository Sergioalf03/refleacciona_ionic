import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HelmetAuditoryDetailPage } from './helmet-auditory-detail.page';
import { RouterModule, Routes } from '@angular/router';
import { HeaderButtonsModule } from 'src/app/components/header-buttons/header-buttons.module';
import { MapModule } from 'src/app/components/map/map.module';

const routes: Routes = [
  {
    path: '',
    component: HelmetAuditoryDetailPage
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
  declarations: [HelmetAuditoryDetailPage]
})
export class HelmetAuditoryDetailPageModule {}
