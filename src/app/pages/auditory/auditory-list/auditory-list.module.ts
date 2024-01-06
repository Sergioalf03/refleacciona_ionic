import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';

import { AuditoryListPage } from './auditory-list.page';
import { HeaderButtonsModule } from 'src/app/components/header-buttons/header-buttons.module';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: AuditoryListPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes),
    HeaderButtonsModule,
  ],
  declarations: [AuditoryListPage]
})
export class AuditoryListPageModule {}
