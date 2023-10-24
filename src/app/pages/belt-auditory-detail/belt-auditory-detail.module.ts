import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BeltAuditoryDetailPageRoutingModule } from './belt-auditory-detail-routing.module';

import { BeltAuditoryDetailPage } from './belt-auditory-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BeltAuditoryDetailPageRoutingModule
  ],
  declarations: [BeltAuditoryDetailPage]
})
export class BeltAuditoryDetailPageModule {}
