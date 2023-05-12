import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';

import { AuditoryListPageRoutingModule } from './auditory-list-routing.module';

import { AuditoryListPage } from './auditory-list.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    AuditoryListPageRoutingModule
  ],
  declarations: [AuditoryListPage]
})
export class AuditoryListPageModule {}
