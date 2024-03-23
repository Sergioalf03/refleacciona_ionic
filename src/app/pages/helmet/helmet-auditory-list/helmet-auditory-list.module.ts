import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { HelmetAuditoryListPage } from './helmet-auditory-list.page';
import { RouterModule, Routes } from '@angular/router';
import { HeaderButtonsModule } from 'src/app/components/header-buttons/header-buttons.module';
import { GenericListModule } from 'src/app/components/generic-list/generic-list.module';

const routes: Routes = [
  {
    path: '',
    component: HelmetAuditoryListPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes),
    HeaderButtonsModule,
    GenericListModule,

  ],
  declarations: [HelmetAuditoryListPage]
})
export class HelmetAuditoryListPageModule {}
