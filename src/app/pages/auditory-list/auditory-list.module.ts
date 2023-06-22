import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';

import { AuditoryListPageRoutingModule } from './auditory-list-routing.module';

import { AuditoryListPage } from './auditory-list.page';
import { HeaderButtonsModule } from 'src/app/components/header-buttons/header-buttons.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    AuditoryListPageRoutingModule,
    HeaderButtonsModule,
  ],
  declarations: [AuditoryListPage]
})
export class AuditoryListPageModule {}
