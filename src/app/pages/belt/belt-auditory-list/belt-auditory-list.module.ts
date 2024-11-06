import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';
import { BeltAuditoryListPage } from './belt-auditory-list.page';
import { RouterModule, Routes } from '@angular/router';
import { GenericListModule } from 'src/app/components/generic-list/generic-list.module';

const routes: Routes = [
  {
    path: '',
    component: BeltAuditoryListPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes),
    GenericListModule,
  ],
  declarations: [BeltAuditoryListPage]
})
export class BeltAuditoryListPageModule {}
