import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { GeneralCountAuditoryDetailPage } from './general-count-auditory-detail.page';
import { RouterModule, Routes } from '@angular/router';
import { MapModule } from 'src/app/components/map/map.module';

const routes: Routes = [
  {
    path: '',
    component: GeneralCountAuditoryDetailPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    MapModule,
  ],
  declarations: [GeneralCountAuditoryDetailPage]
})
export class GeneralCountAuditoryDetailPageModule {}
